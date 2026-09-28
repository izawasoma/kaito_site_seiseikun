import styled from "styled-components";

type CharacterCounterProps = {
  id?: string;
  count: number;
  maxLength: number;
};

export default function CharacterCounter({
  id,
  count,
  maxLength,
}: CharacterCounterProps) {
  const remaining = maxLength - count;
  const exceeded = remaining < 0;

  return (
    <Counter id={id} $exceeded={exceeded}>
      {exceeded
        ? `${Math.abs(remaining)}文字超過しています`
        : `あと${remaining}文字`}
    </Counter>
  );
}

const Counter = styled.p<{ $exceeded: boolean }>`
  margin: 0;
  color: ${({ theme, $exceeded }) =>
    $exceeded ? theme.colors.red : theme.colors.gray};
  font-size: 11px;
  line-height: 1.5;
  text-align: right;
`;
