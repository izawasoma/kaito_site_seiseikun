import { useState } from "react";
import styled from "styled-components";
import AlertBanner from "@/components/ui/feedback/AlertBanner";
import CodeOutput from "@/components/ui/code/CodeOutput";
import Button from "@/components/ui/button/Button";

const exampleCode = `<style>
  .example-title {
    text-align: center;
  }
</style>

<h2 class="example-title">冒険のはじまり</h2>`;

export default function OutputExamples() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <Examples>
      <h2>通知とコード表示</h2>

      <Button onClick={() => setShowAlert(true)}>確認用エラーを表示</Button>

      {showAlert && (
        <AlertBanner
          message="タイトルが未入力です。"
          onClose={() => setShowAlert(false)}
        />
      )}

      <CodeOutput label="HTML" code={exampleCode} filename="example-html.txt" />
    </Examples>
  );
}

const Examples = styled.section`
  display: grid;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;
