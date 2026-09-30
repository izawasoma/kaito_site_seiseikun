/** 参照ページの控えめな進捗削除ボタンと、本文先頭の操作案内。 */
export const pageHelpStyles = `
.conversation-page .conversation-lecture{box-sizing:border-box;margin:0 0 calc(18px * var(--conversation-scale,1));padding:calc(16px * var(--conversation-scale,1));border:1px solid #ccc;border-radius:calc(8px * var(--conversation-scale,1));background:#f5f5f5;color:#333;font-size:calc(14px * var(--conversation-scale,1));line-height:1.7;overflow-wrap:anywhere}
.conversation-page .conversation-lecture-heading{font-weight:700;margin-bottom:calc(8px * var(--conversation-scale,1))}
.conversation-page .conversation-progress-footer{text-align:center;margin:calc(40px * var(--conversation-scale,1)) 0 calc(20px * var(--conversation-scale,1))}
.conversation-page .conversation-progress-reset{background:transparent;border:1px solid #ccc;color:#888;padding:calc(8px * var(--conversation-scale,1)) calc(18px * var(--conversation-scale,1));font-family:inherit;font-size:calc(13px * var(--conversation-scale,1));line-height:1.5;border-radius:calc(20px * var(--conversation-scale,1));cursor:pointer;transition:opacity .2s ease,background-color .2s,color .2s,border-color .2s}
.conversation-page .conversation-progress-reset:hover{background:#f5f5f5;color:#d93838;border-color:#d93838}
@media(prefers-reduced-motion:reduce){.conversation-page .conversation-progress-reset{transition:none}}
`;
