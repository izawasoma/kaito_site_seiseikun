import styled from "styled-components";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import Checkbox from "@/components/ui/form/Checkbox";
import { fieldStyles } from "@/components/ui/form/fieldStyles";

export type ChoiceItem = {
  id: string;
  label: string;
  correct: boolean;
};

type ChoiceListEditorProps = {
  mode: "single" | "multiple";
  value: readonly ChoiceItem[];
  onChange: (value: ChoiceItem[]) => void;
  disabled?: boolean;
};

export default function ChoiceListEditor({
  mode,
  value,
  onChange,
  disabled,
}: ChoiceListEditorProps) {
  function updateLabel(id: string, label: string) {
    onChange(
      value.map((choice) => (choice.id === id ? { ...choice, label } : choice)),
    );
  }

  function updateCorrect(id: string, checked: boolean) {
    onChange(
      value.map((choice) => {
        if (choice.id === id) {
          return { ...choice, correct: checked };
        }

        if (mode === "single" && checked) {
          return { ...choice, correct: false };
        }

        return choice;
      }),
    );
  }

  function addChoice() {
    onChange([
      ...value,
      {
        id: `choice_${crypto.randomUUID()}`,
        label: "",
        correct: false,
      },
    ]);
  }

  return (
    <Group disabled={disabled}>
      <Legend>選択肢</Legend>

      <ColumnHeadings aria-hidden="true">
        <span>選択肢ラベル</span>
        <span>正解</span>
        <span />
      </ColumnHeadings>

      <Rows>
        {value.map((choice, index) => (
          <Row key={choice.id}>
            <ChoiceInput
              type="text"
              aria-label={`選択肢${index + 1}のラベル`}
              value={choice.label}
              onChange={(event) => updateLabel(choice.id, event.target.value)}
              disabled={disabled}
            />

            <Checkbox
              label=""
              aria-label={`選択肢${index + 1}を正解にする`}
              checked={choice.correct}
              onChange={(event) =>
                updateCorrect(choice.id, event.target.checked)
              }
              disabled={disabled}
            />

            <IconButton
              icon="delete_outline"
              label={`選択肢${index + 1}を削除`}
              onClick={() =>
                onChange(value.filter((item) => item.id !== choice.id))
              }
              disabled={disabled}
            />
          </Row>
        ))}
      </Rows>

      <AddButton onClick={addChoice} disabled={disabled}>
        選択肢を追加
      </AddButton>
    </Group>
  );
}

const Group = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
`;

const Legend = styled.legend`
  margin-bottom: 4px;
  padding: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
`;

const ColumnHeadings = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 30px 32px;
  gap: 6px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 11px;
  text-align: center;
`;

const Rows = styled.div`
  display: grid;
  gap: 4px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 30px 32px;
  align-items: center;
  gap: 6px;
`;

const ChoiceInput = styled.input`
  ${fieldStyles}
  height: 37px;
`;

const AddButton = styled(Button)`
  width: 100%;
  margin-top: 4px;
`;
