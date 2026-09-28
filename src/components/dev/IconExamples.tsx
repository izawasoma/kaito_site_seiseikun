import { useState } from "react";
import styled from "styled-components";
import IconPicker from "@/components/editor/fields/IconPicker";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import Switch from "@/components/ui/form/Switch";

export default function IconExamples() {
  const [icon, setIcon] = useState("check");
  const [disabled, setDisabled] = useState(false);

  return (
    <section>
      <SettingsPanelHeader title="アイコンカード" icon="category" />

      <FormSection title="タイトル">
        <IconPicker
          value={icon}
          onChange={setIcon}
          required
          disabled={disabled}
          error={icon.trim() ? undefined : "アイコンは必須項目です"}
        />

        <CurrentValue>現在の値：{icon || "未入力"}</CurrentValue>

        <Switch
          label="確認用：編集を無効にする"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />
      </FormSection>
    </section>
  );
}

const CurrentValue = styled.p`
  margin: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
`;
