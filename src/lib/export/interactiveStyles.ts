/** WordPressのフォーム既定スタイルより具体的なセレクタで、部品内の見た目を揃える。 */
export const interactiveStyles = `
.conversation-page .conversation-card,.conversation-page .conversation-image,.conversation-page .conversation-button-block,.conversation-page .conversation-answer{box-sizing:border-box;margin:0 0 calc(18px * var(--conversation-scale, 1));padding:0;border:0;background:transparent;line-height:1.5}
.conversation-page .conversation-card{padding:calc(18px * var(--conversation-scale, 1)) calc(24px * var(--conversation-scale, 1))}
.conversation-page .conversation-card-title{margin:0 0 calc(18px * var(--conversation-scale, 1));padding:0;line-height:1.5}
.conversation-page .conversation-card-body{margin:0;padding:0;line-height:1.5}
.conversation-page .conversation-material-icon{font-family:'Material Icons';font-weight:normal;font-style:normal;font-size:1.25em;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;font-feature-settings:'liga';vertical-align:middle}
.conversation-page .conversation-image{text-align:center}
.conversation-page .conversation-image img{display:block;margin:0 auto;border:0}
.conversation-page .conversation-action,.conversation-page .conversation-submit{box-sizing:border-box;display:block;width:100%;padding:calc(8px * var(--conversation-scale, 1)) calc(16px * var(--conversation-scale, 1));border:0;border-radius:calc(4px * var(--conversation-scale, 1));background:#643cff;color:#fff;font:inherit;text-align:center;line-height:1.5;cursor:pointer;white-space:normal}
.conversation-page button:focus-visible,.conversation-page input:focus-visible,.conversation-page select:focus-visible{outline:calc(3px * var(--conversation-scale, 1)) solid #3071B7;outline-offset:calc(2px * var(--conversation-scale, 1))}
.conversation-page .conversation-answer-instruction{margin:0 0 calc(4px * var(--conversation-scale, 1));text-align:center}
.conversation-page .conversation-answer-fields{display:grid;grid-template-columns:fit-content(20%) fit-content(20%) minmax(0,1fr) fit-content(20%) auto;row-gap:calc(4px * var(--conversation-scale, 1))}
.conversation-page .conversation-answer-row{display:grid;grid-column:1 / -1;grid-template-columns:subgrid;align-items:center;margin:0}
.conversation-page .conversation-answer-row > *{grid-row:1;min-width:0}
.conversation-page .conversation-answer-label{grid-column:1;overflow-wrap:anywhere;padding-right:calc(8px * var(--conversation-scale, 1))}
.conversation-page .conversation-answer-before{grid-column:2;padding-right:calc(8px * var(--conversation-scale, 1));overflow-wrap:anywhere;white-space:pre-wrap}
.conversation-page .conversation-answer-input{grid-column:3;min-width:0}
.conversation-page .conversation-answer-after{grid-column:4;padding-left:calc(8px * var(--conversation-scale, 1));overflow-wrap:anywhere;white-space:pre-wrap}
.conversation-page .conversation-answer input[type=text],.conversation-page .conversation-answer select{box-sizing:border-box;display:block;width:100%;min-height:calc(42px * var(--conversation-scale, 1));margin:0;padding:calc(6px * var(--conversation-scale, 1)) calc(10px * var(--conversation-scale, 1));border:calc(2px * var(--conversation-scale, 1)) solid #333;border-radius:calc(4px * var(--conversation-scale, 1));background:#fff;color:#1D1D1D;font:inherit;line-height:1.5}
.conversation-page .conversation-choices{display:grid;gap:calc(4px * var(--conversation-scale, 1));text-align:left}
.conversation-page .conversation-choices label{display:flex;align-items:center;gap:calc(8px * var(--conversation-scale, 1));margin:0;font:inherit;cursor:pointer}
.conversation-page .conversation-choices input{appearance:auto;width:calc(20px * var(--conversation-scale, 1));height:calc(20px * var(--conversation-scale, 1));flex:0 0 calc(20px * var(--conversation-scale, 1));margin:0;accent-color:#643cff}
.conversation-page .conversation-answer-result{grid-column:5;padding-left:calc(8px * var(--conversation-scale, 1));display:grid;text-align:center;min-width:calc(30px * var(--conversation-scale, 1))}
.conversation-page .conversation-answer-result small{font-size:calc(9px * var(--conversation-scale, 1))}
.conversation-page [data-correct=true]{color:#23832c}
.conversation-page [data-correct=false],.conversation-page .conversation-answer-feedback{color:#F35457}
.conversation-page .conversation-answer-feedback{margin:calc(4px * var(--conversation-scale, 1)) 0 0;text-align:center;min-height:0}
.conversation-page .conversation-answer-feedback[data-correct=true]{color:#23832c}
.conversation-page .conversation-submit{margin-top:calc(8px * var(--conversation-scale, 1))}
.conversation-page .conversation-shake{animation:conversation-shake 350ms ease-in-out}
.conversation-page .conversation-judging-icon{display:inline-block;font-family:'Material Symbols Outlined';font-weight:400;font-style:normal;font-size:calc(24px * var(--conversation-scale, 1));line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;font-feature-settings:'liga';animation:conversation-judging-spin 800ms linear infinite;color:inherit}
.conversation-page .conversation-sr-only{position:absolute;width:calc(1px * var(--conversation-scale, 1));height:calc(1px * var(--conversation-scale, 1));padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.conversation-page .conversation-answer button:disabled,.conversation-page .conversation-action:disabled{cursor:default;opacity:.65;animation:none;transition:none}
.conversation-page .conversation-answer input:disabled,.conversation-page .conversation-answer select:disabled{background:#ECECEC;opacity:1;color:#504B52;cursor:default}
@keyframes conversation-judging-spin{to{transform:rotate(360deg)}}
@keyframes conversation-shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(calc(-6px * var(--conversation-scale, 1)))}50%{transform:translateX(calc(6px * var(--conversation-scale, 1)))}}
@media(prefers-reduced-motion:reduce){.conversation-page .conversation-shake{animation:none}}
`;
