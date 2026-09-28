import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type AlertBannerProps = {
  message: string;
  onClose: () => void;
};

export default function AlertBanner({ message, onClose }: AlertBannerProps) {
  return (
    <Banner role="alert">
      <Icon name="error_outline" />
      <Message>{message}</Message>
      <CloseButton type="button" onClick={onClose}>
        閉じる
      </CloseButton>
    </Banner>
  );
}

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  min-height: 83px;
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.colors.red};
  color: ${({ theme }) => theme.colors.white};
`;

const Message = styled.p`
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 18px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 18px;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }
`;
