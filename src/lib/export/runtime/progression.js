/** 連続する「前と同時に表示」を、配列順を保ってひとつのグループにまとめる。 */
function createDisplayGroups(blocks, mode) {
  const groups = [];
  blocks.forEach((block) => {
    if (!(mode === "rpg" && block.dataset.afterPreviousTyping === "true") && block.dataset.simultaneous === "true" && groups.length > 0 && groups[groups.length - 1].at(-1).dataset.lock !== "true") {
      groups[groups.length - 1].push(block);
    } else {
      groups.push([block]);
    }
  });
  return groups;
}

/** タップ・タップ＋・RPGの進行。文字送り中の操作では次グループへ進まない。 */
function initializeTapProgress(root, blocks, mode, interval, progress = { viewed: () => false, cleared: () => false, view() {} }) {
  const groups = createDisplayGroups(blocks, mode);
  if (groups.length === 0) return;
  const advanceButton = document.createElement("button");
  advanceButton.type = "button";
  advanceButton.className = "conversation-advance";
  /** 疑似環境では選択中のPC/SPを優先し、実サイトでは主な入力方式で判定する。 */
  const previewDevice = document.documentElement.dataset.conversationPreviewDevice;
  const device = previewDevice || (window.matchMedia("(pointer: coarse)").matches ? "sp" : "pc");
  advanceButton.dataset.device = device;
  const operation = device === "sp" ? "タップ" : "クリック";
  const icon = document.createElement("span");
  icon.className = "conversation-advance-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "ads_click";
  const label = document.createElement("span");
  advanceButton.append(icon, label);
  const footer = root.querySelector?.("[data-progress-footer]");
  if (footer) root.insertBefore(advanceButton, footer);
  else root.append(advanceButton);
  blocks.forEach((block) => { block.hidden = true; });

  let restoredGroupIndex = -1;
  for (let index = 0; index < groups.length; index += 1) {
    if (groups[index].some((block) => progress.viewed(block))) restoredGroupIndex = index;
    if (groups[index].some((block) => block.dataset.lock === "true" && !progress.cleared(block))) break;
  }
  let groupIndex = -1;
  let controllers = [];
  let controllerIndex = 0;
  let timer = null;
  let typing = false;

  /** 表示状態に合わせて、全文表示／次へ操作を案内する。 */
  function updateButton() {
    label.textContent = `${operation}で${typing ? "全文表示" : "次へ"}`;
    advanceButton.hidden = !typing && (groupIndex === groups.length - 1 || isLocked());
  }

  /** ロックがあるグループでは回答・専用ボタン操作を待つ。 */
  function isLocked() {
    return groupIndex >= 0 && groups[groupIndex].some((block) => block.dataset.lock === "true" && !progress.cleared(block));
  }

  /** 現在のグループだけを全文表示し、次のタップを待つ。 */
  function finishGroup(advanceAutomatically = false) {
    clearTimeout(timer);
    controllers.forEach((controller) => controller.finish());
    typing = false;
    updateButton();
    if (advanceAutomatically) scheduleAutomaticGroup();
  }

  /** 自動表示の連鎖はタイマーで区切り、ロック・手動待ちで止める。 */
  function scheduleAutomaticGroup() {
    if (mode !== "rpg" || isLocked() || groups[groupIndex + 1]?.[0].dataset.afterPreviousTyping !== "true") return;
    const previousIndex = groupIndex;
    timer = setTimeout(() => {
      if (root.isConnected && groupIndex === previousIndex && !typing) showNextGroup();
    }, 0);
  }

  /** グループ内の文字送り対象を、ブロック順に1文字ずつ進める。 */
  function tick() {
    if (!root.isConnected) {
      finishGroup();
      return;
    }
    if (controllers[controllerIndex].revealNext()) controllerIndex += 1;
    if (controllerIndex >= controllers.length) {
      finishGroup(true);
    } else {
      timer = setTimeout(tick, interval);
    }
  }

  /** 新しいグループが画面外なら、長文は先頭、短文は末尾まで見える位置へ送る。 */
  function scrollToGroup() {
    const first = groups[groupIndex]?.[0];
    const last = groups[groupIndex]?.at(-1);
    if (!first?.getBoundingClientRect || !last) return;
    const top = first.getBoundingClientRect().top;
    const bottom = last.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;
    if (top >= 16 && bottom <= viewportHeight - 64) return;
    const target = bottom - top > viewportHeight - 80 ? top - 16 : bottom - viewportHeight + 64;
    window.scrollBy({ top: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  /** 個別OFFのブロックは即時表示し、ONのブロックだけ文字送りへ登録する。 */
  function showNextGroup(restoring = false) {
    if (isLocked() || groupIndex + 1 >= groups.length) return;
    clearTimeout(timer);
    groupIndex += 1;
    controllers = [];
    controllerIndex = 0;
    groups[groupIndex].forEach((block) => {
      block.hidden = false;
      progress.view(block);
      if (!restoring && mode === "tapFade") block.classList.add("conversation-enter");
      if (!restoring && mode === "rpg" && block.dataset.typewriter === "true") {
        controllers.push(prepareTypewriter(block));
      }
    });
    if (!restoring && groupIndex > 0) scrollToGroup();
    typing = controllers.length > 0;
    updateButton();
    if (typing) timer = setTimeout(tick, interval);
    else if (!restoring) scheduleAutomaticGroup();
  }

  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const interactive = event.target.closest("a, button, input, textarea, select, label, [contenteditable]");
    if (interactive && interactive !== advanceButton) return;
    if (interactive !== advanceButton && window.getSelection()?.toString()) return;
    if (typing) finishGroup(true);
    else showNextGroup();
  });
  window.addEventListener("pagehide", () => finishGroup(), { once: true });
  if (restoredGroupIndex >= 0) {
    while (groupIndex < restoredGroupIndex) {
      const previousIndex = groupIndex;
      showNextGroup(true);
      if (previousIndex === groupIndex) break;
    }
    scheduleAutomaticGroup();
    const resumedBlock = groups[groupIndex]?.at(-1);
    if (!document.documentElement.dataset.conversationPreviewDevice) setTimeout(() => resumedBlock?.scrollIntoView?.({ block: "center", behavior: "instant" }), 0);
  } else showNextGroup();
  return {
    unlock(block) {
      if (!groups[groupIndex]?.includes(block)) return;
      finishGroup();
      showNextGroup();
    },
  };
}

/** 画面内に入ったブロックまで順に表示する。長いブロックも先頭の交差で表示する。 */
function initializeScrollProgress(blocks, onView = () => {}) {
  if (!("IntersectionObserver" in window)) { blocks.forEach(onView); return; }
  let lastRevealedIndex = -1;
  blocks.forEach((block) => block.classList.add("conversation-scroll-pending"));
  const observer = new IntersectionObserver((entries) => {
    let targetIndex = lastRevealedIndex;
    entries.forEach((entry) => {
      if (entry.isIntersecting) targetIndex = Math.max(targetIndex, blocks.indexOf(entry.target));
    });
    for (let index = lastRevealedIndex + 1; index <= targetIndex; index += 1) {
      blocks[index].classList.remove("conversation-scroll-pending");
      blocks[index].classList.add("conversation-enter");
      observer.unobserve(blocks[index]);
      onView(blocks[index]);
    }
    lastRevealedIndex = targetIndex;
    if (lastRevealedIndex === blocks.length - 1) observer.disconnect();
  }, { threshold: 0 });
  blocks.forEach((block) => observer.observe(block));
}

/** 通常・スクロールは未突破ロックまでを解放し、新しく解放された分だけ表示処理する。 */
function initializeStaticProgress(blocks, mode, progress) {
  const released = new Set();
  blocks.forEach((block) => { block.hidden = true; });
  function refresh() {
    const limit = getUnlockedLimit(blocks, progress);
    const pending = [];
    blocks.forEach((block, index) => {
      if (index > limit || released.has(block)) return;
      released.add(block);
      block.hidden = false;
      if (mode === "scroll" && !progress.viewed(block)) pending.push(block);
      else progress.view(block);
    });
    if (pending.length) initializeScrollProgress(pending, (block) => progress.view(block));
  }
  refresh();
  return { unlock: refresh };
}
