import { useState } from "react";
import styled from "styled-components";
import IconButton from "@/components/ui/button/IconButton";
import SegmentedControl from "@/components/ui/form/SegmentedControl";

export default function ActionExamples() {
  const [alignment, setAlignment] = useState("left");
  const [message, setMessage] = useState("");

  const alignmentOptions = [
    { value: "left", label: "左揃え", icon: "format_align_left" },
    { value: "center", label: "中央揃え", icon: "format_align_center" },
    { value: "right", label: "右揃え", icon: "format_align_right" },
  ];

  return (
    <Examples>
      <h2>アイコンと配置選択</h2>

      <SegmentedControl
        label="配置"
        value={alignment}
        onValueChange={setAlignment}
        options={alignmentOptions}
      />

      <p>
        現在の選択：
        {alignmentOptions.find((option) => option.value === alignment)?.label}
      </p>

      <SegmentedControl
        label="無効な配置選択"
        value="left"
        onValueChange={() => {}}
        options={alignmentOptions}
        disabled
      />

      <Actions>
        <IconButton
          icon="content_copy"
          label="複製"
          onClick={() => setMessage("複製ボタンが押されました")}
        />
        <IconButton
          icon="delete_outline"
          label="削除"
          onClick={() => setMessage("削除ボタンが押されました")}
        />
        <IconButton icon="arrow_upward" label="上へ移動" disabled />
      </Actions>

      <p role="status">{message}</p>
    </Examples>
  );
}

const Examples = styled.section`
  display: grid;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    margin: 0;
    font-size: 12px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;
