import styled from "styled-components";
import AppHeader from "@/components/layout/AppHeader";
import EditorLayout from "@/components/layout/EditorLayout";
import ComponentGallery from "@/components/dev/ComponentGallery";

function App() {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("components")
  ) {
    return <ComponentGallery />;
  }
  return (
    <AppContainer>
      <AppHeader />
      <EditorLayout />
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
`;

export default App;
