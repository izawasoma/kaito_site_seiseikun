import { useState } from "react";
import styled from "styled-components";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import CharacterLoadPopover from "@/components/editor/characters/CharacterLoadPopover";
import CharacterRegisterDialog from "@/components/editor/characters/CharacterRegisterDialog";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import SpeechThemePicker from "@/components/editor/fields/SpeechThemePicker";
import FormSection from "@/components/ui/form/FormSection";
import TextField from "@/components/ui/form/TextField";
import Checkbox from "@/components/ui/form/Checkbox";
import CharacterCounter from "@/components/ui/form/CharacterCounter";
import AlertBanner from "@/components/ui/feedback/AlertBanner";
import { countDecoratedCharacters } from "@/lib/export/countDecoratedCharacters";
import { getImageUrl } from "@/lib/getImageUrl";
import type { SpeechSettingsValue } from "@/types/project";

type SpeechSettingsProps = {
  value: SpeechSettingsValue;
  onChange: (value: SpeechSettingsValue) => void;
  showSimultaneous: boolean;
  simultaneous: boolean;
  onSimultaneousChange: (value: boolean) => void;
  textError?: string;
  fontSizeError?: string;
};

/** 吹き出しの編集フォーム。キャラクターの読み込みでは画像と名前だけを更新する。 */
export default function SpeechSettings({
  value, onChange, showSimultaneous, simultaneous, onSimultaneousChange,
  textError, fontSizeError,
}: SpeechSettingsProps) {
  const [characterError, setCharacterError] = useState("");
  const characterCount = countDecoratedCharacters(value.text);
  const draft = { imageUrl: value.imageUrl, characterName: value.characterName };
  const imageError = !value.imageUrl.trim()
    ? "画像URLは必須項目です"
    : !getImageUrl(value.imageUrl) ? "httpまたはhttpsの画像URLを入力してください" : undefined;

  return (
    <div>
      {characterError && (
        <ErrorArea>
          <AlertBanner message={characterError} onClose={() => setCharacterError("")} />
        </ErrorArea>
      )}
      <SettingsPanelHeader title="吹出し" icon="chat_bubble_outline" />
      <FormSection title="内容">
        <CharacterActions>
          <CharacterLoadPopover
            onSelect={(character) => onChange({ ...value, ...character })}
            onError={setCharacterError}
          />
          <CharacterRegisterDialog draft={draft} onError={setCharacterError} />
        </CharacterActions>
        <TextField
          label="画像URL"
          type="url"
          required
          helperText="WordPressのメディアライブラリに画像を事前にUPしてください"
          value={value.imageUrl}
          onChange={(event) => onChange({ ...value, imageUrl: event.target.value })}
          error={imageError}
        />
        <TextField
          label="キャラクター名"
          required
          value={value.characterName}
          onChange={(event) => onChange({ ...value, characterName: event.target.value })}
          error={value.characterName.trim() ? undefined : "キャラクター名は必須項目です"}
        />
        <DecoratedTextField
          label="内容"
          required
          multiline
          helperText="最大100文字（装飾タグ・ルビの読み・改行を除く）"
          value={value.text}
          onChange={(text) => onChange({ ...value, text })}
          error={textError || (characterCount > 100 ? "内容は100文字以内で入力してください" : undefined)}
        />
        <CharacterCounter count={characterCount} maxLength={100} />
      </FormSection>
      <FormSection title="基本設定">
        <TypographyFields
          value={value.typography}
          onChange={(typography) => onChange({ ...value, typography })}
          fontSizeError={fontSizeError}
        />
        {showSimultaneous && (
          <Checkbox label="前の出現と同時に表示" checked={simultaneous}
            onChange={(event) => onSimultaneousChange(event.target.checked)} />
        )}
        <SpeechThemePicker value={value.speechTheme}
          onChange={(speechTheme) => onChange({ ...value, speechTheme })} />
      </FormSection>
    </div>
  );
}

const CharacterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
`;

const ErrorArea = styled.div`
  position: fixed;
  inset: 0 0 auto;
  z-index: 300;
`;
