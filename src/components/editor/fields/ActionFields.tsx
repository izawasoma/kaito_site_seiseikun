import Switch from "@/components/ui/form/Switch";
import styled from "styled-components";
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";

export type ActionValue = {
  type: "next" | "link";
  url: string;
  allowRepeat?: boolean;
};

type ActionFieldsProps = {
  value: ActionValue;
  onChange: (value: ActionValue) => void;
  label?: string;
  urlError?: string;
  disabled?: boolean;
};

export default function ActionFields({
  value,
  onChange,
  label = "正解時の挙動",
  urlError,
  disabled,
}: ActionFieldsProps) {
  return (
    <Fields>
      <SelectField
        label={label}
        value={value.type}
        onValueChange={(type) => {
          if (type === "next" || type === "link") {
            onChange({ ...value, type });
          }
        }}
        options={[
          { value: "next", label: "次のブロックを表示する" },
          { value: "link", label: "指定したリンクへ遷移する" },
        ]}
        disabled={disabled}
      />

      {value.type === "link" && (<>
        <TextField
          label="遷移先URL"
          type="url"
          required
          value={value.url}
          onChange={(event) => onChange({ ...value, url: event.target.value })}
          error={urlError}
          disabled={disabled}
        />
        <Switch label="２回目の実行を許可する" checked={value.allowRepeat === true} disabled={disabled}
          onChange={(event) => onChange({ ...value, allowRepeat: event.target.checked })} />
      </>)}
    </Fields>
  );
}

const Fields = styled.div`
  display: grid;
  gap: 16px;
`;
