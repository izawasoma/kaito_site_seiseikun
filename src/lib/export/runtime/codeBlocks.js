/** コードを別文書で実行し、CSS・DOM操作を他ブロックから分離する。 */
function initializeCodeBlocks(root) {
  const frames = Array.from(root.querySelectorAll("iframe[data-code-settings]"));
  if (!frames.length) return;
  window.addEventListener("message", (event) => {
    const frame = frames.find((candidate) => candidate.contentWindow === event.source);
    if (!frame || event.data?.type !== "conversation-code-height") return;
    const height = event.data.height;
    if (typeof height === "number" && Number.isFinite(height) && height >= 0 && height <= 100000) frame.style.height = `${Math.max(1, Math.ceil(height))}px`;
  });
  frames.forEach((frame) => {
    let settings;
    try { settings = JSON.parse(frame.dataset.codeSettings); } catch { return; }
    /** HTMLのscript終了タグとして解釈されないようJSON内の小なり記号を退避する。 */
    const data = JSON.stringify(settings).replace(/</g, "\\u003c");
    const bootstrap = `const settings=${data}; const defaults=document.createElement('style'); defaults.textContent=settings.defaultCss || ''; document.head.append(defaults); const style=document.createElement('style'); style.textContent=settings.css; document.head.append(style); document.body.innerHTML=settings.html; document.body.querySelectorAll('script').forEach(old=>{const script=document.createElement('script'); for(const attr of old.attributes)script.setAttribute(attr.name,attr.value); script.textContent=old.textContent; old.replaceWith(script);}); const report=()=>parent.postMessage({type:'conversation-code-height',height:document.body.getBoundingClientRect().height},'*'); new ResizeObserver(report).observe(document.body); addEventListener('load',report); report(); const script=document.createElement('script'); script.textContent=settings.javascript; document.body.append(script);`;
    frame.srcdoc = '\x3c!doctype html>\x3chtml>\x3chead>\x3cmeta charset="UTF-8">\x3cmeta name="viewport" content="width=device-width,initial-scale=1">\x3cstyle>html{margin:0;padding:0}body{display:flow-root;margin:0;padding:0;min-height:0;overflow-wrap:anywhere}img{max-width:100%;height:auto}\x3c/style>\x3c/head>\x3cbody>\x3cscript>' + bootstrap + '\x3c/scr' + 'ipt>\x3c/body>\x3c/html>';
  });
}
