import styled from "styled-components";
import AppHeader from "./components/AppHeader";
import EditorLayout from "./components/EditorLayout";

function App() {
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
