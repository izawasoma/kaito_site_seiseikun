import styled from "styled-components";

export type DecorationTag =
  | "ruby"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "bold";

type TextDecorationToolbarProps = {
  label: string;
  disabled?: boolean;
  onInsert: (tag: DecorationTag) => void;
};

const decorations = [
  { tag: "ruby", label: "ルビ", color: "deepGray" },
  { tag: "red", label: "赤文字", color: "red" },
  { tag: "blue", label: "青文字", color: "deepBlue" },
  { tag: "green", label: "緑文字", color: "green" },
  { tag: "yellow", label: "黄文字", color: "yellow" },
  { tag: "bold", label: "太文字", color: "deepGray" },
] as const;

type DecorationColor = (typeof decorations)[number]["color"];

export default function TextDecorationToolbar({
  label,
  disabled = false,
  onInsert,
}: TextDecorationToolbarProps) {
  return (
    <Container role="group" aria-label={`${label}の文字装飾`}>
      {decorations.map((decoration) => (
        <DecorationButton
          key={decoration.tag}
          type="button"
          disabled={disabled}
          $color={decoration.color}
          $bold={decoration.tag === "bold"}
          aria-label={`${label}に${decoration.label}を挿入`}
          onMouseDown={(event) => {
            if (event.button === 0) {
              event.preventDefault();
            }
          }}
          onClick={() => onInsert(decoration.tag)}
        >
          {decoration.label}
        </DecorationButton>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`;

const DecorationButton = styled.button<{
  $color: DecorationColor;
  $bold: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  padding: 2px 4px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme, $color }) => theme.colors[$color]};
  font-size: 10px;
  font-weight: ${({ theme, $bold }) =>
    $bold ? theme.fontWeights.bold : theme.fontWeights.regular};
  line-height: 1.2;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;
