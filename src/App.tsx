import styled from "styled-components";
import AppHeader from "@/components/layout/AppHeader";
import EditorLayout from "@/components/layout/EditorLayout";
import ComponentGallery from "@/components/dev/ComponentGallery";
import useProjectEditor from "@/hooks/useProjectEditor";

function App() {
  const editor = useProjectEditor();
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("components")
  ) {
    return <ComponentGallery />;
  }
  return (
    <AppContainer>
      <AppHeader project={editor.project} />
      <EditorLayout editor={editor} />
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
`;

export default App;
