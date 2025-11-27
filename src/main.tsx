// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";

// import { router } from "./router.tsx";
// import { RouterProvider } from "react-router";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>
// );

// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";

// import { router } from "./router.tsx";
// import { RouterProvider } from "react-router";

// import { Provider } from "react-redux";
// import { store } from "./Redux/store/store";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>

//     <Provider store={store}>
//       <RouterProvider router={router} />
//     </Provider>
//   </StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
// import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
// import { router } from './router';
import { RootWraper } from './wrapper';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RootWraper />
    </Provider>
  </React.StrictMode>
);
