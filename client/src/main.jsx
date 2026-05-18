import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App.jsx";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const appWithGoogleProvider = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
) : (
  app
);

ReactDOM.createRoot(document.getElementById("root")).render(appWithGoogleProvider);