import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";
import { Button, LiveChat } from "./components";
import { auth, provider } from "firebaseApp";
import { signInWithPopup } from "@firebase/auth";

function App() {
  const [user] = useAuthState(auth);

  // ref: https://yoheiko.com/blog/react%E3%81%A7%E3%81%AE%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E8%AA%8D%E8%A8%BC%E3%80%90react-firebase-hooks%E3%81%A7%E5%AE%9F%E8%A3%85%E3%80%91/
  const signIn = () => {
    signInWithPopup(auth, provider).catch((error) => {
      console.error("error in sign in", error);
    });
  };

  const signOut = () => {
    auth.signOut();
  };

  console.log("user", user);

  return (
    <div className="App">
      <header className="flex items-center justify-between p-4">
        <h1 className="font-bold">Skyway Sample</h1>
        {user && (
          <Button priority="secondary" onClick={signOut}>
            Sign out
          </Button>
        )}
      </header>
      <main>
        {user ? <LiveChat /> : <Button onClick={signIn}>Sign in</Button>}
      </main>
    </div>
  );
}

export default App;
