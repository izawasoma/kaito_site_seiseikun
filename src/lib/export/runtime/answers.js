/** 空白を除き、カタカナをひらがなへ統一する。正解候補にも同じ変換を行う。 */
function normalizeAnswer(value) {
  return String(value).normalize("NFC").replace(/\s/g, "").replace(/[ァ-ヶ]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60));
}

/** 空回答・空の正解集合は合格させず、複数選択は過不足のない一致で判定する。 */
function isCorrectAnswer(field, value) {
  if (field.type === "text") {
    const normalized = normalizeAnswer(value);
    return normalized !== "" && field.candidates.some((candidate) => normalizeAnswer(candidate) === normalized);
  }
  const correct = field.choices.filter((choice) => choice.correct).map((choice) => choice.id);
  if (field.type === "single") return correct.length === 1 && value === correct[0];
  return correct.length > 0 && Array.isArray(value) && value.length === correct.length && correct.every((id) => value.includes(id));
}

/** 出力済みURLも実行時に確認し、同一タブでHTTP(S)へ遷移する。 */
function navigateConversation(url) {
  try {
    if (!url) return;
    const target = new URL(url, document.baseURI);
    if (target.protocol === "http:" || target.protocol === "https:") window.location.assign(target.href);
  } catch { /* 無効なリンクは実行しない。 */ }
}

/** 不正解の再送信でもアニメーションを先頭から再生する。 */
function shakeAnswer(element) {
  element.classList.remove("conversation-shake");
  void element.offsetWidth;
  element.classList.add("conversation-shake");
}

/** 回答とボタンを進行制御へ接続する。非表示・未解放ブロックからの操作は拒否する。 */
function initializeAnswers(blocks, progress, onUnlock) {
  function accessible(block) {
    return !block.hidden && blocks.indexOf(block) <= getUnlockedLimit(blocks, progress);
  }
  function complete(block, action) {
    progress.clear(block);
    if (action.type === "link") navigateConversation(action.url);
    else onUnlock(block);
  }
  blocks.forEach((block) => {
    if (block.dataset.answerConfig) {
      let config;
      try { config = JSON.parse(block.dataset.answerConfig); } catch { return; }
      const feedback = block.querySelector(".conversation-answer-feedback");
      const rows = Array.from(block.querySelectorAll("[data-answer-field]"));
      let judging = false;
      const correctFields = new Set();
      /** 判定中・正解後の入力と二重送信を防ぐ。多答の正解済み欄も固定する。 */
      function disableControls(disabled) {
        block.querySelectorAll("input, select, button").forEach((input) => { input.disabled = disabled; });
        if (!disabled) rows.forEach((row) => {
          if (correctFields.has(row.dataset.answerField)) row.querySelectorAll("input, select").forEach((input) => { input.disabled = true; });
        });
      }
      /** 正規化する前の回答を復元する。正解候補の表記へ置き換えない。 */
      config.fields.forEach((field) => {
        const value = progress.answer(block, field.id);
        const row = rows.find((element) => element.dataset.answerField === field.id);
        if (!row || value === undefined) return;
        if (field.type === "multiple" ? !Array.isArray(value) : typeof value !== "string") return;
        if (!progress.cleared(block) && !isCorrectAnswer(field, value)) return;
        if (field.type === "multiple") row.querySelectorAll("input").forEach((input) => { input.checked = value.includes(input.value); });
        else row.querySelector("input, select").value = value;
        correctFields.add(field.id);
        const result = row.querySelector("[data-field-result]");
        if (result) { result.textContent = "○"; result.dataset.correct = "true"; }
      });
      disableControls(false);
      if (progress.cleared(block)) {
        feedback.textContent = config.successMessage ?? "正解です";
        feedback.dataset.correct = "true";
        disableControls(true);
      }
      block.addEventListener("submit", (event) => {
        event.preventDefault();
        if (judging || progress.cleared(block) || !accessible(block)) return;
        judging = true;
        feedback.textContent = "";
        delete feedback.dataset.correct;
        block.setAttribute("aria-busy", "true");
        const submittedValues = new Map();
        const results = config.fields.map((field) => {
          const row = rows.find((element) => element.dataset.answerField === field.id);
          if (!row) return false;
          const value = field.type === "multiple"
            ? Array.from(row.querySelectorAll("input:checked")).map((input) => input.value)
            : row.querySelector("input, select").value;
          submittedValues.set(field.id, value);
          return isCorrectAnswer(field, value);
        });
        const spinner = '<span class="conversation-judging-icon" aria-hidden="true">progress_activity</span><span class="conversation-sr-only">判定中</span>';
        rows.forEach((row) => {
          row.classList.remove("conversation-shake");
          const result = row.querySelector("[data-field-result]");
          if (result) {
            delete result.dataset.correct;
            result.innerHTML = config.multiple ? spinner : "";
          }
        });
        const submitButton = block.querySelector(".conversation-submit");
        submitButton.classList.remove("conversation-shake");
        if (config.multiple && !config.individual) feedback.innerHTML = spinner;
        disableControls(true);
        /** メッセージを一度消して描画する。多答は2秒後に結果と不正解演出を表示する。 */
        setTimeout(() => {
          if (block.isConnected === false) return;
          judging = false;
          block.setAttribute("aria-busy", "false");
          config.fields.forEach((field, index) => {
            const row = rows.find((element) => element.dataset.answerField === field.id);
            if (!row) return;
            const correct = results[index];
            if (correct) {
              correctFields.add(field.id);
              progress.saveAnswer(block, field.id, submittedValues.get(field.id));
            }
            const result = row.querySelector("[data-field-result]");
            if (result) { result.textContent = correct ? "○" : "×"; result.dataset.correct = String(correct); }
            row.querySelectorAll("input, select").forEach((input) => input.setAttribute("aria-invalid", String(!correct)));
            if (!correct && config.individual && config.animation === "shake") shakeAnswer(row);
          });
          const success = results.length > 0 && results.every(Boolean);
          feedback.textContent = success ? (config.successMessage ?? "正解です") : config.errorMessage;
          feedback.dataset.correct = String(success);
          disableControls(success);
          if (success) complete(block, config.action);
          else if (!config.individual && config.animation === "shake") shakeAnswer(submitButton);
        }, config.multiple ? 2000 : 200);
      });
    }
    const button = block.querySelector("[data-conversation-action]");
    if (button) {
      button.disabled = progress.cleared(block);
      button.addEventListener("click", () => {
        if (button.disabled || progress.cleared(block) || !accessible(block)) return;
        button.disabled = true;
        complete(block, { type: button.dataset.conversationAction === "link" ? "link" : "next", url: button.dataset.url });
      });
    }
  });
}
