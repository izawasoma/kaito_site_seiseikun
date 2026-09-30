import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { autop } from "@wordpress/autop";

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
    if (url.endsWith(".css?raw")) {
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
const { createTitleBlock } = await import("../src/lib/blocks/createTitleBlock.ts");
const { createTextBlock } = await import("../src/lib/blocks/createTextBlock.ts");

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
  const project = { schemaVersion: 1, blocks: [text, title] };
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
  let result = generateProjectCode({ schemaVersion: 1, blocks: [text] });
  assert.match(result.htmlCss, /text-align: right; font-family: inherit; font-weight: 800; font-size: 18.5px/);
  text.settings.typography.fontSize = "0; color:red";
  result = generateProjectCode({ schemaVersion: 1, blocks: [text] });
  assert.match(result.htmlCss, /font-size: 16px/);
  assert.ok(!result.htmlCss.includes("0; color:red"));
});

test("autop適用後もCSS・連続改行・ルビを保持する", () => {
  const text = createTextBlock();
  text.settings.text = '一行目\r\n\r\n<ruby="に">二</ruby>行目\n末尾';
  const result = generateProjectCode({ schemaVersion: 1, blocks: [text] });
  const formatted = autop(result.htmlCss);
  const style = formatted.match(/<style>([\s\S]*?)<\/style>/)[1];
  assert.ok(!/<\/?p\b|<br\b/.test(style));
  assert.equal(formatted.match(/<br data-conversation-break="">/g).length, 3);
  assert.match(formatted, /<ruby>二<rp>（<\/rp><rt>に<\/rt>/);
  assert.equal(formatted.match(/<p\b/g).length, 1);
});

test("PC/SPで同じ本文を使用し、テーマ・外枠・viewportを切り替える", () => {
  const text = createTextBlock();
  text.settings.text = "共通本文";
  const result = generateProjectCode({ schemaVersion: 1, blocks: [text] });
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
