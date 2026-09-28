import styled from "styled-components";

export default function EditorLayout() {
  return (
    <Layout>
      <EditorArea>
        <BlockPanel aria-label="ブロック一覧" />
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
  background-color: #5aa3ff;
`;

const BlockPanel = styled.section`
  min-width: 0;
  min-height: 80px;
  background-color: #fafbff;
`;

const SettingsPanel = styled.section`
  align-self: stretch;
  min-width: 0;
  background-color: #fafbff;
`;

const PreviewPanel = styled.section`
  min-width: 0;
  padding: 12px 26px 24px;
  background-color: #ffffff;
`;

const PreviewHeading = styled.h2`
  margin: 0;
  color: #504c53;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
`;
