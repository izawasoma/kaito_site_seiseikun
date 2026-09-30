/** 確認後にこのページの進捗だけを削除し、初期表示へ戻す。 */
function initializeProgressReset(root, progress) {
  const button = root.querySelector("[data-progress-reset]");
  if (!button) return;
  button.addEventListener("click", () => {
    if (document.documentElement.dataset.conversationPreviewDevice) {
      window.parent.postMessage({ type: "conversation-preview-reset-request" }, "*");
      return;
    }
    if (!window.confirm("このページの閲覧・回答の進捗を削除します。最初からやり直してよろしいですか？")) return;
    if (!progress.reset()) {
      window.alert("進捗を削除できませんでした。ブラウザの保存設定を確認してください。");
      return;
    }
    window.location.reload();
  });
}
