import React from 'react';
import ReactDOM from 'react-dom';
import './globals.css';
import App from './app';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
    }

  ]);


ReactDOM.render(<RouterProvider router={router}/>,document.querySelector("#root"));

