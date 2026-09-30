import styled from "styled-components";
import { useState } from "react";
import PanelSwitcher, {
  type EditorPanel,
} from "@/components/editor/PanelSwitcher";
import AddBlockPopover from "@/components/editor/blocks/AddBlockPopover";
import TitleSettings from "@/components/editor/blocks/title/TitleSettings";
import useProjectEditor from "@/hooks/useProjectEditor";
import { createTitleBlock } from "@/lib/blocks/createTitleBlock";
import type { TitleSettingsValue } from "@/types/project";
import BlockList from "@/components/editor/blocks/BlockList";
import Button from "@/components/ui/button/Button";
import Icon from "@/components/ui/icon/Icon";

export default function EditorLayout() {
  const [activePanel, setActivePanel] = useState<EditorPanel>("blocks");
  const {
    project,
    selectedBlockId,
    selectedBlock,
    addBlock,
    selectBlock,
    updateBlock,
    deleteBlock,
    copyBlock,
    pasteCopiedBlock,
    canPasteBlock,
    moveBlock,
  } = useProjectEditor();

  /**
   * タイトルの初期データを作り、プロジェクトへ追加する。
   * 現段階では、追加メニューのタイトルを選択して使用する。
   */
  function handleAddBlock() {
    const newTitleBlock = createTitleBlock();
    addBlock(newTitleBlock);
  }

  /**
   * 選択中のタイトルに、フォームで変更した設定を反映する。
   *
   * @param updatedTitleSettings - フォームから受け取った更新後の設定全体。
   */
  function handleTitleSettingsChange(updatedTitleSettings: TitleSettingsValue) {
    if (!selectedBlock) {
      return;
    }

    const updatedTitleBlock = {
      ...selectedBlock,
      settings: updatedTitleSettings,
    };

    updateBlock(updatedTitleBlock);
  }
  return (
    <Layout>
      <EditorArea>
        <BlockPanel aria-label="編集メニュー">
          <PanelSwitcher
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
          {activePanel === "blocks" && (
            <>
              <BlockListScrollArea>
                <BlockList
                  blocks={project.blocks}
                  selectedBlockId={selectedBlockId}
                  onSelect={selectBlock}
                  onCopy={copyBlock}
                  onDelete={deleteBlock}
                  onMove={moveBlock}
                />
              </BlockListScrollArea>

              <BlockActions>
                <AddBlockPopover onSelect={handleAddBlock} />
                <PasteButton
                  disabled={!canPasteBlock}
                  onClick={pasteCopiedBlock}
                >
                  <Icon name="content_paste" size={16} />
                  コピーした要素を末尾へ複製
                </PasteButton>
              </BlockActions>
            </>
          )}
        </BlockPanel>
        <SettingsPanel aria-label="設定フォーム">
          {activePanel === "blocks" && selectedBlock && (
            <TitleSettings
              key={selectedBlock.id}
              value={selectedBlock.settings}
              onChange={handleTitleSettingsChange}
              rpgTypewriterEnabled={false}
              textError={
                selectedBlock.settings.text.trim() === ""
                  ? "タイトルは必須項目です"
                  : undefined
              }
            />
          )}
        </SettingsPanel>
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
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 80px;
  /* ヘッダー72pxと編集エリアの上下余白16px・20pxを除いた高さ。 */
  max-height: calc(100dvh - 108px);
  background-color: ${({ theme }) => theme.colors.cloudyWhite};

  > :first-child {
    flex-shrink: 0;
  }
`;

const BlockListScrollArea = styled.div`
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
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

const BlockActions = styled.div`
  display: grid;
  flex-shrink: 0;
  gap: 4px;
  padding: 28px 14px 16px;
`;

const PasteButton = styled(Button)`
  width: 100%;
  gap: 4px;
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.colors.deepBlue};
`;
