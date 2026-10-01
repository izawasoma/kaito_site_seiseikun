import { useId, useState } from "react";
import styled from "styled-components";
import Button from "@/components/ui/button/Button";
import Icon from "@/components/ui/icon/Icon";

type CodeOutputProps = {
  label: string;
  code: string;
  filename: string;
  additionalCopy?: { label: string; code: string };
};

export default function CodeOutput({ label, code, filename, additionalCopy }: CodeOutputProps) {
  const id = useId();
  const [status, setStatus] = useState("");

  /** 選択した形式のコードをクリップボードへコピーする。 */
  async function copyCode(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("コピーしました。");
    } catch {
      setStatus(
        "コピーできませんでした。表示欄から選択してコピーしてください。",
      );
    }
  }

  function downloadCode() {
    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("ダウンロードを開始しました。");
  }

  return (
    <Container>
      <Toolbar>
        <Label htmlFor={id}>{label}</Label>

        <Actions>
          <ActionButton onClick={() => copyCode(code)}>
            <Icon name="content_copy" size={16} />
            クリップボードにコピー
          </ActionButton>
          {additionalCopy && (
            <ActionButton disabled={!additionalCopy.code} onClick={() => copyCode(additionalCopy.code)}>
              <Icon name="content_copy" size={16} />
              {additionalCopy.label}
            </ActionButton>
          )}
          <ActionButton onClick={downloadCode}>
            <Icon name="file_download" size={16} />
            .txtでダウンロード
          </ActionButton>
        </Actions>
      </Toolbar>

      <CodeArea
        id={id}
        value={code}
        readOnly
        spellCheck={false}
        aria-describedby={`${id}-status`}
      />

      <Status id={`${id}-status`} role="status">
        {status}
      </Status>
    </Container>
  );
}

const Container = styled.div`
  min-width: 0;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 20px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ActionButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.deepBlue};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;

const CodeArea = styled.textarea`
  display: block;
  width: 100%;
  height: 292px;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};
  color: ${({ theme }) => theme.colors.black};
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  line-height: 1.4;
  resize: vertical;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }
`;

const Status = styled.p`
  min-height: 18px;
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
  line-height: 1.5;
`;
