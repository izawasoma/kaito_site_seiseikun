import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type SettingsPanelHeaderProps = {
  title: string;
  icon: string;
  id?: string;
};

export default function SettingsPanelHeader({
  title,
  icon,
  id,
}: SettingsPanelHeaderProps) {
  return (
    <Heading id={id}>
      <Icon name={icon} size={16} />
      {title}
    </Heading>
  );
}

const Heading = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin: 0;
  padding: 8px 20px;
  background-color: ${({ theme }) => theme.colors.deepGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.5;
`;
