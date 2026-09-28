import Dialog from "@/components/ui/dialog/Dialog";
import CodeOutput from "@/components/ui/code/CodeOutput";

const exampleHtml = `<style>
  .example-title {
    text-align: center;
  }
</style>

<div class="conversation-page">
  <h2 class="example-title">冒険のはじまり</h2>
</div>`;

const exampleJavaScript = `<script>
  console.log("コード書き出しの確認用サンプルです");
</script>`;

export default function DialogExamples() {
  return (
    <Dialog
      triggerLabel="コード書き出し画面を確認"
      title="HTML・JavaScriptの書き出し結果"
      description="HTMLとJavaScriptをそれぞれコピーし、WordPressの記事のテキストモードへ貼り付けてください。"
    >
      <CodeOutput label="HTML" code={exampleHtml} filename="example-html.txt" />

      <CodeOutput
        label="JavaScript"
        code={exampleJavaScript}
        filename="example-javascript.txt"
      />
    </Dialog>
  );
}
