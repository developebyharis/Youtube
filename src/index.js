import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./App";
import { inject } from "@vercel/analytics";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);



inject();
