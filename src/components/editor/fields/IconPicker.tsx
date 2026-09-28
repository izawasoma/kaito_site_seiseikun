import styled from "styled-components";
import TextField from "@/components/ui/form/TextField";
import IconButton from "@/components/ui/button/IconButton";

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

const presets = [
  { name: "check", label: "チェック" },
  { name: "block", label: "禁止" },
  { name: "edit", label: "鉛筆" },
  { name: "content_cut", label: "はさみ" },
  { name: "lightbulb_outline", label: "電球" },
  { name: "search", label: "検索" },
  { name: "check_box", label: "チェックボックス" },
  { name: "info_outline", label: "情報" },
  { name: "help_outline", label: "質問" },
  { name: "priority_high", label: "感嘆符" },
  { name: "warning_amber", label: "注意" },
  { name: "outlined_flag", label: "旗" },
  { name: "psychology_alt", label: "考える" },
];

export default function IconPicker({
  value,
  onChange,
  required,
  error,
  disabled,
}: IconPickerProps) {
  return (
    <Container>
      <TextField
        label="アイコン"
        helperText="GoogleのマテリアルアイコンのiconNameを入力してください。"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        error={error}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
      />

      <Candidates role="group" aria-label="候補アイコン">
        {presets.map((preset) => (
          <CandidateButton
            key={preset.name}
            icon={preset.name}
            label={`${preset.label}を選択`}
            title={`${preset.label}（${preset.name}）`}
            aria-pressed={value === preset.name}
            onClick={() => onChange(preset.name)}
            disabled={disabled}
          />
        ))}
      </Candidates>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const Candidates = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`;

const CandidateButton = styled(IconButton)`
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};

  &[aria-pressed="true"] {
    border-color: ${({ theme }) => theme.colors.deepBlue};
    background-color: ${({ theme }) => theme.colors.deepBlue};
    color: ${({ theme }) => theme.colors.white};
  }

  &[aria-pressed="true"]:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.deepBlue};
  }
`;
