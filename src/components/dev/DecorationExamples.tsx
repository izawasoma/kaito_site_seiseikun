import { useState } from "react";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";

export default function DecorationExamples() {
  const [title, setTitle] = useState("漢字の問題");
  const [body, setBody] = useState("この文章にルビを付けます。");

  return (
    <>
      <DecoratedTextField label="見出し" value={title} onChange={setTitle} />

      <DecoratedTextField
        label="テキスト"
        value={body}
        onChange={setBody}
        multiline
      />
    </>
  );
}
