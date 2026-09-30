import Switch from "@/components/ui/form/Switch";
import { useState } from "react";
import styled from "styled-components";
import SegmentedControl from "@/components/ui/form/SegmentedControl";
import WordPressPreview from "./WordPressPreview";
import type { PreviewDevice } from "./wordpress/previewEnvironment";
import type { ProjectData } from "@/types/project";

const deviceOptions = [
  { value: "pc", label: "PC表示", icon: "desktop_windows" },
  { value: "sp", label: "SP表示", icon: "smartphone" },
] as const;

/** プレビューの見出し・表示切り替え・iframeをまとめる。表示選択は保存対象外。 */
export default function PreviewPanel({ project }: { project: ProjectData }) {
  const [unlockAll, setUnlockAll] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>("pc");

  return (
    <Panel aria-labelledby="preview-heading">
      <Header>
        <Heading id="preview-heading">プレビュー</Heading>
        <Switch label="全ロック解除" checked={unlockAll} onChange={(event) => setUnlockAll(event.target.checked)} />
        <DeviceControl>
          <SegmentedControl
            label="プレビューの表示環境"
            hideLabel
            value={device}
            options={deviceOptions}
            onValueChange={(selectedDevice) => {
              if (selectedDevice === "pc" || selectedDevice === "sp") {
                setDevice(selectedDevice);
              }
            }}
          />
        </DeviceControl>
      </Header>
      {project.blocks.length > 0 && (
        <WordPressPreview project={project} device={device} unlockAll={unlockAll} />
      )}
    </Panel>
  );
}

const Panel = styled.section`
  min-width: 0;
  padding: 12px 13px 24px 26px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Heading = styled.h2`
  flex-shrink: 0;
  margin: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.5;
`;

const DeviceControl = styled.div`
  width: 240px;
  min-width: 80px;
`;
