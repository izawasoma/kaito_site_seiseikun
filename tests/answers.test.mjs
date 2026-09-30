import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = ["progressStorage", "answers", "progression", "pageHelp"].map((name) => readFileSync(new URL(`../src/lib/export/runtime/${name}.js`, import.meta.url), "utf8")).join("\n");

/** 実ブラウザとは別に、ストレージ・入力・イベントの制御を検証する最小DOM。 */
class Element {
  dataset = {};
  hidden = false;
  classes = new Set();
  classList = { add: (name) => this.classes.add(name), remove: (name) => this.classes.delete(name) };
  listeners = {};
  children = [];
  selectors = {};
  textContent = "";
  value = "";
  constructor(dataset = {}) { this.dataset = dataset; }
  querySelector(selector) { return this.selectors[selector] ?? null; }
  querySelectorAll(selector) { return this.selectors[selector] ?? []; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  setAttribute(name, value) { this[name] = value; }
}

function harness(saved = null, preview = false, unavailable = false) {
  const timers = [];
  const writes = [];
  const navigations = [];
  const context = vm.createContext({
    URL,
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); },
    document: { baseURI: "https://example.com/hint/page", documentElement: { dataset: { conversationPreviewDevice: preview ? "sp" : "" } } },
    window: { localStorage: {
      getItem: () => { if (unavailable) throw Error("denied"); return saved; },
      setItem: (key, value) => { if (unavailable) throw Error("quota"); writes.push({ key, value: JSON.parse(value) }); },
    }, location: { assign: (url) => navigations.push(url) } },
  });
  vm.runInContext(source, context);
  return { context, writes, navigations, timers, tick() { timers.shift()?.callback(); } };
}

test("回答は空白と全角カタカナを正規化し、正解候補側も同じ変換を行う", () => {
  const { context } = harness();
  const field = { type: "text", candidates: ["イ チ ゴ", "苺"] };
  assert.equal(context.isCorrectAnswer(field, "い　ち\nご"), true);
  assert.equal(context.isCorrectAnswer(field, "苺"), true);
  assert.equal(context.isCorrectAnswer(field, "りんご"), false);
  assert.equal(context.isCorrectAnswer({ ...field, candidates: [" "] }, "　"), false);
});

test("単一選択は正解1つ、複数選択は正解集合との過不足ない一致を必要とする", () => {
  const { context } = harness();
  const choices = [{ id: "a", correct: true }, { id: "b", correct: true }, { id: "c", correct: false }];
  const field = { type: "multiple", choices };
  assert.equal(context.isCorrectAnswer(field, ["b", "a"]), true);
  for (const value of [[], ["a"], ["a", "b", "c"], ["a", "a"]]) assert.equal(context.isCorrectAnswer(field, value), false);
  assert.equal(context.isCorrectAnswer({ type: "multiple", choices: [] }, []), false);
  assert.equal(context.isCorrectAnswer({ ...field, type: "single" }, "a"), false);
  assert.equal(context.isCorrectAnswer({ type: "single", choices: [choices[0], choices[2]] }, "a"), true);
});

test("進捗はIDごとに復元し、削除済みIDを保存から除き、現在の並び順でロックする", () => {
  const { context, writes } = harness(JSON.stringify({ version: 1, blocks: { old: { cleared: true }, b: { cleared: true, viewed: true }, d: { viewed: true, cleared: false } } }));
  const blocks = [new Element({ blockId: "a" }), new Element({ blockId: "d", lock: "true" }), new Element({ blockId: "b", lock: "true" })];
  const progress = context.createReaderProgress(new Element({ progressKey: "episode-01" }), blocks);
  assert.equal(progress.cleared(blocks[2]), true);
  assert.equal(context.getUnlockedLimit(blocks, progress), 1);
  progress.view(blocks[0]);
  assert.equal(writes[0].key, "conversation_progress_episode-01");
  assert.equal(Object.hasOwn(writes[0].value.blocks, "old"), false);
  progress.clear(blocks[1]);
  assert.equal(context.getUnlockedLimit(blocks, progress), 2);
});

test("破損データ・ストレージ拒否でも進行でき、プレビューでは永続保存しない", () => {
  for (const [saved, preview, unavailable] of [["{broken", false, false], [null, false, true], [null, true, false]]) {
    const { context, writes } = harness(saved, preview, unavailable);
    const block = new Element({ blockId: "a", lock: "true" });
    const progress = context.createReaderProgress(new Element({ progressKey: "x" }), [block]);
    assert.equal(progress.cleared(block), false);
    progress.clear(block);
    assert.equal(progress.cleared(block), true);
    if (preview || unavailable) assert.equal(writes.length, 0);
  }
});

for (const mode of ["normal", "scroll"]) {
  test(`${mode}：最初の未突破ロックまで表示し、突破後は次のロックまでを解放する`, () => {
    const { context } = harness();
    const blocks = [false, true, false, true, false].map((lock, index) => new Element({ blockId: String(index), lock: String(lock) }));
    const progress = context.createReaderProgress(new Element({ progressKey: "x" }), blocks);
    const controller = context.initializeStaticProgress(blocks, mode, progress);
    assert.deepEqual(blocks.map((block) => block.hidden), [false, false, true, true, true]);
    progress.clear(blocks[1]); controller.unlock();
    assert.deepEqual(blocks.map((block) => block.hidden), [false, false, false, false, true]);
    progress.clear(blocks[3]); controller.unlock();
    assert.ok(blocks.every((block) => !block.hidden));
  });
}

test("スクロール監視は未解放ブロックを含まず、解放後に監視へ追加する", () => {
  const { context } = harness();
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(element) { this.targets.add(element); }
    unobserve(element) { this.targets.delete(element); }
    disconnect() {}
  }
  context.window.IntersectionObserver = context.IntersectionObserver = Observer;
  const blocks = [new Element({ blockId: "a", lock: "true" }), new Element({ blockId: "b" })];
  const progress = context.createReaderProgress(new Element({ progressKey: "x" }), blocks);
  const controller = context.initializeStaticProgress(blocks, "scroll", progress);
  assert.equal(observers[0].targets.has(blocks[1]), false);
  observers[0].callback([{ target: blocks[0], isIntersecting: true }]);
  assert.equal(progress.viewed(blocks[0]), true);
  progress.clear(blocks[0]); controller.unlock();
  assert.equal(observers[1].targets.has(blocks[1]), true);
});

/** タイマーを進めながら回答フォームの画面状態を検証する。 */
function answerHarness(multiple = true, individual = true, saved = null, customFields = null) {
  const runtime = harness(saved);
  const fields = customFields ?? (multiple ? ["a", "b"] : ["a"]).map((id) => ({ id, type: "text", candidates: [id] }));
  const block = new Element({ blockId: "answer", lock: "true", answerConfig: JSON.stringify({ multiple, fields, action: { type: "next" }, individual, animation: "shake", errorMessage: "違います" }) });
  const feedback = new Element();
  const submit = new Element();
  const inputs = fields.map(() => new Element());
  const results = fields.map(() => new Element());
  const rows = fields.map((field, index) => {
    const row = new Element({ answerField: field.id });
    row.selectors["input, select"] = inputs[index];
    row.querySelectorAll = () => [inputs[index]];
    if (individual) row.selectors["[data-field-result]"] = results[index];
    return row;
  });
  block.selectors[".conversation-answer-feedback"] = feedback;
  block.selectors[".conversation-submit"] = submit;
  block.selectors["[data-answer-field]"] = rows;
  block.selectors["input, select, button"] = [...inputs, submit];
  const progress = runtime.context.createReaderProgress(new Element({ progressKey: "x" }), [block]);
  const unlocks = [];
  runtime.context.initializeAnswers([block], progress, () => unlocks.push(true));
  return { ...runtime, block, feedback, submit, inputs, results, rows, progress, unlocks, send() { block.listeners.submit({ preventDefault() {} }); } };
}

test("多答は2秒間回転アイコンを表示し、判定後に不正解欄だけを揺らす", () => {
  const form = answerHarness();
  form.inputs[0].value = "a"; form.inputs[1].value = "wrong";
  form.send();
  assert.equal(form.timers[0].delay, 2000);
  assert.ok(form.results.every((result) => result.innerHTML.includes("progress_activity")));
  assert.ok(form.inputs.every((input) => input.disabled));
  assert.equal(form.rows[1].classes.has("conversation-shake"), false);
  form.send();
  assert.equal(form.timers.length, 1, "判定中の二重送信を拒否する");
  form.tick();
  assert.deepEqual(form.results.map((result) => result.textContent), ["○", "×"]);
  assert.equal(form.inputs[0].disabled, true);
  assert.equal(form.inputs[1].disabled, false);
  assert.equal(form.rows[1].classes.has("conversation-shake"), true);
  assert.equal(form.unlocks.length, 0);
  form.inputs[1].value = "b"; form.send(); form.tick();
  assert.equal(form.unlocks.length, 1);
  assert.ok(form.inputs.every((input) => input.disabled));
  assert.equal(form.submit.disabled, true);
  form.send();
  assert.equal(form.timers.length, 0, "正解後は再送信できない");
});

for (const multiple of [false, true]) {
  test(`${multiple ? "多答" : "単一"}：連続不正解でもメッセージを消してから再表示する`, () => {
    const form = answerHarness(multiple, false);
    form.send(); form.tick();
    assert.equal(form.feedback.textContent, "違います");
    form.send();
    assert.equal(form.feedback.textContent, "");
    if (multiple) assert.match(form.feedback.innerHTML, /progress_activity/);
    form.tick();
    assert.equal(form.feedback.textContent, "違います");
    assert.equal(form.submit.disabled, false);
  });
}

test("単一回答も正解後に編集・送信を無効にし、再訪問時も固定する", () => {
  const form = answerHarness(false);
  form.inputs[0].value = "a"; form.send(); form.tick();
  assert.equal(form.inputs[0].disabled, true);
  assert.equal(form.submit.disabled, true);
  const restored = answerHarness(false, false, JSON.stringify({ version: 1, blocks: { answer: { viewed: true, cleared: true } } }));
  assert.equal(restored.inputs[0].disabled, true);
  assert.equal(restored.feedback.textContent, "正解です");
});

test("全ロック解除はプレビューだけで有効になり、正解状態や保存データを偽装しない", () => {
  for (const preview of [false, true]) {
    const { context, writes } = harness(null, preview);
    context.document.documentElement.dataset.conversationPreviewUnlock = "true";
    const blocks = [new Element({ blockId: "a", lock: "true" }), new Element({ blockId: "b", lock: "true" }), new Element({ blockId: "c" })];
    const progress = context.createReaderProgress(new Element({ progressKey: "x" }), blocks);
    assert.equal(context.getUnlockedLimit(blocks, progress), preview ? 2 : 0);
    context.initializeStaticProgress(blocks, "normal", progress);
    assert.equal(blocks[2].hidden, !preview);
    assert.equal(progress.cleared(blocks[0]), false);
    if (preview) assert.equal(writes.length, 0);
  }
});

test("非表示のボタンでは進めず、リンクは同一タブのHTTP(S)に限定する", () => {
  const { context, navigations } = harness();
  const block = new Element({ blockId: "button", lock: "true" });
  const button = new Element({ conversationAction: "next" });
  block.selectors["[data-conversation-action]"] = button;
  const progress = context.createReaderProgress(new Element({ progressKey: "x" }), [block]);
  let unlockCount = 0;
  context.initializeAnswers([block], progress, () => unlockCount++);
  block.hidden = true; button.listeners.click();
  assert.equal(unlockCount, 0);
  block.hidden = false; button.listeners.click();
  assert.equal(unlockCount, 1);
  context.navigateConversation("javascript:alert(1)");
  context.navigateConversation("data:text/html,x");
  assert.equal(navigations.length, 0);
  context.navigateConversation("../next");
  assert.deepEqual(navigations, ["https://example.com/next"]);
});


test("進捗削除は確認後にこのページのキーだけを削除し、再読み込み前の再保存を防ぐ", () => {
  const { context, writes } = harness();
  const removed = [];
  let reloads = 0;
  let confirmed = false;
  context.window.confirm = () => confirmed;
  context.window.localStorage.removeItem = (key) => removed.push(key);
  context.window.location.reload = () => reloads++;
  const block = new Element({ blockId: "a", lock: "true" });
  const root = new Element({ progressKey: "episode" });
  const button = new Element(); root.selectors["[data-progress-reset]"] = button;
  const progress = context.createReaderProgress(root, [block]);
  context.initializeProgressReset(root, progress);
  button.listeners.click();
  assert.equal(removed.length, 0);
  assert.equal(reloads, 0);
  confirmed = true; button.listeners.click();
  assert.deepEqual(removed, ["conversation_progress_episode"]);
  assert.equal(reloads, 1);
  progress.view(block);
  assert.equal(writes.length, 0);
});

test("進捗の削除に失敗したときは通知し、リロードしない", () => {
  const { context } = harness();
  const alerts = [];
  context.window.confirm = () => true;
  context.window.alert = (message) => alerts.push(message);
  context.window.localStorage.removeItem = () => { throw Error("denied"); };
  context.window.location.reload = () => assert.fail("リロードしない");
  const root = new Element({ progressKey: "episode" });
  const button = new Element(); root.selectors["[data-progress-reset]"] = button;
  const progress = context.createReaderProgress(root, []);
  context.initializeProgressReset(root, progress);
  button.listeners.click();
  assert.equal(alerts.length, 1);
});

test("プレビューの削除は親画面へ確認を依頼し、実サイトの保存領域を操作しない", () => {
  const { context } = harness(null, true);
  const messages = [];
  context.window.parent = { postMessage: (message) => messages.push(message) };
  context.window.confirm = () => assert.fail("sandbox内では確認を呼ばない");
  const root = new Element();
  const button = new Element(); root.selectors["[data-progress-reset]"] = button;
  context.initializeProgressReset(root, { reset: () => assert.fail("実ストレージへアクセスしない") });
  button.listeners.click();
  assert.equal(messages[0].type, "conversation-preview-reset-request");
});


test("正解の入力は候補や正規化後の表記に置換せず、そのまま保存・復元する", () => {
  const fields = [{ id: "answer", type: "text", candidates: ["せいかい", "セイカイ", "正解"] }];
  const form = answerHarness(false, true, null, fields);
  form.inputs[0].value = "せいかい";
  form.send(); form.tick();
  const saved = form.writes.at(-1).value;
  assert.equal(saved.blocks.answer.answers.answer, "せいかい");
  const restored = answerHarness(false, true, JSON.stringify(saved), fields);
  assert.equal(restored.inputs[0].value, "せいかい");
  assert.equal(restored.inputs[0].disabled, true);
  assert.equal(restored.submit.disabled, true);
  restored.send();
  assert.equal(restored.timers.length, 0);
});

test("多答の部分正解も入力を復元して固定し、不正解欄だけを編集できる", () => {
  const form = answerHarness();
  form.inputs[0].value = "a"; form.inputs[1].value = "違う";
  form.send(); form.tick();
  const restored = answerHarness(true, true, JSON.stringify(form.writes.at(-1).value));
  assert.equal(restored.inputs[0].value, "a");
  assert.equal(restored.inputs[0].disabled, true);
  assert.equal(restored.inputs[1].disabled, false);
  assert.equal(restored.submit.disabled, false);
  restored.inputs[1].value = "b";
  restored.send(); restored.tick();
  assert.equal(restored.unlocks.length, 1);
});

for (const action of ["next", "link"]) {
  test(`${action}ボタンは一度だけ実行し、保存から復元しても無効になる`, () => {
    const runtime = harness();
    const block = new Element({ blockId: "button", lock: String(action === "next") });
    const button = new Element({ conversationAction: action, url: "https://example.com/next" });
    block.selectors["[data-conversation-action]"] = button;
    const root = new Element({ progressKey: "episode" });
    const progress = runtime.context.createReaderProgress(root, [block]);
    let unlocks = 0;
    runtime.context.initializeAnswers([block], progress, () => unlocks++);
    button.listeners.click(); button.listeners.click();
    assert.equal(button.disabled, true);
    assert.equal(action === "next" ? unlocks : runtime.navigations.length, 1);
    const restoredRuntime = harness(JSON.stringify(runtime.writes.at(-1).value));
    const restoredProgress = restoredRuntime.context.createReaderProgress(root, [block]);
    restoredRuntime.context.initializeAnswers([block], restoredProgress, () => assert.fail("再実行しない"));
    button.listeners.click();
    assert.equal(button.disabled, true);
    assert.equal(restoredRuntime.navigations.length, 0);
  });
}

test("選択式の正解は選択肢IDを復元し、入力値をHTMLとして挿入しない", () => {
  const fields = [{ id: "answer", type: "single", choices: [{ id: "correct", label: "正解", correct: true }] }];
  const form = answerHarness(false, true, null, fields);
  form.inputs[0].value = "correct";
  form.send(); form.tick();
  const restored = answerHarness(false, true, JSON.stringify(form.writes.at(-1).value), fields);
  assert.equal(restored.inputs[0].value, "correct");
  assert.equal(restored.inputs[0].disabled, true);
});
