import styled from "styled-components";

export type EditorPanel = "blocks" | "page";

type PanelSwitcherProps = {
  activePanel: EditorPanel;
  onPanelChange: (panel: EditorPanel) => void;
};

export default function PanelSwitcher({
  activePanel,
  onPanelChange,
}: PanelSwitcherProps) {
  return (
    <Switcher role="group" aria-label="設定の切り替え">
      <PanelButton
        type="button"
        $active={activePanel === "blocks"}
        aria-pressed={activePanel === "blocks"}
        onClick={() => onPanelChange("blocks")}
      >
        <span className="material-icons" aria-hidden="true">
          integration_instructions
        </span>
        ブロック設定
      </PanelButton>

      <PanelButton
        type="button"
        $active={activePanel === "page"}
        aria-pressed={activePanel === "page"}
        onClick={() => onPanelChange("page")}
      >
        <span className="material-icons" aria-hidden="true">
          settings
        </span>
        ページ設定
      </PanelButton>
    </Switcher>
  );
}

const Switcher = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const PanelButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 80px;
  padding: 8px;
  border: none;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.deepGray : theme.colors.lightGray};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.deepGray};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;

  .material-icons {
    font-size: 40px;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -4px;
  }
`;
