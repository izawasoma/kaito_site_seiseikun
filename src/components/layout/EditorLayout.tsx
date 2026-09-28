import styled from "styled-components";
import { useState } from "react";
import PanelSwitcher, {
  type EditorPanel,
} from "@/components/editor/PanelSwitcher";

export default function EditorLayout() {
  const [activePanel, setActivePanel] = useState<EditorPanel>("blocks");
  return (
    <Layout>
      <EditorArea>
        <BlockPanel aria-label="編集メニュー">
          <PanelSwitcher
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
        </BlockPanel>
        <SettingsPanel aria-label="設定フォーム" />
      </EditorArea>

      <PreviewPanel aria-labelledby="preview-heading">
        <PreviewHeading id="preview-heading">プレビュー</PreviewHeading>
      </PreviewPanel>
    </Layout>
  );
}

const Layout = styled.main`
  display: grid;
  grid-template-columns: 713px minmax(0, 1fr);
`;

const EditorArea = styled.div`
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 16px 13px 20px 30px;
  background-color: ${({ theme }) => theme.colors.blue};
`;

const BlockPanel = styled.section`
  min-width: 0;
  min-height: 80px;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};
`;

const SettingsPanel = styled.section`
  align-self: stretch;
  min-width: 0;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};
`;

const PreviewPanel = styled.section`
  min-width: 0;
  padding: 12px 26px 24px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const PreviewHeading = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.5;
`;
