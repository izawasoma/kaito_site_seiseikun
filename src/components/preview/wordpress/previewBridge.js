/** sandboxを維持したまま、編集前のスクロールと進行状態を親画面と受け渡す。 */
(function () {
  window.__conversationPreviewReady = false;
  /** プレビューのalertだけを親画面に表示する。戻り値を持つconfirm/promptは代行しない。 */
  window.alert = (message) => parent.postMessage({ type: "conversation-preview-alert", message: String(message ?? "") }, "*");
  let restoring = true;
  let interacted = false;
  function report() {
    if (restoring) return;
    parent.postMessage({ type: "conversation-preview-state", scrollY: window.scrollY, progress: window.__conversationPreviewProgress }, "*");
  }
  window.addEventListener("scroll", report, { passive: true });
  window.addEventListener("conversation-progress", report);
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((name) => window.addEventListener(name, () => { interacted = true; }, { passive: true }));
  window.addEventListener("message", (event) => {
    if (event.source !== parent || event.data?.type !== "conversation-preview-restore" || window.__conversationPreviewReady) return;
    const state = event.data.state;
    window.__conversationPreviewProgress = state?.progress;
    window.__conversationPreviewReady = true;
    document.dispatchEvent(new Event("conversation-preview-ready"));
    const scrollY = Number.isFinite(state?.scrollY) ? Math.max(0, state.scrollY) : 0;
    function restore() { if (!interacted) window.scrollTo({ top: scrollY, behavior: "instant" }); }
    restore();
    requestAnimationFrame(() => { restore(); restoring = false; });
    window.addEventListener("load", restore, { once: true });
    document.fonts?.ready.then(restore);
  });
  document.addEventListener("DOMContentLoaded", () => parent.postMessage({ type: "conversation-preview-ready" }, "*"), { once: true });
})();
