/** CSSをブラウザで解析し、ブロック外へ作用する規則を取り除く。 */
function scopeConversationCss(css, selector) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  /** グローバルな定義・外部CSSの読み込みは許可せず、表示規則だけを残す。 */
  function localRules(rules) {
    return Array.from(rules).map((rule) => {
      if (rule.type === CSSRule.STYLE_RULE) return rule.cssText;
      if (rule.cssRules && /^(?:@media|@supports|@container|@layer)\b/.test(rule.cssText)) {
        return rule.cssText.slice(0, rule.cssText.indexOf("{") + 1) + localRules(rule.cssRules) + "}";
      }
      return "";
    }).join(" ");
  }
  return `@scope (${selector}) { ${localRules(sheet.cssRules)} }`;
}

/** 同一ページ内へHTMLを配置し、CSSだけを限定してJavaScriptを実行する。 */
function initializeCodeBlocks(root) {
  const blocks = Array.from(root.querySelectorAll(":scope > [data-code-settings]"));
  /** 先に全ブロックのHTMLを用意し、別ブロックを参照するコードも実行可能にする。 */
  const executions = [];
  blocks.forEach((block) => {
    if (block.dataset.codeInitialized === "true") return;
    let settings;
    try { settings = JSON.parse(block.dataset.codeSettings); } catch { return; }
    block.dataset.codeInitialized = "true";
    const template = document.createElement("template");
    template.innerHTML = settings.html;
    const styles = [settings.css];
    template.content.querySelectorAll("style").forEach((style) => { styles.push(style.textContent); style.remove(); });
    template.content.querySelectorAll('link[rel~="stylesheet"],base').forEach((element) => element.remove());
    const scripts = Array.from(template.content.querySelectorAll("script"));
    scripts.forEach((script) => script.remove());
    block.append(template.content);
    const selector = `[data-block-id="${CSS.escape(block.dataset.blockId)}"]`;
    const style = document.createElement("style");
    try { style.textContent = scopeConversationCss(styles.join("\n"), selector); }
    catch (error) { console.error("コードブロックのCSSを適用できませんでした。", error); }
    block.prepend(style);
    executions.push({ block, scripts, javascript: settings.javascript });
  });
  executions.forEach(({ block, scripts, javascript }) => {
    scripts.forEach((original) => {
      const script = document.createElement("script");
      for (const attribute of original.attributes) script.setAttribute(attribute.name, attribute.value);
      script.textContent = original.textContent;
      block.append(script);
    });
    const script = document.createElement("script");
    script.textContent = javascript;
    block.append(script);
  });
}
