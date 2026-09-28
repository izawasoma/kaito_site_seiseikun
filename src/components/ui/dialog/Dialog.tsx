import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type DialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function Dialog({
  triggerLabel,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <OpenButton>{triggerLabel}</OpenButton>

      <DialogPrimitive.Portal>
        <Overlay />

        <Content>
          <Header>
            <Title>{title}</Title>

            <CloseIcon aria-label="ダイアログを閉じる">
              <Icon name="cancel" size={32} />
            </CloseIcon>
          </Header>

          <Description>{description}</Description>

          <Body>{children}</Body>

          <CloseButton>閉じる</CloseButton>
        </Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const OpenButton = styled(DialogPrimitive.Trigger)`
  min-height: 32px;
  padding: 6px 16px;
  border: none;
  background-color: ${({ theme }) => theme.colors.deepGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }
`;

const Overlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 200;
  background-color: ${({ theme }) => `${theme.colors.black}99`};
`;

const Content = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 201;
  width: min(1172px, calc(100vw - 64px));
  max-height: calc(100dvh - 64px);
  padding: 40px 35px 36px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  transform: translate(-50%, -50%);
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
`;

const Title = styled(DialogPrimitive.Title)`
  margin: 0;
  font-size: 24px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.5;
`;

const CloseIcon = styled(DialogPrimitive.Close)`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }
`;

const Description = styled(DialogPrimitive.Description)`
  margin: 16px 0 28px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  line-height: 1.5;
`;

const Body = styled.div`
  display: grid;
  gap: 24px;
  min-width: 0;
`;

const CloseButton = styled(DialogPrimitive.Close)`
  display: block;
  width: 100%;
  min-height: 32px;
  margin-top: 24px;
  padding: 6px 16px;
  border: none;
  background-color: ${({ theme }) => theme.colors.deepGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }
`;
