import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { isFirebaseConfigured, getFirebaseApp } from "./app/lib/firebase";

if (isFirebaseConfigured()) {
  getFirebaseApp();
}
createRoot(document.getElementById("root")!).render(<App />);
  