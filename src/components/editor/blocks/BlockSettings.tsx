import TitleSettings from "./title/TitleSettings";
import TextSettings from "./text/TextSettings";
import type { ProjectBlock } from "@/types/project";
import { parseDecoratedText } from "@/lib/export/renderDecoratedText";

type BlockSettingsProps = {
  block: ProjectBlock;
  onChange: (updatedBlock: ProjectBlock) => void;
  rpgTypewriterEnabled: boolean;
};

/** ブロックの種類に応じたフォームを表示し、変更をブロック全体として返す。 */
export default function BlockSettings({
  block,
  onChange,
  rpgTypewriterEnabled,
}: BlockSettingsProps) {
  const requestedFontSize = Number(block.settings.typography.fontSize);
  const decorationError = parseDecoratedText(block.settings.text).errors[0];
  const fontSizeError =
    Number.isFinite(requestedFontSize) && requestedFontSize >= 1
      ? undefined
      : "文字サイズは1以上の数値を入力してください";

  switch (block.type) {
    case "title":
      return (
        <TitleSettings
          value={block.settings}
          onChange={(settings) => onChange({ ...block, settings })}
          rpgTypewriterEnabled={rpgTypewriterEnabled}
          textError={block.settings.text.trim() ? decorationError : "タイトルは必須項目です"}
          fontSizeError={fontSizeError}
        />
      );
    case "text":
      return (
        <TextSettings
          value={block.settings}
          onChange={(settings) => onChange({ ...block, settings })}
          rpgTypewriterEnabled={rpgTypewriterEnabled}
          textError={block.settings.text.trim() ? decorationError : "テキストは必須項目です"}
          fontSizeError={fontSizeError}
        />
      );
  }
}
