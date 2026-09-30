/** ID単位の進捗を読み込み、現行HTMLに存在しないIDを除外する。プレビューでは保存しない。 */
function createReaderProgress(root, blocks) {
  const key = root.dataset.progressKey?.trim();
  const enabled = !!key && !document.documentElement.dataset.conversationPreviewDevice;
  const storageKey = `conversation_progress_${key}`;
  const states = Object.create(null);
  let saved = null;
  let resetRequested = false;
  try {
    if (enabled) saved = JSON.parse(window.localStorage.getItem(storageKey));
  } catch { /* 保存不可・破損時も記事を閲覧できるようにする。 */ }
  if (document.documentElement.dataset.conversationPreviewDevice) saved = window.__conversationPreviewProgress ?? null;
  blocks.forEach((block) => {
    const id = block.dataset.blockId;
    const previous = saved?.version === 1 && saved.blocks && Object.hasOwn(saved.blocks, id) ? saved.blocks[id] : null;
    const answers = Object.create(null);
    if (previous?.answers && typeof previous.answers === "object" && !Array.isArray(previous.answers)) {
      Object.entries(previous.answers).forEach(([fieldId, value]) => {
        if (typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string"))) answers[fieldId] = value;
      });
    }
    states[id] = { viewed: previous?.viewed === true, cleared: previous?.cleared === true, answers };
  });
  function save() {
    if (resetRequested) return;
    if (document.documentElement.dataset.conversationPreviewDevice) {
      window.__conversationPreviewProgress = { version: 1, blocks: states };
      window.dispatchEvent?.(new Event("conversation-progress"));
    }
    if (!enabled) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, blocks: states })); }
    catch { /* 容量不足・利用拒否の場合も現在のセッションは進行可能。 */ }
  }
  return {
    reset() {
      try { if (enabled) window.localStorage.removeItem(storageKey); }
      catch { return false; }
      resetRequested = true;
      if (document.documentElement.dataset.conversationPreviewDevice) window.__conversationPreviewProgress = null;
      return true;
    },
    answer(block, fieldId) { return states[block.dataset.blockId]?.answers[fieldId]; },
    saveAnswer(block, fieldId, value) {
      states[block.dataset.blockId].answers[fieldId] = Array.isArray(value) ? [...value] : value;
      save();
    },
    viewed(block) { return states[block.dataset.blockId]?.viewed === true; },
    cleared(block) { return states[block.dataset.blockId]?.cleared === true; },
    view(block) { states[block.dataset.blockId].viewed = true; save(); },
    clear(block) { states[block.dataset.blockId].cleared = true; save(); },
  };
}

/** 常に現在の並び順で最初の未突破ロックを探し、そのブロックまでは表示可能とする。 */
function getUnlockedLimit(blocks, progress) {
  if (document.documentElement.dataset.conversationPreviewDevice && document.documentElement.dataset.conversationPreviewUnlock === "true") return blocks.length - 1;
  const lockIndex = blocks.findIndex((block) => block.dataset.lock === "true" && !progress.cleared(block));
  return lockIndex < 0 ? blocks.length - 1 : lockIndex;
}
