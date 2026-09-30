import { useMemo, type ReactElement } from "react";
import Dialog from "@/components/ui/dialog/Dialog";
import CodeOutput from "@/components/ui/code/CodeOutput";
import { generateProjectCode } from "@/lib/export/generateProjectCode";
import type { ProjectData } from "@/types/project";

type CodeExportDialogProps = {
  project: ProjectData;
  trigger: ReactElement;
};

/**
 * 現在のプロジェクトから、WordPressへ貼り付けるコードを表示する。
 *
 * @remarks
 * プレビューと同じ生成処理を使用する。
 * 疑似環境のテーマCSSやautop適用後のHTMLは書き出さない。
 */
export default function CodeExportDialog({
  project,
  trigger,
}: CodeExportDialogProps) {
  const generatedCode = useMemo(() => generateProjectCode(project), [project]);

  return (
    <Dialog
      triggerLabel="コード書き出し"
      trigger={trigger}
      title="HTML・JavaScriptの書き出し結果"
      description="書き出したコードをコピーして、WordPressのテキストモードへ貼り付けてください。貼り付け後は、コードの変更を避けるためビジュアルモードへの切り替えを控えてください。現在のタイトル・テキスト表示ではJavaScriptは不要です。"
    >
      <CodeOutput
        label="HTML"
        code={generatedCode.htmlCss}
        filename="kaito-html.txt"
      />
      <CodeOutput
        label="JavaScript"
        code={generatedCode.javascript}
        filename="kaito-javascript.txt"
      />
    </Dialog>
  );
}
