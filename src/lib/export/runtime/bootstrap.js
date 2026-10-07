/** 記事内の生成ページをそれぞれ初期化する。同じスクリプトの重複配置にも対応する。 */
function initializeConversationPages() {
  if (window.__conversationPreviewReady === false) return;
  document.querySelectorAll(".conversation-page").forEach((root) => {
    if (root.dataset.conversationInitialized === "true") return;
    root.dataset.conversationInitialized = "true";
    const blocks = Array.from(root.querySelectorAll(":scope > [data-block-id]"));
    const unlockAll = document.documentElement.dataset.conversationPreviewDevice && document.documentElement.dataset.conversationPreviewUnlock === "true";
    const mode = unlockAll ? "normal" : root.dataset.displayMode;
    const requestedInterval = Number(root.dataset.typewriterInterval);
    const interval = Number.isFinite(requestedInterval) && requestedInterval >= 1 ? requestedInterval : 40;

    const progress = createReaderProgress(root, blocks);
    const controller = mode === "tap" || mode === "tapFade" || mode === "rpg"
      ? initializeTapProgress(root, blocks, mode, interval, progress)
      : initializeStaticProgress(blocks, mode, progress);
    initializeCodeBlocks(root);
    initializeAnswers(blocks, progress, (block) => controller?.unlock(block));
    initializeProgressReset(root, progress);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeConversationPages, { once: true });
} else {
  initializeConversationPages();
}

document.addEventListener("conversation-preview-ready", initializeConversationPages, { once: true });
