import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import HtmlWorker from "monaco-editor/language/html/html.worker.js?worker";
import CssWorker from "monaco-editor/language/css/css.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";

/** 補完用Workerをアプリと同じ配信元から読み込む。 */
self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === "html") return new HtmlWorker();
    if (label === "css") return new CssWorker();
    if (label === "javascript" || label === "typescript") return new TsWorker();
    return new EditorWorker();
  },
};
export { monaco };
