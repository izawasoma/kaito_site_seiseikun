import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const progressionSource = readFileSync(new URL("../src/lib/export/runtime/progression.js", import.meta.url), "utf8");

/** DOM描画を代替し、進行制御のタイマーとユーザー操作を決定的に検証する。 */
function createHarness(settings, mode = "rpg", previewDevice = "", coarsePointer = false, savedStates = {}) {
  class FakeElement {
    dataset = {};
    hidden = false;
    isConnected = true;
    children = [];
    listeners = {};
    textContent = "";
    classes = new Set();
    classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
    };
    constructor(tag = "div") { this.tag = tag; }
    append(...children) { this.children.push(...children); }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(event, callback) { this.listeners[event] = callback; }
    closest() { return this.tag === "button" || this.tag === "a" ? this : null; }
  }
  const root = new FakeElement();
  const blocks = settings.map((setting, index) => Object.assign(new FakeElement(), {
    dataset: { afterPreviousTyping: String(setting.afterPreviousTyping ?? false), blockId: setting.id ?? String(index), lock: String(setting.lock ?? false), typewriter: String(setting.typewriter ?? true), simultaneous: String(setting.simultaneous ?? false) },
    steps: setting.steps ?? 2,
  }));
  const controllers = [];
  const timers = new Map();
  let timerId = 0;
  const context = vm.createContext({
    Element: FakeElement,
    document: { createElement: (tag) => new FakeElement(tag), documentElement: { dataset: { conversationPreviewDevice: previewDevice } } },
    window: { getSelection: () => "", addEventListener() {}, matchMedia: () => ({ matches: coarsePointer }) },
    clearTimeout: (id) => timers.delete(id),
    setTimeout: (callback, delay) => {
      timers.set(++timerId, { callback, delay });
      return timerId;
    },
    prepareTypewriter(block) {
      const controller = {
        block, revealed: 0, finished: false,
        revealNext() { this.revealed += 1; return this.revealed >= block.steps; },
        finish() { this.finished = true; },
      };
      controllers.push(controller);
      return controller;
    },
  });
  vm.runInContext(progressionSource, context);
  const states = structuredClone(savedStates);
  const progress = {
    viewed: (block) => states[block.dataset.blockId]?.viewed === true,
    cleared: (block) => states[block.dataset.blockId]?.cleared === true,
    view(block) { states[block.dataset.blockId] = { ...states[block.dataset.blockId], viewed: true }; },
    clear(block) { states[block.dataset.blockId] = { ...states[block.dataset.blockId], cleared: true }; },
  };
  const controller = context.initializeTapProgress(root, blocks, mode, 40, progress);
  return {
    root, blocks, controllers, timers, context, FakeElement, progress, controller, states,
    click(target = root.children[0]) { root.listeners.click({ target }); },
    tick() {
      const firstTimer = timers.entries().next().value;
      if (!firstTimer) return;
      const [id, timer] = firstTimer;
      timers.delete(id);
      timer.callback();
    },
  };
}

test("タイトルOFF・テキストONを同時表示してもONだけ文字送りする", () => {
  const harness = createHarness([{ typewriter: false }, { typewriter: true, simultaneous: true }]);
  assert.equal(harness.controllers.length, 1);
  assert.equal(harness.controllers[0].block, harness.blocks[1]);
  assert.ok(harness.blocks.every((block) => !block.hidden));
  assert.equal(harness.timers.values().next().value.delay, 40);
});

test("タイトルON・テキストOFFの組み合わせも独立して判定する", () => {
  const harness = createHarness([{ typewriter: true }, { typewriter: false, simultaneous: true }]);
  assert.equal(harness.controllers.length, 1);
  assert.equal(harness.controllers[0].block, harness.blocks[0]);
});

test("文字送り途中のタップは現在のグループだけを完成し、次のタップで進む", () => {
  const harness = createHarness([{}, { simultaneous: true }, { typewriter: false }]);
  harness.click();
  assert.ok(harness.controllers.every((controller) => controller.finished));
  assert.equal(harness.blocks[2].hidden, true);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.root.children[0].children[1].textContent, "クリックで次へ");
  harness.click();
  assert.equal(harness.blocks[2].hidden, false);
  assert.equal(harness.root.children[0].hidden, true);
});

test("同一グループの文字送りは順番に実行し、完了しても自動では次へ進まない", () => {
  const harness = createHarness([{ steps: 1 }, { simultaneous: true, steps: 1 }, {}]);
  harness.tick();
  assert.equal(harness.controllers[0].revealed, 1);
  assert.equal(harness.controllers[1].revealed, 0);
  harness.tick();
  assert.equal(harness.controllers[1].revealed, 1);
  assert.equal(harness.blocks[2].hidden, true);
  assert.equal(harness.timers.size, 0);
});

test("タップ＋は個別ONでも文字送りせず、表示グループにフェードを付ける", () => {
  const harness = createHarness([{}, {}], "tapFade");
  assert.equal(harness.controllers.length, 0);
  assert.ok(harness.blocks[0].classes.has("conversation-enter"));
  assert.equal(harness.blocks[1].hidden, true);
  harness.click();
  assert.equal(harness.blocks[1].hidden, false);
  assert.ok(harness.blocks[1].classes.has("conversation-enter"));
});

test("通常のタップはフェードせず、リンクの操作で次へ進まない", () => {
  const harness = createHarness([{}, {}], "tap");
  harness.click(new harness.FakeElement("a"));
  assert.equal(harness.blocks[1].hidden, true);
  harness.click();
  assert.equal(harness.blocks[1].hidden, false);
  assert.equal(harness.controllers.length, 0);
  assert.equal(harness.blocks[0].classes.size, 0);
});

test("スクロールは到達した位置まで順番に公開し、すべて表示後に監視を終了する", () => {
  const harness = createHarness([{}, {}, {}], "tap");
  let observer;
  class FakeObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = new Set();
      observer = this;
    }
    observe(block) { this.observed.add(block); }
    unobserve(block) { this.observed.delete(block); }
    disconnect() { this.disconnected = true; }
  }
  harness.context.IntersectionObserver = FakeObserver;
  harness.context.window.IntersectionObserver = FakeObserver;
  harness.context.initializeScrollProgress(harness.blocks);
  assert.equal(observer.options.threshold, 0);
  observer.callback([{ target: harness.blocks[2], isIntersecting: true }]);
  assert.ok(harness.blocks.every((block) => !block.classes.has("conversation-scroll-pending")));
  assert.ok(harness.blocks.every((block) => block.classes.has("conversation-enter")));
  assert.equal(observer.disconnected, true);
});

test("表示グループの先頭に同時表示ONがあっても、独立した最初のグループになる", () => {
  const harness = createHarness([{ simultaneous: true }, { simultaneous: true }, {}], "tap");
  const groups = harness.context.createDisplayGroups(harness.blocks);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].length, 2);
  assert.equal(groups[1][0], harness.blocks[2]);
});


test("SPのプレビューではマウス操作でもタップ表記を使用する", () => {
  const harness = createHarness([{}, {}], "rpg", "sp");
  const button = harness.root.children[0];
  assert.equal(button.dataset.device, "sp");
  assert.equal(button.children[0].textContent, "ads_click");
  assert.equal(button.children[0]["aria-hidden"], "true");
  assert.equal(button.children[1].textContent, "タップで全文表示");
  harness.click();
  assert.equal(button.children[1].textContent, "タップで次へ");
});

test("実サイトは入力方式で判定し、PCプレビューではPC指定を優先する", () => {
  const touch = createHarness([{}, {}], "tap", "", true);
  assert.equal(touch.root.children[0].dataset.device, "sp");
  assert.equal(touch.root.children[0].children[1].textContent, "タップで次へ");
  const pc = createHarness([{}, {}], "tap", "pc", true);
  assert.equal(pc.root.children[0].dataset.device, "pc");
  assert.equal(pc.root.children[0].children[1].textContent, "クリックで次へ");
});

test("吹き出しの文字送りは本文だけを操作し、画像・名前のDOMは置き換えない", () => {
  const source = readFileSync(new URL("../src/lib/export/runtime/typewriter.js", import.meta.url), "utf8");
  const message = { innerHTML: "", querySelectorAll: () => [] };
  const originalBlockHtml = '<img src="character.png"><div>キャラクター名</div><p></p>';
  const block = {
    innerHTML: originalBlockHtml,
    querySelector: () => message,
    setAttribute() {}, removeAttribute() {},
  };
  const context = vm.createContext({
    document: {
      createTreeWalker(target) {
        assert.equal(target, message);
        return { nextNode: () => false };
      },
    },
    NodeFilter: { SHOW_TEXT: 4 },
  });
  vm.runInContext(source, context);
  const controller = context.prepareTypewriter(block);
  assert.equal(controller.revealNext(), true);
  controller.finish();
  assert.equal(block.innerHTML, originalBlockHtml);
});

for (const mode of ["tap", "tapFade", "rpg"]) {
  test(`${mode}：同時表示ONでも未突破ロックの後ろを表示せず、専用操作で進む`, () => {
    const harness = createHarness([{ typewriter: false, lock: true }, { simultaneous: true, typewriter: false }, { typewriter: false }], mode);
    harness.click();
    assert.equal(harness.blocks[1].hidden, true);
    assert.equal(harness.root.children[0].hidden, true);
    harness.progress.clear(harness.blocks[0]);
    harness.controller.unlock(harness.blocks[0]);
    assert.equal(harness.blocks[1].hidden, false);
    assert.equal(harness.blocks[2].hidden, true);
    harness.controller.unlock(harness.blocks[0]);
    assert.equal(harness.blocks[2].hidden, true, "過去の回答を再送信しても進まない");
    harness.click();
    assert.equal(harness.blocks[2].hidden, false);
  });
}

test("再訪時は閲覧済みグループを全文で復元し、現在の未突破ロックより後ろは隠す", () => {
  const harness = createHarness([{ id: "a" }, { id: "new-lock", lock: true }, { id: "b" }], "rpg", "", false, {
    a: { viewed: true }, b: { viewed: true },
  });
  assert.equal(harness.controllers.length, 0);
  assert.equal(harness.blocks[0].hidden, false);
  assert.equal(harness.blocks[1].hidden, true);
  assert.equal(harness.blocks[2].hidden, true);
  harness.click();
  assert.equal(harness.blocks[1].hidden, false);
  harness.click();
  assert.equal(harness.blocks[2].hidden, true);
});

test("復元済みブロックではタップ＋のフェードを再実行しない", () => {
  const harness = createHarness([{ id: "a" }, { id: "b" }, { id: "c" }], "tapFade", "", false, { b: { viewed: true } });
  assert.equal(harness.blocks[0].hidden, false);
  assert.equal(harness.blocks[1].hidden, false);
  assert.equal(harness.blocks[2].hidden, true);
  assert.ok(harness.blocks.every((block) => !block.classes.has("conversation-enter")));
});


test("RPGは直前の文字送り完了後に指定ブロックを自動表示し、OFFで止まる", () => {
  const harness = createHarness([{ steps: 1 }, { afterPreviousTyping: true, steps: 1 }, { typewriter: false }]);
  assert.equal(harness.blocks[1].hidden, true);
  harness.tick();
  harness.tick();
  assert.equal(harness.blocks[1].hidden, false);
  assert.equal(harness.controllers.length, 2);
  harness.tick();
  assert.equal(harness.blocks[2].hidden, true);
  assert.equal(harness.timers.size, 0);
});

test("全文表示の操作でも自動表示へ進み、未突破ロックは越えない", () => {
  const harness = createHarness([{}, { afterPreviousTyping: true, lock: true, typewriter: false }, { afterPreviousTyping: true, typewriter: false }]);
  harness.click(); harness.tick();
  assert.equal(harness.blocks[1].hidden, false);
  assert.equal(harness.blocks[2].hidden, true);
  assert.equal(harness.timers.size, 0);
  harness.progress.clear(harness.blocks[1]); harness.controller.unlock(harness.blocks[1]);
  assert.equal(harness.blocks[2].hidden, false);
});

test("文字送りOFFの直後も自動表示でき、タップモードでは自動表示設定を無視する", () => {
  const harness = createHarness([{ typewriter: false }, { afterPreviousTyping: true, typewriter: false }, { afterPreviousTyping: true, typewriter: false }]);
  harness.tick(); harness.tick();
  assert.ok(harness.blocks.every((block) => !block.hidden));
  const tap = createHarness([{ typewriter: false }, { afterPreviousTyping: true, typewriter: false }], "tap");
  assert.equal(tap.timers.size, 0);
  assert.equal(tap.blocks[1].hidden, true);
});


test("タップで新しいグループが画面外に出る場合だけスクロールする", () => {
  const harness = createHarness([{ typewriter: false }, { typewriter: false }, { typewriter: false }], "tap");
  const scrolls = [];
  harness.context.window.innerHeight = 600;
  harness.context.window.scrollBy = (options) => scrolls.push(options);
  harness.blocks[1].getBoundingClientRect = () => ({ top: 450, bottom: 700 });
  harness.click();
  assert.equal(scrolls.length, 1);
  assert.equal(scrolls[0].top, 164);
  harness.blocks[2].getBoundingClientRect = () => ({ top: 300, bottom: 400 });
  harness.click();
  assert.equal(scrolls.length, 1);
});

test("画面より長い新規グループは読み始めが見える位置へスクロールする", () => {
  const harness = createHarness([{ typewriter: false }, { typewriter: false }], "rpg");
  const scrolls = [];
  harness.context.window.innerHeight = 600;
  harness.context.window.scrollBy = (options) => scrolls.push(options);
  harness.blocks[1].getBoundingClientRect = () => ({ top: 500, bottom: 1400 });
  harness.click();
  assert.equal(scrolls[0].top, 484);
});
