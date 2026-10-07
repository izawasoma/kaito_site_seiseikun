import styled, { keyframes } from "styled-components";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";

/** エディター読み込み中も、設定パネルの見出しと高さを維持する。 */
export default function CodeSettingsLoading() {
  return <><SettingsPanelHeader title="HTMLコード" icon="code" />
    <LoadingRow role="status"><Spinner aria-hidden="true" />エディター読み込み中</LoadingRow>
  </>;
}
const rotate = keyframes`to { transform: rotate(360deg); }`;
const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 20px;
  background-color: ${({ theme }) => theme.colors.lightGray};
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
const Spinner = styled.span`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${rotate} 0.8s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
