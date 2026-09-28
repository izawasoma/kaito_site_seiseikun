import { useState } from "react";
import styled from "styled-components";
import TextField from "@/components/ui/form/TextField";
import Button from "@/components/ui/button/Button";
import TextAreaField from "@/components/ui/form/TextAreaField";
import NumberField from "@/components/ui/form/NumberField";
import SelectField from "@/components/ui/form/SelectField";
import SelectionExamples from "@/components/dev/SelectionExamples";
import ActionExamples from "@/components/dev/ActionExamples";
import ColorExamples from "@/components/dev/ColorExamples";
import ChipExamples from "@/components/dev/ChipExamples";
import TextExamples from "@/components/dev/TextExamples";
import OutputExamples from "@/components/dev/OutputExamples";
import DialogExamples from "@/components/dev/DialogExamples";
import TypographyExamples from "@/components/dev/TypographyExamples";

export default function ComponentGallery() {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [body, setBody] = useState("");
  const [fontSize, setFontSize] = useState("24");
  const [fontWeight, setFontWeight] = useState("500");

  const fontSizeError =
    submitted &&
    (fontSize.trim() === "" ||
      !Number.isFinite(Number(fontSize)) ||
      Number(fontSize) <= 0)
      ? "0より大きい数値を入力してください"
      : undefined;

  const titleError =
    submitted && !title.trim() ? "タイトルは必須項目です" : undefined;

  return (
    <Gallery>
      <h1>フォーム部品の確認</h1>
      <TypographyExamples />
      <DialogExamples />
      <OutputExamples />
      <TextExamples />
      <ChipExamples />
      <ColorExamples />
      <ActionExamples />
      <SelectionExamples />
      <DemoForm
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <TextField
          label="タイトル"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError}
        />

        <TextField
          label="画像URL"
          type="url"
          helperText="WordPressにアップロードした画像のURLを入力してください。"
          placeholder="https://example.com/image.png"
        />

        <TextField
          label="無効な入力欄"
          defaultValue="編集できません"
          disabled
        />

        <TextField
          label="読み取り専用"
          value="選択してコピーできます"
          readOnly
        />

        <Button type="submit">入力を確認</Button>
        <Button disabled>操作できないボタン</Button>
        <TextAreaField
          label="本文"
          required
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          error={submitted && !body.trim() ? "本文は必須項目です" : undefined}
        />

        <NumberField
          label="文字サイズ"
          required
          unit="px"
          min={1}
          step="any"
          value={fontSize}
          onChange={(event) => setFontSize(event.target.value)}
          error={fontSizeError}
        />

        <SelectField
          label="太さ"
          value={fontWeight}
          onValueChange={setFontWeight}
          options={[
            { value: "400", label: "Regular" },
            { value: "500", label: "Medium" },
            { value: "700", label: "Bold" },
          ]}
        />

        <TextAreaField label="無効な本文" disabled />
        <NumberField label="無効な数値" unit="px" disabled />
        <SelectField
          label="無効な選択欄"
          disabled
          defaultValue="500"
          options={[{ value: "500", label: "Medium" }]}
        />
      </DemoForm>
    </Gallery>
  );
}

const Gallery = styled.main`
  display: grid;
  gap: 24px;
  max-width: 440px;
  margin: 32px auto;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const DemoForm = styled.form`
  display: grid;
  gap: 20px;
`;
