import "./App.css";
import { Video } from "./components/video";

function App() {
  return (
    <div className="App">
      <header className="flex items-center justify-start p-4">
        <h1 className="font-bold">Skyway Sample</h1>
      </header>
      <main>
        <Video />
      </main>
    </div>
  );
}

export default App;
