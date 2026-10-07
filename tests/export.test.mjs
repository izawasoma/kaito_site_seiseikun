import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { autop } from "@wordpress/autop";
import vm from "node:vm";

/** Node 24で、Viteのエイリアス・TypeScript・CSS文字列読み込みをメモリ内で再現する。 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    const sourceRoot = new URL("../src/", import.meta.url);
    const isSourceImport = context.parentURL?.startsWith(sourceRoot.href);
    if (specifier.startsWith("@/") || (isSourceImport && specifier.startsWith("."))) {
      const target = specifier.startsWith("@/")
        ? new URL(specifier.slice(2), sourceRoot)
        : new URL(specifier, context.parentURL);
      if (!existsSync(fileURLToPath(target))) target.pathname += ".ts";
      return { url: target.href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith("?raw")) {
      return { format: "module", shortCircuit: true,
        source: `export default ${JSON.stringify(readFileSync(new URL(url), "utf8"))}` };
    }
    if (url.endsWith(".ts") && url.startsWith(new URL("../src/", import.meta.url).href)) {
      const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
      }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

const { renderDecoratedText, parseDecoratedText } = await import("../src/lib/export/renderDecoratedText.ts");
const { generateProjectCode } = await import("../src/lib/export/generateProjectCode.ts");
const { buildPreviewDocument } = await import("../src/components/preview/wordpress/buildPreviewDocument.ts");
const { previewEnvironments } = await import("../src/components/preview/wordpress/previewEnvironment.ts");
const { createPageSettings } = await import("../src/lib/createPageSettings.ts");
const { createTitleBlock } = await import("../src/lib/blocks/createTitleBlock.ts");
const { createTextBlock } = await import("../src/lib/blocks/createTextBlock.ts");
const { createSpeechBlock } = await import("../src/lib/blocks/createSpeechBlock.ts");
const { countDecoratedCharacters } = await import("../src/lib/export/countDecoratedCharacters.ts");
const { parseProject, parseProjectJson } = await import("../src/lib/project/parseProject.ts");
const { loadEditorSession, saveEditorSnapshot, PROJECT_STORAGE_KEY } = await import("../src/lib/project/projectStorage.ts");

test("色・太字・ルビの入れ子を標準HTMLへ変換する", () => {
  const source = '<red><bold><ruby="じゅうよう">重要</ruby></bold></red>';
  const result = parseDecoratedText(source);
  assert.deepEqual(result.errors, []);
  assert.equal(result.html, '<span style="color: #F35457"><strong style="font-weight: 700"><ruby>重要<rp>（</rp><rt>じゅうよう</rt><rp>）</rp></ruby></strong></span>');
  assert.match(renderDecoratedText('<blue>青</blue><green>緑</green><yellow>黄</yellow>'), /#3071B7.*#30B73E.*#E0B20C/);
});

test("任意のHTMLとルビ読みのHTMLを実行可能な形で出力しない", () => {
  const html = renderDecoratedText('<img src=x onerror=alert(1)><ruby="<script>&">漢字</ruby>');
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes("<script>"));
  assert.match(html, /<rt>&lt;script&gt;&amp;<\/rt>/);
  assert.equal(renderDecoratedText("A&B"), "A&amp;B");
});

test("未完・不正な入れ子・未定義タグ・不正ルビに問題箇所を返す", () => {
  for (const source of ["<red>赤", "</bold>", "<red><bold>文</red></bold>", "<unknown>文</unknown>", "<ruby=よみ>文</ruby>", "<ruby=\""]) {
    const result = parseDecoratedText(source);
    assert.ok(result.errors.length > 0, source);
    assert.match(result.errors[0], /文字目/);
  }
  assert.equal(renderDecoratedText("<red>赤"), "&lt;red&gt;赤");
  assert.equal(renderDecoratedText('<ruby="">漢字</ruby>'), "漢字");
});

test("大量の入れ子でも再帰によるスタックオーバーフローを起こさない", () => {
  const result = parseDecoratedText("<bold>".repeat(1500) + "文" + "</bold>".repeat(1500));
  assert.deepEqual(result.errors, []);
  assert.equal(result.html.match(/<strong /g).length, 1500);
});

test("生成順序は配列順に従い、入力データを変更しない", () => {
  const title = createTitleBlock();
  const text = createTextBlock();
  title.settings.text = "見出し";
  text.settings.text = "本文";
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [text, title] };
  const snapshot = structuredClone(project);
  const result = generateProjectCode(project);
  assert.ok(result.htmlCss.indexOf(text.id) < result.htmlCss.indexOf(title.id));
  assert.match(result.htmlCss, /<p class="conversation-text"/);
  assert.match(result.htmlCss, /<h2 class="conversation-title"/);
  assert.equal(result.javascript, "");
  assert.deepEqual(project, snapshot);
  assert.notEqual(createTextBlock().id, text.id);
});

test("文字設定を反映し、不正なサイズは表示用の規定値へ戻す", () => {
  const text = createTextBlock();
  text.settings.typography = { alignment: "right", fontFamily: "inherit", fontWeight: "extraBold", fontSize: "18.5" };
  let result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [text] });
  assert.match(result.htmlCss, /text-align: right; font-family: inherit; font-weight: 800; font-size: calc\(18\.5px \* var\(--conversation-scale, 1\)\)/);
  text.settings.typography.fontSize = "0; color:red";
  result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [text] });
  assert.match(result.htmlCss, /font-size: calc\(16px \* var\(--conversation-scale, 1\)\)/);
  assert.ok(!result.htmlCss.includes("0; color:red"));
});

test("autop適用後もCSS・連続改行・ルビを保持する", () => {
  const text = createTextBlock();
  text.settings.text = '一行目\r\n\r\n<ruby="に">二</ruby>行目\n末尾';
  const result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [text] });
  const formatted = autop(result.htmlCss);
  const styles = [...formatted.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  styles.forEach((style) => assert.ok(!/<\/?p\b|<br\b/.test(style[1])));
  assert.equal(formatted.match(/<br data-conversation-break="">/g).length, 3);
  assert.match(formatted, /<ruby>二<rp>（<\/rp><rt>に<\/rt>/);
  assert.equal(formatted.match(/<p\b/g).length, 1);
});

test("PC/SPで同じ本文を使用し、テーマ・外枠・viewportを切り替える", () => {
  const text = createTextBlock();
  text.settings.text = "共通本文";
  const result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [text] });
  const pc = buildPreviewDocument(result, "pc");
  const sp = buildPreviewDocument(result, "sp");
  assert.match(pc, /content="width=device-width, initial-scale=1"/);
  assert.match(sp, /content="width=730px,user-scalable=no"/);
  assert.match(pc, /class="main onecol hintpage"/);
  assert.match(sp, /class="contents">\s*<div class="hintpage">/);
  assert.ok(!sp.includes('class="main onecol hintpage"'));
  assert.ok(pc.includes(autop(result.htmlCss + "\n")));
  assert.ok(sp.includes(autop(result.htmlCss + "\n")));
  assert.ok(sp.includes("themes/scrap_sp/images/"));
  assert.ok(pc.includes("themes/scrap/images/"));
  assert.equal(previewEnvironments.sp.width, 730);
  assert.equal(previewEnvironments.pc.width, 1030);
});

test("ページ設定を出力し、個別の色装飾と18pxの余白を維持する", () => {
  const text = createTextBlock();
  text.settings.text = '通常<red>赤</red>';
  const pageSettings = createPageSettings();
  pageSettings.defaultTextColor = "#123456";
  pageSettings.displayMode = "tapFade";
  pageSettings.progressStorageKey = 'example" onmouseover="alert(1)';
  pageSettings.showLecture = true;
  const project = { schemaVersion: 1, pageSettings, blocks: [text] };
  const result = generateProjectCode(project);
  assert.match(result.htmlCss, /style="color: #123456; font-family:/);
  assert.match(result.htmlCss, /data-display-mode="tapFade"/);
  assert.match(result.htmlCss, /data-show-lecture="true"/);
  assert.match(result.htmlCss, /example&quot; onmouseover=&quot;alert\(1\)/);
  assert.ok(!result.htmlCss.includes(' onmouseover="'));
  assert.match(result.htmlCss, /<span style="color: #F35457">赤<\/span>/);
  assert.match(result.htmlCss, /margin: 0 0 calc\(18px \* var\(--conversation-scale, 1\)\)/);
  assert.match(result.htmlCss, /color: inherit/);
});

test("不正なページ文字色はCSSとして出力せず規定値を使用する", () => {
  const pageSettings = createPageSettings();
  pageSettings.defaultTextColor = 'red; background: url(https://example.com)';
  const result = generateProjectCode({ schemaVersion: 1, pageSettings, blocks: [] });
  assert.ok(!result.htmlCss.includes("example.com"));
  assert.match(result.htmlCss, /style="color: #333333;/);
  assert.equal(createPageSettings().showLecture, false);
  assert.equal(createPageSettings().displayMode, "normal");
});

test("個別の文字送り設定・同時表示・速度を出力する", () => {
  const title = createTitleBlock();
  const text = createTextBlock();
  title.settings.typewriter = false;
  text.settings.typewriter = true;
  text.simultaneous = true;
  const pageSettings = createPageSettings();
  pageSettings.displayMode = "rpg";
  pageSettings.typewriterInterval = 75;
  const result = generateProjectCode({ schemaVersion: 1, pageSettings, blocks: [title, text] });
  assert.match(result.htmlCss, /<h2[^>]*data-typewriter="false"/);
  assert.match(result.htmlCss, /<p[^>]*data-typewriter="true"[^>]*data-simultaneous="true"/);
  assert.match(result.htmlCss, /data-typewriter-interval="75"/);
  assert.ok(result.javascript.startsWith("<script>"));
});

test("autop後も実行コードが維持され、HTMLより先に読み込んでもDOM構築を待つ", () => {
  const pageSettings = createPageSettings();
  pageSettings.displayMode = "rpg";
  const result = generateProjectCode({ schemaVersion: 1, pageSettings, blocks: [createTitleBlock()] });
  const formatted = autop(result.htmlCss + "\n" + result.javascript);
  const script = formatted.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.equal(`<script>${script}</script>`, result.javascript);
  let onReady;
  const document = {
    readyState: "loading",
    addEventListener(event, callback) {
      if (event === "DOMContentLoaded") onReady = callback;
    },
    querySelectorAll: () => [],
  };
  vm.runInNewContext(script, { document, window: {} });
  assert.equal(typeof onReady, "function");
  onReady();
});

test("吹き出しの名前を本文より前に出力し、本文だけを文字送り対象にする", () => {
  const speech = createSpeechBlock();
  speech.settings.imageUrl = "https://example.com/character.png";
  speech.settings.characterName = "マーカス&仲間";
  speech.settings.text = '<ruby="ぼうけん">冒険</ruby>へ\n出発';
  speech.simultaneous = true;
  for (const variant of ["rpg", "normal", "rounded"]) {
    speech.settings.speechTheme = variant;
    const result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [speech] });
    assert.ok(result.htmlCss.includes(`class="conversation-speech conversation-speech--${variant}"`));
    assert.match(result.htmlCss, /data-typewriter="true" data-simultaneous="true"/);
    assert.ok(result.htmlCss.indexOf("マーカス&amp;仲間") < result.htmlCss.indexOf("data-typewriter-content>"));
    assert.match(result.htmlCss, /<img src="https:\/\/example.com\/character.png"/);
    const formatted = autop(result.htmlCss);
    assert.match(formatted, /<p class="conversation-speech-message" data-typewriter-content><ruby>/);
    assert.equal(formatted.match(/<p\b/g).length, 1);
    assert.match(formatted, /<br data-conversation-break="">/);
  }
});

test("吹き出しの名前はHTML化せず、画像に危険なURLを使用しない", () => {
  const speech = createSpeechBlock();
  speech.settings.characterName = '<img src=x onerror="alert(1)">';
  speech.settings.imageUrl = "javascript:alert(1)";
  const result = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [speech] });
  assert.ok(!result.htmlCss.includes("<img "));
  assert.ok(!result.htmlCss.includes("javascript:alert"));
  assert.ok(result.htmlCss.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
});

test("文字数は装飾とルビ読みを除き、絵文字は見た目の1文字として扱う", () => {
  assert.equal(countDecoratedCharacters('<red><ruby="かんじ">漢字</ruby></red>\n👨‍👩‍👧‍👦&'), 4);
  assert.equal(countDecoratedCharacters('<bold>あ</bold>'.repeat(100)), 100);
  assert.equal(countDecoratedCharacters("&lt;"), 4);
});

test("JSON往復で設定・順序・固定ID・キャラクタースナップショットを復元する", () => {
  const speech = createSpeechBlock();
  speech.settings.imageUrl = "https://example.com/character.png";
  speech.settings.characterName = "マーカス";
  speech.settings.text = '<ruby="ほぞん">保存</ruby>テスト';
  const title = createTitleBlock();
  title.settings.typewriter = false;
  title.settings.typography.fontSize = "";
  const text = createTextBlock();
  text.simultaneous = true;
  const pageSettings = createPageSettings();
  pageSettings.displayMode = "tapFade";
  pageSettings.typewriterInterval = 75;
  const project = { schemaVersion: 1, pageSettings, blocks: [text, speech, title] };
  const restored = parseProjectJson('\uFEFF' + JSON.stringify(project, null, 2));
  assert.deepEqual(restored, project);
  restored.blocks[1].settings.characterName = "変更";
  assert.equal(project.blocks[1].settings.characterName, "マーカス");
});

test("不正JSON・未対応バージョン・不正設定・重複IDを拒否する", () => {
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [createTitleBlock()] };
  assert.throws(() => parseProjectJson("{broken"), /解析できません/);
  assert.throws(() => parseProject({ ...project, schemaVersion: 99 }), /バージョン/);
  assert.throws(() => parseProject({ ...project, blocks: [project.blocks[0], project.blocks[0]] }), /重複/);
  const invalid = structuredClone(project);
  invalid.blocks[0].settings.typewriter = "true";
  assert.throws(() => parseProject(invalid), /個別文字送り/);
  invalid.blocks[0].type = "unsupported";
  assert.throws(() => parseProject(invalid), /読み込めない種類/);
  assert.throws(() => parseProject({ ...project, pageSettings: { ...project.pageSettings, displayMode: "unknown" } }), /表示モード/);
});

test("ページ設定や速度設定のなかった旧データを補完する", () => {
  const restored = parseProject({ schemaVersion: 1, blocks: [createTitleBlock()] });
  assert.deepEqual(restored.pageSettings, createPageSettings());
  const { typewriterInterval: omitted, ...oldSettings } = createPageSettings();
  assert.equal(omitted, 40);
  const restoredOldSettings = parseProject({ schemaVersion: 1, pageSettings: oldSettings, blocks: [] });
  assert.equal(restoredOldSettings.pageSettings.typewriterInterval, 40);
});

/** 実際のブラウザ保存領域に触れず、ストレージの成功・破損・例外を検証する。 */
function withStorage(storage, callback) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  try { callback(); }
  finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
}

test("自動保存から編集内容と選択中のブロックを復元する", () => {
  const entries = new Map();
  const storage = { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  withStorage(storage, () => {
    assert.equal(loadEditorSession().snapshot.project.blocks.length, 0);
    const block = createSpeechBlock();
    const snapshot = { project: { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] }, selectedBlockId: block.id };
    saveEditorSnapshot(snapshot);
    const restored = loadEditorSession();
    assert.deepEqual(restored.snapshot, snapshot);
    assert.equal(restored.error, "");
    assert.equal(restored.canSave, true);
    saveEditorSnapshot({ ...snapshot, selectedBlockId: "missing" });
    assert.equal(loadEditorSession().snapshot.selectedBlockId, null);
    assert.equal(entries.size, 1);
    assert.ok(entries.has(PROJECT_STORAGE_KEY));
  });
});

test("破損した自動保存は上書きせず、保存を停止して通知する", () => {
  let writes = 0;
  withStorage({ getItem: () => "{broken", setItem: () => { writes += 1; } }, () => {
    const restored = loadEditorSession();
    assert.equal(restored.canSave, false);
    assert.ok(restored.error.includes("復元できません"));
    assert.equal(writes, 0);
  });
});

test("ストレージの利用拒否や容量不足を検出する", () => {
  withStorage({ getItem() { throw new Error("Denied"); }, setItem() { throw new Error("Quota"); } }, () => {
    const restored = loadEditorSession();
    assert.equal(restored.canSave, false);
    assert.throws(() => saveEditorSnapshot(restored.snapshot), /Quota/);
  });
});

const { createBlock } = await import("../src/lib/blocks/createBlock.ts");
const { validateProject, validateBlock } = await import("../src/lib/project/validateProject.ts");

test("全8種類の初期データをJSON保存・復元でき、固定IDと順序を維持する", () => {
  const blocks = ["speech", "title", "text", "icon", "answer", "multiAnswer", "image", "button"].map(createBlock);
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  assert.equal(new Set(blocks.map((block) => block.id)).size, 8);
  const html = generateProjectCode(project).htmlCss;
  blocks.forEach((block) => assert.ok(html.includes(`data-block-id="${block.id}"`)));
});

test("回答・進行ボタンがあれば通常表示でもランタイムを出力する", () => {
  for (const type of ["answer", "multiAnswer", "button"]) {
    const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [createBlock(type)] };
    const code = generateProjectCode(project);
    assert.match(code.htmlCss, /data-lock="true"/);
    assert.match(code.javascript, /initializeAnswers/);
    const processed = autop(`${code.htmlCss}\n${code.javascript}`);
    const script = processed.match(/<script>([\s\S]*?)<\/script>/)[1];
    assert.equal(script, code.javascript.slice(8, -9));
    assert.doesNotThrow(() => new vm.Script(script));
  }
});

test("単一選択はselect、複数選択はcheckboxとなり、埋め込みJSONやラベルはHTMLとして実行しない", () => {
  const block = createBlock("answer");
  block.settings.answer.type = "single";
  block.settings.answer.choices = [{ id: "a", label: '<img src=x onerror="alert(1)">', correct: true }];
  block.settings.errorMessage = '</script><script>alert(1)</script>';
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] };
  const html = generateProjectCode(project).htmlCss;
  assert.match(html, /<select /);
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('</script>'));
  const configSource = html.match(/data-answer-config="([^"]*)"/)[1];
  const decode = (source) => source.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  assert.equal(JSON.parse(decode(configSource)).errorMessage, block.settings.errorMessage);
  block.settings.answer.type = "multiple";
  assert.match(generateProjectCode(project).htmlCss, /type="checkbox"/);
});

test("画像幅・カードの見出し本文・ボタン色を出力し、危険なURLを除く", () => {
  const image = createBlock("image"); image.settings.url = "https://example.com/a.png"; image.settings.width = 860;
  const icon = createBlock("icon"); icon.settings.title = "注意"; icon.settings.text = "本文";
  icon.settings.titleTypography.fontSize = "30"; icon.settings.typography.fontSize = "18";
  const button = createBlock("button"); button.settings.action = { type: "link", url: "javascript:alert(1)" };
  const html = generateProjectCode({ schemaVersion: 1, pageSettings: createPageSettings(), blocks: [image, icon, button] }).htmlCss;
  assert.match(html, /max-width:calc\(860px \* var\(--conversation-scale, 1\)\)/);
  assert.match(html, /font-size: calc\(30px \* var\(--conversation-scale, 1\)\)/);
  assert.match(html, /font-size: calc\(18px \* var\(--conversation-scale, 1\)\)/);
  assert.ok(!html.includes("javascript:alert"));
  assert.match(html, /data-conversation-action="link" data-allow-repeat="false" data-url=""/);
  assert.match(html, /\.guard-style\{display:block\}/);
});

test("未完成データは保存できるが、公開前には候補・ラベル・URL・独自タグを検証する", () => {
  const answer = createBlock("answer");
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [answer] };
  assert.doesNotThrow(() => parseProject(project));
  assert.ok(validateProject(project).some((error) => error.includes("キー名")));
  assert.ok(validateBlock(answer).some((error) => error.includes("正解候補")));
  answer.settings.answer.candidates = ["正解"];
  project.pageSettings.progressStorageKey = "episode-1";
  assert.deepEqual(validateProject(project), []);
  answer.settings.instruction = "<red>未完";
  assert.ok(validateBlock(answer).some((error) => error.includes("入力注意事項")));
  const multi = createBlock("multiAnswer"); multi.settings.answers = [];
  assert.ok(validateBlock(multi).some((error) => error.includes("1つ以上")));
});

test("JSONの選択肢ID重複・不正な解答形式・不正画像幅は読み込み時に拒否する", () => {
  const answer = createBlock("answer");
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [answer] };
  answer.settings.answer.choices = [{ id: "a", label: "a", correct: true }, { id: "a", label: "b", correct: false }];
  assert.throws(() => parseProject(project), /選択肢ID/);
  answer.settings.answer.choices = []; answer.settings.answer.type = "unknown";
  assert.throws(() => parseProject(project), /入力形式/);
  const image = createBlock("image"); image.settings.width = 999;
  assert.throws(() => parseProject({ ...project, blocks: [image] }), /画像幅/);
});

const { japaneseFonts } = await import("../src/lib/fonts/japaneseFonts.ts");

test("日本語フォント全68種類をページ・ブロックに指定し、JSONから復元できる", () => {
  assert.equal(japaneseFonts.length, 68);
  for (const font of japaneseFonts) {
    const title = createTitleBlock(); title.settings.typography.fontFamily = font.family;
    const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), defaultFontFamily: font.family }, blocks: [title] };
    assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
    const html = generateProjectCode(project).htmlCss;
    assert.ok(html.includes(`family=${encodeURIComponent(font.family).replaceAll("%20", "+")}:wght@${font.weights}`), font.family);
    assert.ok(html.includes(`font-family: &#39;${font.family}&#39;`), font.family);
  }
});

test("フォントは使用した種類だけを重複なく読み込み、カードのタイトル指定も含める", () => {
  const icon = createBlock("icon");
  icon.settings.titleTypography.fontFamily = "Noto Serif JP";
  icon.settings.typography.fontFamily = "BIZ UDGothic";
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [icon] };
  const html = generateProjectCode(project).htmlCss;
  assert.match(html, /family=Noto\+Sans\+JP:wght@100\.\.900/);
  assert.match(html, /family=Noto\+Serif\+JP:wght@200\.\.900/);
  assert.match(html, /family=BIZ\+UDGothic:wght@400;700/);
  assert.ok(!html.includes("family=Zen+Maru+Gothic"));
  assert.equal((html.match(/family=Noto\+Sans\+JP/g) || []).length, 1);
  assert.match(html, /icon_names=progress_activity/);
});

test("プレビュー全解除は文書側の属性で切り替え、書き出しやJSONへ混入しない", () => {
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [createBlock("answer")] };
  const code = generateProjectCode(project);
  assert.match(buildPreviewDocument(code, "sp", true), /data-conversation-preview-unlock="true"/);
  assert.match(buildPreviewDocument(code, "sp", false), /data-conversation-preview-unlock="false"/);
  assert.ok(!code.htmlCss.includes("data-conversation-preview-unlock"));
  assert.ok(!JSON.stringify(project).includes("unlock"));
});


test("スマホの730px viewportでは文字倍率1.5を適用し、プレビューのPC指定は1倍を優先する", () => {
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [createTitleBlock(), createTextBlock(), createSpeechBlock(), createBlock("icon"), createBlock("answer"), createBlock("multiAnswer"), createBlock("button")] };
  const before = JSON.stringify(project);
  const code = generateProjectCode(project);
  assert.match(code.htmlCss, /@media \(max-width: 767px\)\s*\{\s*\.conversation-page \{ --conversation-scale: 1.5;/);
  assert.match(code.htmlCss, /html\[data-conversation-preview-device="pc"\] \.conversation-page \{\s*--conversation-scale: 1;/);
  assert.match(code.htmlCss, /html\[data-conversation-preview-device="sp"\] \.conversation-page \{\s*--conversation-scale: 1.5;/);
  assert.ok(!code.htmlCss.includes('.conversation-advance[data-device="sp"]'));
  assert.equal(JSON.stringify(project), before);
});


const { availableFontWeights, supportedFontWeight } = await import("../src/lib/fonts/fontWeights.ts");

test("フォントの提供ウェイトだけを候補にし、非対応値は最も近い提供値へ補正する", () => {
  assert.deepEqual(availableFontWeights("BIZ UDGothic"), ["regular", "bold"]);
  assert.deepEqual(availableFontWeights("Zen Maru Gothic"), ["light", "regular", "medium", "bold", "black"]);
  assert.equal(availableFontWeights("Noto Sans JP").length, 9);
  assert.equal(supportedFontWeight("BIZ UDGothic", "medium"), "regular");
  assert.equal(supportedFontWeight("BIZ UDGothic", "black"), "bold");
  const block = createTextBlock(); block.settings.typography.fontFamily = "inherit";
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), defaultFontFamily: "BIZ UDGothic" }, blocks: [block] };
  assert.match(generateProjectCode(project).htmlCss, /font-family: inherit; font-weight: 400;/);
});

test("文字送り後の自動表示設定を保存・出力し、旧データではOFFに補完する", () => {
  const block = createTextBlock(); block.afterPreviousTyping = true;
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] };
  assert.equal(parseProject(project).blocks[0].afterPreviousTyping, true);
  assert.match(generateProjectCode(project).htmlCss, /data-after-previous-typing="true"/);
  delete block.afterPreviousTyping;
  assert.equal(parseProject(project).blocks[0].afterPreviousTyping, false);
});


test("新規タイトル・テキストはページのフォント設定を引き継ぐ", () => {
  assert.equal(createTitleBlock().settings.typography.fontFamily, "inherit");
  assert.equal(createTextBlock().settings.typography.fontFamily, "inherit");
});


test("フォントとアイコンは専用styleの@importで読み込み、本文CSSのガードを先頭に保つ", () => {
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [createTextBlock()] };
  const html = generateProjectCode(project).htmlCss;
  assert.ok(!html.includes("<link"));
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((match) => match[1]);
  assert.equal(styles.length, 2);
  assert.ok(html.startsWith("<style>.guard-style{display:block}"));
  assert.ok(styles[1].startsWith('@import url("https://fonts.googleapis.com/'));
  assert.match(styles[1], /family=Material\+Icons/);
  assert.match(styles[1], /family=Material\+Symbols\+Outlined&icon_names=progress_activity&display=block/);
  assert.ok(!styles[1].includes("&amp;"));
  assert.ok(styles[0].startsWith(".guard-style{display:block}"));
  const formatted = autop(html);
  for (const style of styles) assert.ok(formatted.includes(`<style>${style}</style>`));
});

const { defaultLectureText, usesReaderProgress } = await import("../src/lib/project/pageHelp.ts");

test("レクチャーはONのとき本文の先頭に出力し、任意HTMLは実行させない", () => {
  const block = createTextBlock();
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), showLecture: true, lectureText: '案内\n<script>alert(1)</script>' }, blocks: [block] };
  const html = generateProjectCode(project).htmlCss;
  assert.ok(html.indexOf('<aside class="conversation-lecture"') < html.indexOf(`data-block-id="${block.id}"`));
  assert.match(html, /案内<br data-conversation-break="">&lt;script&gt;/);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  project.pageSettings.showLecture = false;
  assert.ok(!generateProjectCode(project).htmlCss.includes('<aside class="conversation-lecture"'));
});

test("レクチャー本文と削除ボタン設定を保存し、旧JSONには初期文言・OFFを補う", () => {
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), lectureText: "独自の案内", showProgressReset: true }, blocks: [] };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  delete project.pageSettings.lectureText;
  delete project.pageSettings.showProgressReset;
  const restored = parseProject(project);
  assert.equal(restored.pageSettings.lectureText, defaultLectureText);
  assert.equal(restored.pageSettings.showProgressReset, false);
});

test("進捗削除ボタンは対象構成・キー・ON設定が揃う場合だけ本文末尾に出力する", () => {
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), displayMode: "rpg", showProgressReset: true, progressStorageKey: "episode" }, blocks: [createTextBlock()] };
  let html = generateProjectCode(project).htmlCss;
  assert.ok(html.indexOf('data-progress-footer') > html.indexOf(`data-block-id="${project.blocks[0].id}"`));
  assert.match(html, /このページの進捗を削除/);
  project.pageSettings.progressStorageKey = "";
  assert.ok(!generateProjectCode(project).htmlCss.includes('data-progress-footer'));
  project.pageSettings.progressStorageKey = "episode";
  project.pageSettings.displayMode = "normal";
  assert.equal(usesReaderProgress(project), false);
  assert.ok(!generateProjectCode(project).htmlCss.includes('data-progress-footer'));
  project.blocks.push(createBlock("answer"));
  assert.equal(usesReaderProgress(project), true);
  html = generateProjectCode(project).htmlCss;
  assert.ok(html.includes('data-progress-footer'));
  project.pageSettings.showProgressReset = false;
  assert.ok(!generateProjectCode(project).htmlCss.includes('data-progress-footer'));
});

const { getDefaultLectureText, updateDefaultLecture } = await import("../src/lib/project/pageHelp.ts");

test("レクチャーは選択した表示モードだけを案内し、編集済み本文はモード変更で上書きしない", () => {
  const headings = { normal: "画面を下へスクロールしながら", scroll: "画面を下へスクロールすると", tap: "続きが表示されます。", tapFade: "続きがふわっと表示されます。", rpg: "文章が一文字ずつ表示されます。" };
  for (const [mode, heading] of Object.entries(headings)) {
    const text = getDefaultLectureText(mode);
    assert.ok(text.includes(heading));
    for (const other of Object.values(headings).filter((value) => value !== heading)) assert.ok(!text.includes(other));
    assert.ok(text.includes("最新版のSafari、Google Chromeをご利用ください"));
    assert.ok(!text.includes("設定によって"));
    assert.ok(!text.includes("進行ボタン"));
    assert.ok(!text.includes("Microsoft Edge"));
    assert.ok(!text.includes("Firefox"));
  }
  assert.equal(updateDefaultLecture(getDefaultLectureText("normal"), "normal", "rpg"), getDefaultLectureText("rpg"));
  assert.equal(updateDefaultLecture("独自の案内", "normal", "rpg"), "独自の案内");
});

test("回答欄の前後文章と正解文言を保存し、古いJSONには初期値を補う", () => {
  const block = createBlock("answer");
  block.settings.answer.beforeText = "あと";
  block.settings.answer.afterText = "分待つ";
  block.settings.successMessage = "その通り！";
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  delete block.settings.answer.beforeText;
  delete block.settings.answer.afterText;
  delete block.settings.successMessage;
  const restored = parseProject(project).blocks[0].settings;
  assert.equal(restored.answer.beforeText, "");
  assert.equal(restored.answer.afterText, "");
  assert.equal(restored.successMessage, "正解です");
});

test("短文・セレクトの前後文章は安全に出力し、空欄と複数選択では表示しない", async () => {
  const { renderAnswerHtml } = await import("../src/lib/export/blocks/renderAnswerHtml.ts");
  const block = createBlock("answer");
  block.settings.answer.beforeText = "<script>";
  block.settings.answer.afterText = "まで待つ";
  for (const type of ["text", "single"]) {
    block.settings.answer.type = type;
    const html = renderAnswerHtml(block);
    assert.match(html, /conversation-answer-before">&lt;script&gt;<\/div>/);
    assert.match(html, /conversation-answer-after">まで待つ<\/div>/);
    assert.ok(!html.includes("<script>"));
  }
  block.settings.answer.type = "multiple";
  assert.ok(!renderAnswerHtml(block).includes("conversation-answer-before"));
  assert.ok(!renderAnswerHtml(block).includes("conversation-answer-after"));
  block.settings.answer.type = "text";
  block.settings.answer.beforeText = "";
  block.settings.answer.afterText = "";
  assert.ok(!renderAnswerHtml(block).includes("conversation-answer-before"));
  assert.ok(!renderAnswerHtml(block).includes("conversation-answer-after"));
});


test("wpautop適用後も入力欄の前後文章が段落に囲まれず、同じ行の列指定を維持する", async () => {
  const { renderAnswerHtml } = await import("../src/lib/export/blocks/renderAnswerHtml.ts");
  for (const blockType of ["answer", "multiAnswer"]) {
    for (const inputType of ["text", "single"]) {
      const block = createBlock(blockType);
      const field = blockType === "answer" ? block.settings.answer : block.settings.answers[0];
      field.type = inputType;
      field.beforeText = "あと";
      field.afterText = "まで待つ";
      const formatted = autop(renderAnswerHtml(block));
      assert.match(formatted, /<div class="conversation-answer-before">あと<\/div>/);
      assert.match(formatted, /<div class="conversation-answer-after">まで待つ<\/div>/);
      const fieldsHtml = formatted.slice(formatted.indexOf('<div class="conversation-answer-fields"'), formatted.indexOf('<button'));
      assert.ok(!/<p>\s*<(?:div|span) class="conversation-answer-(?:before|after)"/.test(fieldsHtml), "前後文章を段落で囲まないこと");
      assert.ok(!/<\/div>\s*<p>\s*<(?:div|span) class="conversation-answer-input"/.test(fieldsHtml), "入力欄を段落で囲まないこと");
    }
  }
});

test("テキストのRPGデザインは個別に保存でき、旧JSONと新規作成は通常表示になる", async () => {
  const { renderTextHtml } = await import("../src/lib/export/blocks/renderTextHtml.ts");
  const block = createTextBlock();
  assert.equal(block.settings.textTheme, "normal");
  assert.ok(!renderTextHtml(block).includes("conversation-text--rpg"));
  block.settings.textTheme = "rpg";
  block.settings.text = "メッセージ";
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  const html = autop(renderTextHtml(block));
  assert.match(html, /class="conversation-text conversation-text--rpg"/);
  assert.match(html, /data-typewriter="true"/);
  assert.match(html, />メッセージ<\/p>/);
  delete block.settings.textTheme;
  assert.equal(parseProject(project).blocks[0].settings.textTheme, "normal");
});


test("再実行設定と正解後ラベルを保存し、旧データではOFF・次へを補う", () => {
  const blocks = ["answer", "multiAnswer", "button"].map(createBlock);
  for (const block of blocks) {
    assert.equal(block.settings.action.allowRepeat, false);
    block.settings.action = { type: "link", url: "https://example.com/next", allowRepeat: true };
    if (block.type !== "button") block.settings.successLabel = "続きへ";
  }
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  for (const block of blocks) {
    delete block.settings.action.allowRepeat;
    delete block.settings.successLabel;
  }
  for (const block of parseProject(project).blocks) {
    assert.equal(block.settings.action.allowRepeat, false);
    if (block.type !== "button") assert.equal(block.settings.successLabel, "次へ");
  }
});

test("画像一括変更は画像と吹き出しだけを置換し、本文・リンク・元データを保持する", async () => {
  const { collectImageUrls, replaceProjectImageUrls } = await import("../src/lib/project/replaceImageUrls.ts");
  const before = "https://example.com/old.png", after = "https://example.com/new.png";
  const image = createBlock("image"); image.settings.url = before;
  const speech = createBlock("speech"); speech.settings.imageUrl = before;
  const button = createBlock("button"); button.settings.action.url = before;
  const text = createTextBlock(); text.settings.text = before;
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [image, speech, button, text] };
  const characters = [{ id: "c", registrationName: "登録", characterName: "名前", imageUrl: before }, { id: "d", registrationName: "別", characterName: "名前", imageUrl: after }];
  assert.deepEqual(collectImageUrls(project, characters), [before, after]);
  const updated = replaceProjectImageUrls(project, before, after);
  assert.equal(updated.blocks[0].settings.url, after);
  assert.equal(updated.blocks[1].settings.imageUrl, after);
  assert.equal(updated.blocks[2], button);
  assert.equal(updated.blocks[3], text);
  assert.equal(image.settings.url, before);
  assert.deepEqual(updated.blocks.map((block) => block.id), project.blocks.map((block) => block.id));
});

test("登録画像の一括変更は最新データのIDと名前を保ち、保存失敗を通知する", async () => {
  const { replaceCharacterImageUrls } = await import("../src/lib/characterStorage.ts");
  const originalStorage = globalThis.localStorage;
  let raw = JSON.stringify([{ id: "c", registrationName: "登録", characterName: "名前", imageUrl: "old" }]);
  try {
    globalThis.localStorage = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
    replaceCharacterImageUrls("old", "new");
    assert.deepEqual(JSON.parse(raw), [{ id: "c", registrationName: "登録", characterName: "名前", imageUrl: "new" }]);
    globalThis.localStorage.setItem = () => { throw new Error("quota"); };
    assert.throws(() => replaceCharacterImageUrls("new", "next"), /保存できません/);
    assert.equal(JSON.parse(raw)[0].imageUrl, "new");
  } finally { globalThis.localStorage = originalStorage; }
});

test("画像候補は編集データのみ・登録キャラクターのみのURLも含め、重複と空欄を除く", async () => {
  const { collectImageUrls } = await import("../src/lib/project/replaceImageUrls.ts");
  const image = createBlock("image"); image.settings.url = "https://example.com/page.png";
  const speech = createBlock("speech"); speech.settings.imageUrl = "https://example.com/shared.png";
  const duplicate = createBlock("image"); duplicate.settings.url = speech.settings.imageUrl;
  const empty = createBlock("image");
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [image, speech, duplicate, empty] };
  const characters = [speech.settings.imageUrl, "https://example.com/stored.png", "https://example.com/stored.png", ""].map((imageUrl, index) => ({ id: String(index), registrationName: "登録", characterName: "名前", imageUrl }));
  assert.deepEqual(collectImageUrls(project, characters), [image.settings.url, speech.settings.imageUrl, "https://example.com/stored.png"]);
  assert.deepEqual(collectImageUrls({ ...project, blocks: [] }, characters), [speech.settings.imageUrl, "https://example.com/stored.png"]);
  assert.deepEqual(collectImageUrls(project, []), [image.settings.url, speech.settings.imageUrl]);
});

test("コードブロックは改行・終了タグを保存し、HTMLへ実行コードを直接混入させない", () => {
  const block = createBlock("code");
  block.settings = { html: '<h1>例</h1>\n<script>console.log("HTML")</script>', css: 'body {color:red}\n/* CSS */', javascript: '// コメント\nconst text = "</script>";\nconsole.log(text);' };
  const project = { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [block] };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  const code = generateProjectCode(project);
  assert.ok(!code.htmlCss.includes("<iframe"));
  assert.match(code.htmlCss, /data-code-settings=/);
  assert.match(code.htmlCss, /data-typewriter="false"/);
  assert.ok(!code.htmlCss.includes('<h1>例</h1>'));
  const formatted = autop(code.htmlCss + '\n' + code.javascript);
  const runtime = formatted.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.equal(runtime, code.javascript.slice(8, -9));
  assert.doesNotThrow(() => new vm.Script(runtime));
});

test("コードCSSは解析した表示規則のみをブロックのscope内に配置する", () => {
  const source = readFileSync(new URL('../src/lib/export/runtime/codeBlocks.js', import.meta.url), 'utf8');
  const style = { type: 1, cssText: 'p, button { color: red; }' };
  const context = vm.createContext({ CSSRule: { STYLE_RULE: 1 }, CSSStyleSheet: class {
    replaceSync() { this.cssRules = [style, { type: 4, cssText: '@media (min-width: 600px) { p {color:red} }', cssRules: [style] }, { type: 3, cssText: '@import "outside.css";' }, { type: 5, cssText: '@font-face {font-family:outside}' }]; }
  } });
  vm.runInContext(source, context);
  const css = context.scopeConversationCss('input', '[data-block-id="example"]');
  assert.match(css, /^@scope \(\[data-block-id="example"\]\)/);
  assert.match(css, /@media/);
  assert.ok(!css.includes('outside'));
});

test("コードは同じページへ一度だけ配置し、JavaScriptの改行を維持する", () => {
  const source = readFileSync(new URL('../src/lib/export/runtime/codeBlocks.js', import.meta.url), 'utf8');
  const block = { dataset: { blockId: 'code1', codeSettings: JSON.stringify({ html: '<button>押す</button>', css: '', javascript: '// comment\nwindow.runs = (window.runs || 0) + 1;' }) }, nodes: [], append(node) { this.nodes.push(node); if (node.tag === 'script') vm.runInContext(node.textContent, context); }, prepend(node) { this.nodes.unshift(node); } };
  const document = { createElement(tag) { return tag === 'template' ? { content: { querySelectorAll: () => [] } } : { tag }; } };
  const context = vm.createContext({ document, window: {}, CSS: { escape: (value) => value }, CSSRule: { STYLE_RULE: 1 }, CSSStyleSheet: class { cssRules = []; replaceSync() {} } });
  vm.runInContext(source, context);
  const root = { querySelectorAll: () => [block] };
  context.initializeCodeBlocks(root);
  context.initializeCodeBlocks(root);
  assert.equal(context.window.runs, 1);
  assert.equal(block.nodes.filter((node) => node.tag === 'script').length, 1);
});

test("レクチャーのルビ・色・太字を変換し、装飾を保存・復元できる", () => {
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), showLecture: true, lectureText: '<red><bold><ruby="あそ">遊</ruby>び方</bold></red>\n本文' }, blocks: [createTitleBlock()] };
  assert.deepEqual(parseProjectJson(JSON.stringify(project)), project);
  const html = generateProjectCode(project).htmlCss;
  assert.match(html, /<ruby>遊<rp>（<\/rp><rt>あそ<\/rt>/);
  assert.match(html, /<strong style="font-weight: 700">/);
  assert.match(html, /<br data-conversation-break="">本文/);
});

test("レクチャー有効時だけ未完の装飾を公開前に検出する", () => {
  const project = { schemaVersion: 1, pageSettings: { ...createPageSettings(), showLecture: true, lectureText: '<bold>案内' }, blocks: [] };
  assert.ok(validateProject(project).some((error) => error.startsWith('レクチャー本文：')));
  project.pageSettings.showLecture = false;
  assert.ok(!validateProject(project).some((error) => error.startsWith('レクチャー本文：')));
});

test("回答ラベル・前後文章・各ボタン・キャラクター名にルビを出力する", async () => {
  const { renderAnswerHtml } = await import("../src/lib/export/blocks/renderAnswerHtml.ts");
  const { renderButtonHtml } = await import("../src/lib/export/blocks/renderVisualBlocks.ts");
  const { renderSpeechHtml } = await import("../src/lib/export/blocks/renderSpeechHtml.ts");
  const ruby = '<ruby="こたえ">答</ruby>';
  const answer = createBlock('answer');
  Object.assign(answer.settings, { submitLabel: ruby, successLabel: ruby, successMessage: ruby, errorMessage: '<img src=x onerror=alert(1)>' });
  Object.assign(answer.settings.answer, { label: ruby, beforeText: ruby, afterText: ruby });
  const html = renderAnswerHtml(answer);
  assert.match(html, /aria-label="答"/);
  assert.equal((html.match(/<ruby>/g) || []).length, 4);
  const attribute = html.match(/data-answer-config="([^"]*)"/)[1];
  const config = JSON.parse(attribute.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
  assert.match(config.successHtml, /<ruby>/);
  assert.match(config.successLabelHtml, /<ruby>/);
  assert.ok(!config.errorHtml.includes('<img'));
  answer.settings.answer.type = 'multiple';
  answer.settings.answer.choices = [{ id: 'a', label: ruby, correct: true }];
  assert.match(renderAnswerHtml(answer), /<span><ruby>/);
  const button = createBlock('button'); button.settings.text = ruby;
  assert.match(renderButtonHtml(button), /<ruby>/);
  const speech = createBlock('speech'); speech.settings.characterName = ruby;
  assert.match(renderSpeechHtml(speech), /conversation-speech-name"><ruby>/);
});
