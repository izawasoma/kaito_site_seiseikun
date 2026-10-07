import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { generateProjectCode } from "@/lib/export/generateProjectCode";
import { buildPreviewDocument } from "./wordpress/buildPreviewDocument";
import {
  previewEnvironments,
  type PreviewDevice,
} from "./wordpress/previewEnvironment";
import type { ProjectData } from "@/types/project";

type WordPressPreviewProps = {
  project: ProjectData;
  device: PreviewDevice;
  unlockAll?: boolean;
};

/**
 * 共通の生成コードをWordPress疑似環境のiframeに表示する。
 *
 * @remarks
 * プロジェクトまたは表示環境が更新されたときに表示用HTMLを再生成する。
 * iframe内のレイアウト幅を維持し、表示領域に合わせて縮小する。
 */
export default function WordPressPreview({ project, device, unlockAll = false }: WordPressPreviewProps) {
  const [revision, setRevision] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const snapshot = useRef<{ scrollY: number; progress?: unknown }>({ scrollY: 0 });
  const viewportWidth = previewEnvironments[device].width;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const previewDocument = useMemo(() => {
    const generatedCode = generateProjectCode(project);
    return buildPreviewDocument(generatedCode, device, unlockAll);
  }, [project, device, unlockAll]);

  useEffect(() => {
    snapshot.current = { scrollY: 0 };
  }, [device, unlockAll, project.pageSettings.displayMode]);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "conversation-preview-alert" && typeof event.data.message === "string") {
        window.alert(event.data.message);
      }
      if (event.data?.type === "conversation-preview-state" && Number.isFinite(event.data.scrollY)) {
        snapshot.current = { scrollY: event.data.scrollY, progress: event.data.progress };
      }
      if (event.data?.type === "conversation-preview-reset-request" && window.confirm("プレビューの進捗を削除して、最初から表示しますか？")) {
        snapshot.current = { scrollY: 0 };
        setRevision((currentRevision) => currentRevision + 1);
      }
      if (event.data?.type === "conversation-preview-ready") {
        frameRef.current?.contentWindow?.postMessage({ type: "conversation-preview-restore", state: snapshot.current }, "*");
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    /** 表示領域のサイズ変更に合わせて、縮小率の計算元を更新する。 */
    const resizeObserver = new ResizeObserver(([viewportEntry]) => {
      if (!viewportEntry) {
        return;
      }

      setViewportSize({
        width: viewportEntry.contentRect.width,
        height: viewportEntry.contentRect.height,
      });
    });

    resizeObserver.observe(viewportElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const previewScale =
    viewportSize.width > 0
      ? Math.min(viewportSize.width / viewportWidth, 1)
      : 1;

  const iframeHeight = viewportSize.height / previewScale;

  return (
    <PreviewViewport ref={viewportRef}>
      <PreviewFrame
        key={revision}
        ref={frameRef}
        title={`WordPressの${device === "pc" ? "PC" : "SP"}表示プレビュー`}
        srcDoc={previewDocument}
        sandbox="allow-scripts allow-forms"
        style={{
          width: viewportWidth,
          height: iframeHeight,
          transform: `scale(${previewScale})`,
        }}
      />
    </PreviewViewport>
  );
}

const PreviewViewport = styled.div`
  position: relative;
  width: 100%;
  height: calc(100dvh - 154px);
  min-height: 320px;
  overflow: hidden;
`;

const PreviewFrame = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  border: 0;
  transform-origin: top left;
`;
