import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type ChipProps = {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
};

export default function Chip({ label, onRemove, disabled }: ChipProps) {
  return (
    <Container>
      {onRemove && (
        <RemoveButton
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`${label}を削除`}
        >
          <Icon name="cancel" size={16} />
        </RemoveButton>
      )}
      <Label>{label}</Label>
    </Container>
  );
}

const Container = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  min-height: 26px;
  padding: 2px 6px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
`;

const Label = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
