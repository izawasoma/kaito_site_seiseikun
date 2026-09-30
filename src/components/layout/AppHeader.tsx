import styled from "styled-components";
import CodeExportDialog from "@/components/export/CodeExportDialog";
import type { ProjectData } from "@/types/project";
import useProjectFiles from "@/hooks/useProjectFiles";
import AlertBanner from "@/components/ui/feedback/AlertBanner";

type AppHeaderProps = {
  project: ProjectData;
  onImport: (project: ProjectData) => void;
};

/** 編集中のプロジェクトを、ヘッダーの書き出しダイアログへ渡す。 */
export default function AppHeader({ project, onImport }: AppHeaderProps) {
  const { inputRef, notice, downloadProject, readProjectFile, openFilePicker, clearNotice } =
    useProjectFiles(project, onImport);
  return (
    <Header>
      <input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={readProjectFile} />
      {notice.message && (
        <NoticeArea>
          {notice.isError ? (
            <AlertBanner message={notice.message} onClose={clearNotice} />
          ) : (
            <SuccessNotice role="status">
              {notice.message}
              <DismissButton type="button" onClick={clearNotice} aria-label="通知を閉じる">閉じる</DismissButton>
            </SuccessNotice>
          )}
        </NoticeArea>
      )}
      <AppTitle>回答サイト生成君</AppTitle>
      <HeaderActions>
        <HeaderButton type="button" onClick={downloadProject}>
          <span className="material-icons" aria-hidden="true">
            file_download
          </span>
          JSONで保存
        </HeaderButton>

        <HeaderButton type="button" onClick={openFilePicker}>
          <span className="material-icons" aria-hidden="true">
            drive_folder_upload
          </span>
          JSON読み込み
        </HeaderButton>

        <CodeExportDialog
          project={project}
          trigger={
            <ExportButton type="button">
              <span className="material-icons" aria-hidden="true">
                code
              </span>
              コード書き出し
            </ExportButton>
          }
        />
      </HeaderActions>
    </Header>
  );
}

const NoticeArea = styled.div`
  position: fixed;
  inset: 0 0 auto;
  z-index: 300;
`;

const SuccessNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 20px;
  background-color: ${({ theme }) => theme.colors.deepGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
`;

const DismissButton = styled.button`
  padding: 4px 8px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 12px 30px;
  background-color: ${({ theme }) => theme.colors.deepBlue};
  color: ${({ theme }) => theme.colors.white};
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.5;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
  padding-left: 24px;
`;

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 18px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  .material-icons {
    font-size: 24px;
  }
`;

const ExportButton = styled(HeaderButton)`
  padding: 0 20px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepBlue};
`;
