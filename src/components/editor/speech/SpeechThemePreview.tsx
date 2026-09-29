import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

export type SpeechTheme = "rpg" | "normal" | "rounded";

type SpeechThemePreviewProps = {
  value: SpeechTheme;
};

export default function SpeechThemePreview({ value }: SpeechThemePreviewProps) {
  return (
    <Preview $variant={value} aria-hidden="true">
      <Window $variant={value}>
        <Avatar>
          <Icon name="face" size={38} />
        </Avatar>

        <Text>
          <Name>キャラクター名</Name>
          <Message $variant={value}>
            {"ここにはメッセージが入ります。".repeat(5)}
          </Message>
        </Text>
      </Window>
    </Preview>
  );
}

const Preview = styled.span<{ $variant: SpeechTheme }>`
  display: block;
  padding: 5px;
  background-color: ${({ theme }) => theme.colors.lightGray};
`;

const Window = styled.span<{ $variant: SpeechTheme }>`
  display: flex;
  align-items: center;
  gap: ${({ $variant }) => ($variant === "rpg" ? "5px" : "12px")};
  min-height: 52px;
  padding: ${({ $variant }) => ($variant === "rpg" ? "4px" : "0")};
  border: ${({ $variant, theme }) =>
    $variant === "rpg" ? `2px solid ${theme.colors.white}` : "none"};
  background-color: ${({ $variant, theme }) =>
    $variant === "rpg" ? theme.colors.black : "transparent"};
  color: ${({ $variant, theme }) =>
    $variant === "rpg" ? theme.colors.white : theme.colors.black};
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
`;

const Text = styled.span`
  display: grid;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const Name = styled.span`
  display: block;
  font-size: 8px;
  line-height: 1.2;
`;

const Message = styled.span<{ $variant: SpeechTheme }>`
  position: relative;
  display: block;
  padding: ${({ $variant }) => ($variant === "rpg" ? "0" : "5px 8px")};
  border-radius: ${({ $variant }) => ($variant === "rounded" ? "8px" : "0")};
  background-color: ${({ $variant, theme }) =>
    $variant === "rpg" ? "transparent" : theme.colors.white};
  font-size: 8px;
  line-height: 1.25;
  overflow-wrap: anywhere;

  &::before {
    content: "";
    display: ${({ $variant }) => ($variant === "rpg" ? "none" : "block")};
    position: absolute;
    top: 10px;
    left: -8px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 8px solid ${({ theme }) => theme.colors.white};
  }
`;
