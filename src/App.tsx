import styled from "styled-components";
import AppHeader from "@/components/layout/AppHeader";
import EditorLayout from "@/components/layout/EditorLayout";
import ComponentGallery from "@/components/dev/ComponentGallery";
import useProjectEditor from "@/hooks/useProjectEditor";

function App() {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("components")
  ) {
    return <ComponentGallery />;
  }
  return <ProjectWorkspace />;
}

/** 部品ギャラリーの閲覧では編集データの読み書きを行わない。 */
function ProjectWorkspace() {
  const editor = useProjectEditor();
  return (
    <AppContainer>
      <AppHeader project={editor.project} onImport={editor.replaceProject} onReplaceImageUrls={editor.replaceImageUrls} />
      {editor.storageError && <StorageError role="alert">{editor.storageError}</StorageError>}
      <EditorLayout editor={editor} />
    </AppContainer>
  );
}

const StorageError = styled.div`
  position: fixed;
  bottom: 12px;
  left: 50%;
  z-index: 300;
  width: min(800px, calc(100vw - 32px));
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.red};
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  transform: translateX(-50%);
`;

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
`;

export default App;
