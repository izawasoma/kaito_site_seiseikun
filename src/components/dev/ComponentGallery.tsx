import { useState } from "react";
import styled from "styled-components";
import TextField from "@/components/ui/form/TextField";
import Button from "@/components/ui/button/Button";

export default function ComponentGallery() {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const titleError =
    submitted && !title.trim() ? "タイトルは必須項目です" : undefined;

  return (
    <Gallery>
      <h1>フォーム部品の確認</h1>

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
      </DemoForm>
    </Gallery>
  );
}

const Gallery = styled.main`
  max-width: 440px;
  margin: 32px auto;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};

  h1 {
    margin: 0 0 24px;
    font-size: 20px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const DemoForm = styled.form`
  display: grid;
  gap: 20px;
`;
