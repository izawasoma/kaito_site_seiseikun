/**
 * 装飾を保ちながら本文を文字単位で表示する準備をする。
 * ルビの読み・補助括弧は文字数に含めず、親文字の出現時に表示する。
 * 終了時は元のHTMLへ戻し、文字送り用のspanを残さない。
 */
function prepareTypewriter(block) {
  /** 吹き出しは本文だけを操作し、キャラクター名・画像を常時表示する。 */
  const content = block.querySelector("[data-typewriter-content]") || block;
  const originalHtml = content.innerHTML;
  const textNodes = [];
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode(textNode) {
      return textNode.parentElement.closest("rt, rp")
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("ja", { granularity: "grapheme" }) : null;
  const units = [];
  block.setAttribute("aria-busy", "true");
  content.querySelectorAll("rt, rp").forEach((annotation) => {
    annotation.style.visibility = "hidden";
  });

  textNodes.forEach((textNode) => {
    const characters = segmenter
      ? Array.from(segmenter.segment(textNode.data), (part) => part.segment)
      : Array.from(textNode.data);
    const ruby = textNode.parentElement.closest("ruby");
    const annotations = ruby ? Array.from(ruby.querySelectorAll("rt, rp")) : [];
    const fragment = document.createDocumentFragment();
    characters.forEach((character) => {
      const span = document.createElement("span");
      span.textContent = character;
      span.style.visibility = "hidden";
      fragment.append(span);
      units.push({ span, annotations });
    });
    textNode.replaceWith(fragment);
  });

  let revealedCount = 0;
  let finished = false;
  /** 全文表示または文字送り完了時に、元の装飾HTMLへ復元する。 */
  function finish() {
    if (finished) return;
    finished = true;
    content.innerHTML = originalHtml;
    block.removeAttribute("aria-busy");
  }

  return {
    finish,
    /** 1文字を表示し、全文の表示が完了したかを返す。 */
    revealNext() {
      const unit = units[revealedCount];
      if (unit) {
        unit.span.style.visibility = "";
        unit.annotations.forEach((annotation) => { annotation.style.visibility = ""; });
        revealedCount += 1;
      }
      const completed = revealedCount >= units.length;
      if (completed) finish();
      return completed;
    },
  };
}
