import { useState } from "react";
import styled, { useTheme } from "styled-components";
import ColorField from "@/components/ui/form/ColorField";

export default function ColorExamples() {
  const theme = useTheme();
  const [color, setColor] = useState<string>(theme.colors.deepBlue);

  return (
    <Examples>
      <h2>色入力</h2>

      <ColorField label="背景色" value={color} onValueChange={setColor} />

      <p>現在の値：{color}</p>

      <ColorField
        label="無効な色入力"
        value={theme.colors.deepBlue}
        onValueChange={() => {}}
        disabled
      />
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
