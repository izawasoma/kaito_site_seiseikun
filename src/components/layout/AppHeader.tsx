import styled from "styled-components";

export default function AppHeader() {
  return (
    <Header>
      <AppTitle>回答サイト生成君</AppTitle>
      <HeaderActions>
        <HeaderButton type="button">
          <span className="material-icons" aria-hidden="true">
            file_download
          </span>
          JSONで保存
        </HeaderButton>

        <HeaderButton type="button">
          <span className="material-icons" aria-hidden="true">
            drive_folder_upload
          </span>
          JSON読み込み
        </HeaderButton>

        <ExportButton type="button">
          <span className="material-icons" aria-hidden="true">
            code
          </span>
          コード書き出し
        </ExportButton>
      </HeaderActions>
    </Header>
  );
}

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
