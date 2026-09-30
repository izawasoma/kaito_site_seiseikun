import { getDefaultLectureText, updateDefaultLecture } from "@/lib/project/pageHelp";
import TextAreaField from "@/components/ui/form/TextAreaField";
import Button from "@/components/ui/button/Button";
import FontSelectField from "@/components/editor/fields/FontSelectField";
import styled from "styled-components";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import TextField from "@/components/ui/form/TextField";
import ColorField from "@/components/ui/form/ColorField";
import SelectField from "@/components/ui/form/SelectField";
import Switch from "@/components/ui/form/Switch";
import NumberField from "@/components/ui/form/NumberField";
import type { DisplayMode, PageSettingsValue } from "@/types/project";

type PageSettingsProps = {
  value: PageSettingsValue;
  canSaveProgress?: boolean;
  onChange: (updatedSettings: PageSettingsValue) => void;
};

const modeOptions = [
  { value: "normal", label: "ノーマル" },
  { value: "scroll", label: "スクロールフェードイン" },
  { value: "tap", label: "タップで進む" },
  { value: "tapFade", label: "タップで進む＋" },
  { value: "rpg", label: "文字送り" },
] satisfies { value: DisplayMode; label: string }[];

/** デザインのページ設定フォーム。更新時は設定オブジェクト全体を親へ返す。 */
export default function PageSettings({ value, onChange, canSaveProgress = value.displayMode !== "normal" }: PageSettingsProps) {
  const colorError = /^#[0-9a-f]{6}$/i.test(value.defaultTextColor)
    ? undefined
    : "文字色は6桁のカラーコードで入力してください";

  return (
    <div>
      <SettingsPanelHeader title="ページ設定" icon="settings" />
      <FormSection title="進行保存用キー名（ローカルストレージのキー名）">
        <TextField
          label="キー名"
          helperText="閲覧進捗の保存に使用します。他の記事と重複しない名前を入力してください。例：episode-001"
          value={value.progressStorageKey}
          onChange={(event) => onChange({ ...value, progressStorageKey: event.target.value })}
        />
      </FormSection>
      <FormSection title="表示設定">
        <ColorField
          label="デフォルトの文字色"
          helperText="吹き出しメッセージ、タイトル、テキスト、単一回答欄、多答回答欄のテキストの文字色です。個別の色装飾を優先します。"
          value={value.defaultTextColor}
          onValueChange={(defaultTextColor) => onChange({ ...value, defaultTextColor })}
          error={colorError}
        />
        <FontSelectField value={value.defaultFontFamily} onChange={(defaultFontFamily) => onChange({ ...value, defaultFontFamily })} />
        <SelectField
          label="アニメーションモード"
          helperText="ノーマル：通常表示。スクロールフェードイン：スクロールに合わせて表示。タップで進む：タップで順番に表示。タップで進む＋：タップ進行にフェードインを追加。文字送り：一文字ずつ表示し、表示中のタップで全文表示、表示後のタップで次へ進みます。"
          value={value.displayMode}
          options={modeOptions}
          onValueChange={(selectedMode) => {
            const selectedOption = modeOptions.find((option) => option.value === selectedMode);
            if (selectedOption) {
              onChange({ ...value, displayMode: selectedOption.value, lectureText: updateDefaultLecture(value.lectureText, value.displayMode, selectedOption.value) });
            }
          }}
        />
        <Switch label="進捗削除ボタンの設置" disabled={!canSaveProgress}
          checked={canSaveProgress && value.showProgressReset}
          onChange={(event) => onChange({ ...value, showProgressReset: event.target.checked })} />
        {!canSaveProgress && <HelpText>進捗を保存する表示モード、または回答欄・進行ボタンがある場合に設定できます。</HelpText>}
        {value.displayMode === "rpg" && (
          <NumberField
            label="文字送り速度"
            unit="ms / 文字"
            min={1}
            step={1}
            value={String(value.typewriterInterval)}
            onChange={(event) => onChange({ ...value, typewriterInterval: Number(event.target.value) })}
            helperText="初期値は40msです。小さいほど速く表示します。"
            error={Number.isFinite(value.typewriterInterval) && value.typewriterInterval >= 1
              ? undefined : "1以上の数値を入力してください"}
          />
        )}
        <LectureGroup>
          <LectureLabel>レクチャーを表示する</LectureLabel>
          <HelpText id="lecture-description">
            ページ先頭に操作方法・保存・ブラウザについての案内を表示します。
          </HelpText>
          <Switch
            label="レクチャーの表示を有効化"
            aria-describedby="lecture-description"
            checked={value.showLecture}
            onChange={(event) => onChange({ ...value, showLecture: event.target.checked })}
          />
          {value.showLecture && <>
            <Button onClick={() => {
              if (window.confirm("編集したレクチャー本文を破棄して、デフォルトの文言に戻しますか？")) onChange({ ...value, lectureText: getDefaultLectureText(value.displayMode) });
            }}>デフォルトの文言に戻す</Button>
            <TextAreaField label="レクチャー本文" rows={12} value={value.lectureText} onChange={(event) => onChange({ ...value, lectureText: event.target.value })} />
          </>}
        </LectureGroup>
      </FormSection>
    </div>
  );
}

const LectureGroup = styled.div`
  display: grid;
  gap: 4px;
`;

const LectureLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
`;

const HelpText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 11px;
  line-height: 1.5;
`;
