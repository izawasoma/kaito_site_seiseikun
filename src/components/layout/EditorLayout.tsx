import { usesReaderProgress } from "@/lib/project/pageHelp";
import { PageFontContext } from "@/components/editor/fields/FontContext";
import { createBlock } from "@/lib/blocks/createBlock";
import styled from "styled-components";
import { useState, useRef, useLayoutEffect } from "react";
import PanelSwitcher, {
  type EditorPanel,
} from "@/components/editor/PanelSwitcher";
import AddBlockPopover, {
  type BlockType,
} from "@/components/editor/blocks/AddBlockPopover";
import BlockSettings from "@/components/editor/blocks/BlockSettings";
import useProjectEditor from "@/hooks/useProjectEditor";
import BlockList from "@/components/editor/blocks/BlockList";
import Button from "@/components/ui/button/Button";
import Icon from "@/components/ui/icon/Icon";
import PreviewPanel from "@/components/preview/PreviewPanel";
import PageSettings from "@/components/editor/page/PageSettings";

type EditorLayoutProps = {
  editor: ReturnType<typeof useProjectEditor>;
};

/** Appで保持する編集状態を使い、設定フォームとプレビューを表示する。 */
export default function EditorLayout({ editor }: EditorLayoutProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollAfterAdd = useRef(false);
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
    updatePageSettings,
  } = editor;

  /** 選択した種類の初期データを作り、末尾へ追加して編集対象にする。 */
  function handleAddBlock(blockType: BlockType) {
    scrollAfterAdd.current = true;
    addBlock(createBlock(blockType));
  }

  useLayoutEffect(() => {
    if (!scrollAfterAdd.current || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    scrollAfterAdd.current = false;
  }, [project.blocks.length]);

  return (
    <PageFontContext value={project.pageSettings.defaultFontFamily}><Layout>
      <EditorArea>
        <BlockPanel aria-label="編集メニュー">
          <PanelSwitcher
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
          {activePanel === "blocks" && (
            <>
              <BlockListScrollArea ref={listRef}>
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
                  onClick={() => { scrollAfterAdd.current = true; pasteCopiedBlock(); }}
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
            <BlockSettings
              key={selectedBlock.id}
              block={selectedBlock}
              onChange={updateBlock}
              rpgTypewriterEnabled={project.pageSettings.displayMode === "rpg"}
              showSimultaneous={["tap", "tapFade", "rpg"].includes(project.pageSettings.displayMode)}
            />
          )}
          {activePanel === "page" && (
            <PageSettings
              canSaveProgress={usesReaderProgress(project)}
              value={project.pageSettings}
              onChange={updatePageSettings}
            />
          )}
        </SettingsPanel>
      </EditorArea>

      <PreviewPanel project={project} />
    </Layout></PageFontContext>
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
