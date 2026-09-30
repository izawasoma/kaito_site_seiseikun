import { validateBlock } from "@/lib/project/validateProject";
import styled from "styled-components";
import IconSettings from "./icon/IconSettings";
import ButtonSettings from "./button/ButtonSettings";
import AnswerSettings from "./answer/AnswerSettings";
import ImageFields from "@/components/editor/fields/ImageFields";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import Checkbox from "@/components/ui/form/Checkbox";
import { getImageUrl } from "@/lib/getImageUrl";
import TitleSettings from "./title/TitleSettings";
import TextSettings from "./text/TextSettings";
import SpeechSettings from "./speech/SpeechSettings";
import type { ProjectBlock } from "@/types/project";
import { parseDecoratedText } from "@/lib/export/renderDecoratedText";

type BlockSettingsProps = {
  block: ProjectBlock;
  onChange: (updatedBlock: ProjectBlock) => void;
  rpgTypewriterEnabled: boolean;
  showSimultaneous: boolean;
};

/** ブロックの種類に応じたフォームを表示し、変更をブロック全体として返す。 */
function BlockSettingsForm({
  block,
  onChange,
  rpgTypewriterEnabled,
}: BlockSettingsProps) {
  if (block.type !== "speech" && block.type !== "title" && block.type !== "text") {
    return <>
      {block.type === "icon" && <IconSettings value={block.settings} onChange={(settings) => onChange({ ...block, settings })} />}
      {block.type === "button" && <ButtonSettings value={block.settings} onChange={(settings) => onChange({ ...block, settings })} />}
      {(block.type === "answer" || block.type === "multiAnswer") && <AnswerSettings block={block} onChange={onChange} />}
      {block.type === "image" && <><SettingsPanelHeader title="画像" icon="image" /><ImageFields value={block.settings} onChange={(settings) => onChange({ ...block, settings })} urlError={!getImageUrl(block.settings.url) ? "httpまたはhttpsの画像URLを入力してください" : undefined} /></>}

    </>;
  }
  const requestedFontSize = Number(block.settings.typography.fontSize);
  const decorationError = parseDecoratedText(block.settings.text).errors[0];
  const fontSizeError =
    Number.isFinite(requestedFontSize) && requestedFontSize >= 1
      ? undefined
      : "文字サイズは1以上の数値を入力してください";

  switch (block.type) {
    case "speech":
      return (
        <SpeechSettings
          value={block.settings}
          onChange={(settings) => onChange({ ...block, settings })}
          showSimultaneous={false}
          simultaneous={block.simultaneous}
          onSimultaneousChange={(simultaneous) => onChange({ ...block, simultaneous })}
          textError={block.settings.text.trim() ? decorationError : "内容は必須項目です"}
          fontSizeError={fontSizeError}
        />
      );
    case "title":
      return (
        <TitleSettings
          value={block.settings}
          onChange={(settings) => onChange({ ...block, settings })}
          rpgTypewriterEnabled={rpgTypewriterEnabled}
          showSimultaneous={false}
          simultaneous={block.simultaneous}
          onSimultaneousChange={(simultaneous) => onChange({ ...block, simultaneous })}
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
          showSimultaneous={false}
          simultaneous={block.simultaneous}
          onSimultaneousChange={(simultaneous) => onChange({ ...block, simultaneous })}
          textError={block.settings.text.trim() ? decorationError : "テキストは必須項目です"}
          fontSizeError={fontSizeError}
        />
      );
  }
}

/** エラーは対象ブロックの設定欄内にまとめ、保存中の入力を失わず修正できるようにする。 */
export default function BlockSettings(props: BlockSettingsProps) {
  const errors = validateBlock(props.block);
  return <><BlockSettingsForm {...props} />
    {props.showSimultaneous && <FormSection title="表示タイミング">
      <Checkbox label="前の出現と同時に表示" checked={props.block.simultaneous} onChange={(event) => props.onChange({ ...props.block, simultaneous: event.target.checked, afterPreviousTyping: event.target.checked ? false : props.block.afterPreviousTyping })} />
      {props.rpgTypewriterEnabled && <Checkbox label="前の文字送りが終了とともに表示" checked={props.block.afterPreviousTyping ?? false} onChange={(event) => props.onChange({ ...props.block, afterPreviousTyping: event.target.checked, simultaneous: event.target.checked ? false : props.block.simultaneous })} />}
    </FormSection>}{errors.length > 0 && <Errors aria-label="設定の確認事項">{errors.map((error, index) => <li key={index}>{error}</li>)}</Errors>}</>;
}

const Errors = styled.ul`
  margin: 0; padding: 12px 20px 20px 36px;
  color: ${({ theme }) => theme.colors.red}; font-size: 11px;
`;
