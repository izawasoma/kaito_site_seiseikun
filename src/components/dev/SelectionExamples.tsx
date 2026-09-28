import { useState } from "react";
import styled from "styled-components";
import Checkbox from "@/components/ui/form/Checkbox";
import RadioGroup from "@/components/ui/form/RadioGroup";
import Switch from "@/components/ui/form/Switch";

export default function SelectionExamples() {
  const [simultaneous, setSimultaneous] = useState(false);
  const [animation, setAnimation] = useState("shake");
  const [typewriter, setTypewriter] = useState(false);

  return (
    <Examples>
      <h2>選択部品</h2>

      <Checkbox
        label="前の出現と同時に表示"
        checked={simultaneous}
        onChange={(event) => setSimultaneous(event.target.checked)}
      />

      <RadioGroup
        label="不正解時アニメーション"
        value={animation}
        onValueChange={setAnimation}
        options={[
          { value: "shake", label: "横揺れ" },
          { value: "none", label: "アニメーションなし" },
        ]}
      />

      <Switch
        label="RPG文字送りを有効にする"
        checked={typewriter}
        onChange={(event) => setTypewriter(event.target.checked)}
      />

      <Checkbox label="無効なチェックボックス" defaultChecked disabled />
      <Switch label="無効なスイッチ" defaultChecked disabled />

      <RadioGroup
        label="無効なラジオボタン"
        value="shake"
        onValueChange={() => {}}
        disabled
        options={[
          { value: "shake", label: "横揺れ" },
          { value: "none", label: "アニメーションなし" },
        ]}
      />
    </Examples>
  );
}

const Examples = styled.section`
  display: grid;
  gap: 20px;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;
