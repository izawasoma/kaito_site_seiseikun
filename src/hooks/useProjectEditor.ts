import { replaceCharacterImageUrls } from "@/lib/characterStorage";
import { replaceProjectImageUrls } from "@/lib/project/replaceImageUrls";
import { getImageUrl } from "@/lib/getImageUrl";
import { useEffect, useState } from "react";
import type { ProjectData, ProjectBlock, PageSettingsValue } from "@/types/project";
import { loadEditorSession, saveEditorSnapshot } from "@/lib/project/projectStorage";
import { parseProject } from "@/lib/project/parseProject";

/**
 * 保存対象のプロジェクトデータと、編集中の選択状態を管理する。
 */
type EditorState = {
  /** JSONへの保存対象となる、ブロック一覧などの制作データ。 */
  project: ProjectData;
  /** 編集対象のブロックID。未選択の場合はnull。保存対象には含めない。 */
  selectedBlockId: string | null;
};

/**
 * プロジェクトの編集状態と、ブロックの追加・選択・更新・削除・並び替え・コピーを管理する。
 *
 * 各更新処理は、Reactから受け取った最新の編集状態をもとに次の状態を作る。
 * 編集状態をlocalStorageへ自動保存し、初回に復元する。JSONファイルの操作は別フックが担当する。
 *
 * @returns プロジェクトデータ、選択中のIDとブロック、および編集用の関数。
 */
export default function useProjectEditor() {
  const [initialSession] = useState(loadEditorSession);
  const [editorState, setEditorState] = useState<EditorState>(initialSession.snapshot);
  const [canAutosave, setCanAutosave] = useState(initialSession.canSave);
  const [storageError, setStorageError] = useState(initialSession.error);

  useEffect(() => {
    if (!canAutosave) return;
    let active = true;

    /** 変更を即時保存し、保存結果の通知だけを非同期で更新する。 */
    function persist() {
      let message = "";
      try {
        saveEditorSnapshot(editorState);
      } catch {
        message = "自動保存できませんでした。ブラウザの保存容量・設定を確認し、JSONで保存してください。";
      }
      queueMicrotask(() => {
        if (active) setStorageError(message);
      });
    }

    persist();
    window.addEventListener("pagehide", persist);
    return () => {
      active = false;
      window.removeEventListener("pagehide", persist);
    };
  }, [editorState, canAutosave]);

  /** コピーした時点のブロック。プロジェクトの保存データには含めない。 */
  const [copiedBlock, setCopiedBlock] = useState<ProjectBlock | null>(null);

  /**
   * 選択中のIDに対応するブロック。未選択または該当なしの場合はnull。
   *
   * setEditorStateで選択中のIDやブロック一覧を更新すると、利用元の
   * コンポーネントが再描画され、このフックも再実行される。
   * その際にfindが最新の状態で実行され、選択中のブロックを求め直す。
   * この変数自体が変更を監視しているわけではない。
   *
   * 一覧と選択中のIDから求められるため、別のstateとして保持せず、
   * 更新し忘れによって一覧と選択中の内容が食い違うのを防ぐ。
   */
  const selectedBlock =
    editorState.project.blocks.find((projectBlock) => {
      return projectBlock.id === editorState.selectedBlockId;
    }) ?? null;

  /**
   * ブロックを末尾に追加し、そのブロックを編集対象にする。
   * 同じIDが存在する場合は追加しない。既存ブロックの内容と並び順は保持する。
   *
   * @param newBlock - 呼び出し元で一意のIDと初期設定を用意したブロック。
   */
  function addBlock(newBlock: ProjectBlock) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;

      const duplicateBlock = currentProject.blocks.find((projectBlock) => {
        return projectBlock.id === newBlock.id;
      });

      if (duplicateBlock) {
        return currentEditorState;
      }

      const updatedBlocks = [...currentProject.blocks, newBlock];

      const updatedProject: ProjectData = {
        ...currentProject,
        blocks: updatedBlocks,
      };

      return {
        project: updatedProject,
        selectedBlockId: newBlock.id,
      };
    });
  }

  /**
   * プロジェクトの内容を保持したまま、編集対象のブロックを切り替える。
   * 指定したIDが存在しない場合は、編集状態を変更しない。
   *
   * @param blockId - 選択するブロックの固定ID。配列の位置ではない。
   */
  function selectBlock(blockId: string) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;

      const targetBlock = currentProject.blocks.find((projectBlock) => {
        return projectBlock.id === blockId;
      });

      if (!targetBlock) {
        return currentEditorState;
      }

      return {
        project: currentProject,
        selectedBlockId: blockId,
      };
    });
  }

  /**
   * 同じIDのブロックを、渡された更新後のブロック全体で置き換える。
   * 並び順・選択状態と、ほかのブロックの内容は保持する。
   * 対象が存在しない場合や種類が異なる場合は、編集状態を変更しない。
   *
   * @param updatedBlock - 元のID・種類を維持した、更新後のブロック全体。
   */
  function updateBlock(updatedBlock: ProjectBlock) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;

      const targetBlock = currentProject.blocks.find((projectBlock) => {
        return projectBlock.id === updatedBlock.id;
      });

      if (!targetBlock || targetBlock.type !== updatedBlock.type) {
        return currentEditorState;
      }

      const updatedBlocks = currentProject.blocks.map((projectBlock) => {
        if (projectBlock.id !== updatedBlock.id) {
          return projectBlock;
        }

        return updatedBlock;
      });

      const updatedProject: ProjectData = {
        ...currentProject,
        blocks: updatedBlocks,
      };

      return {
        project: updatedProject,
        selectedBlockId: currentEditorState.selectedBlockId,
      };
    });
  }

  /**
   * 指定したブロックを削除し、残りのブロックの並び順を保持する。
   * 選択中のブロックを削除した場合は未選択に戻す。
   * 指定したIDが存在しない場合は、編集状態を変更しない。
   *
   * @param blockId - 削除するブロックの固定ID。
   */
  function deleteBlock(blockId: string) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;
      const remainingBlocks = currentProject.blocks.filter((projectBlock) => {
        return projectBlock.id !== blockId;
      });

      if (remainingBlocks.length === currentProject.blocks.length) {
        return currentEditorState;
      }

      const updatedProject: ProjectData = {
        ...currentProject,
        blocks: remainingBlocks,
      };

      let selectedBlockId = currentEditorState.selectedBlockId;

      if (selectedBlockId === blockId) {
        selectedBlockId = null;
      }

      return {
        project: updatedProject,
        selectedBlockId: selectedBlockId,
      };
    });
  }

  /**
   * 指定したブロックの内容を、コピーした時点のスナップショットとして保持する。
   * 元のブロックを後から編集しても、コピー済みの内容は変わらない。
   *
   * @param blockId - コピーするブロックの固定ID。
   */
  function copyBlock(blockId: string) {
    const targetBlock = editorState.project.blocks.find((projectBlock) => {
      return projectBlock.id === blockId;
    });

    if (!targetBlock) {
      return;
    }

    const copiedBlockSnapshot = structuredClone(targetBlock);
    setCopiedBlock(copiedBlockSnapshot);
  }

  /**
   * 移動するブロックを、移動先ブロックが現在ある位置へ移す。
   * ブロックのID・内容・選択状態は保持し、配列の順番だけを変更する。
   * 同じ位置への移動、または対象が存在しない場合は変更しない。
   *
   * @param movingBlockId - 移動するブロックの固定ID。
   * @param destinationBlockId - 移動先の位置を示すブロックの固定ID。
   */
  function moveBlock(movingBlockId: string, destinationBlockId: string) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;
      const currentBlocks = currentProject.blocks;

      const movingBlockIndex = currentBlocks.findIndex((projectBlock) => {
        return projectBlock.id === movingBlockId;
      });

      const destinationBlockIndex = currentBlocks.findIndex((projectBlock) => {
        return projectBlock.id === destinationBlockId;
      });

      if (movingBlockIndex === -1 || destinationBlockIndex === -1) {
        return currentEditorState;
      }

      if (movingBlockIndex === destinationBlockIndex) {
        return currentEditorState;
      }

      const movingBlock = currentBlocks[movingBlockIndex];
      const reorderedBlocks = [...currentBlocks];

      reorderedBlocks.splice(movingBlockIndex, 1);
      reorderedBlocks.splice(destinationBlockIndex, 0, movingBlock);

      const updatedProject: ProjectData = {
        ...currentProject,
        blocks: reorderedBlocks,
      };

      return {
        project: updatedProject,
        selectedBlockId: currentEditorState.selectedBlockId,
      };
    });
  }

  /**
   * コピー済みの内容に新しいIDを付け、末尾へ追加して選択する。
   * 複製後はコピー内容をクリアし、再度コピーするまで複製できなくする。
   */
  function pasteCopiedBlock() {
    if (!copiedBlock) {
      return;
    }

    const duplicatedBlock: ProjectBlock = {
      ...structuredClone(copiedBlock),
      id: crypto.randomUUID(),
    };

    addBlock(duplicatedBlock);
    setCopiedBlock(null);
  }

  /**
   * ページ設定を全体ごと置き換える。ブロックと編集対象の選択は保持する。
   * @param updatedSettings - フォームから受け取った変更後のページ設定。
   */
  function updatePageSettings(updatedSettings: PageSettingsValue) {
    setEditorState((currentEditorState) => {
      const currentProject = currentEditorState.project;
      const updatedProject: ProjectData = {
        ...currentProject,
        pageSettings: updatedSettings,
      };

      return {
        project: updatedProject,
        selectedBlockId: currentEditorState.selectedBlockId,
      };
    });
  }

  /** 検証済みJSONから作業を再開し、古いコピー内容をクリアする。 */
  function replaceProject(importedProject: ProjectData) {
    const restoredProject = parseProject(importedProject);
    setEditorState({
      project: restoredProject,
      selectedBlockId: restoredProject.blocks[0]?.id ?? null,
    });
    setCopiedBlock(null);
    setCanAutosave(true);
    setStorageError("");
  }

  /** 登録画像の保存に成功してから編集データを更新し、選択中のブロックを維持する。 */
  function replaceImageUrls(before: string, after: string) {
    if (!before.trim() || !getImageUrl(after)) throw new Error("有効な画像URLを入力してください。");
    const nextUrl = after.trim();
    replaceCharacterImageUrls(before, nextUrl);
    setEditorState((currentEditorState) => ({
      ...currentEditorState,
      project: replaceProjectImageUrls(currentEditorState.project, before, nextUrl),
    }));
  }

  return {
    replaceImageUrls,
    project: editorState.project,
    storageError,
    replaceProject,
    selectedBlockId: editorState.selectedBlockId,
    selectedBlock,
    addBlock,
    selectBlock,
    updateBlock,
    updatePageSettings,
    deleteBlock,
    copyBlock,
    moveBlock,
    pasteCopiedBlock,
    canPasteBlock: copiedBlock !== null,
  };
}
