import React from "react";
import ReactDOM from "react-dom/client"; // Correct import statement
import { BrowserRouter as Router } from "react-router-dom";
import { App } from "./containers";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);