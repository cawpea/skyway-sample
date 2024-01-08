import "./App.css";
import { LiveChat } from "./components/liveChat";

function App() {
  return (
    <div className="App">
      <header className="flex items-center justify-start p-4">
        <h1 className="font-bold">Skyway Sample</h1>
      </header>
      <main>
        <LiveChat />
      </main>
    </div>
  );
}

export default App;
