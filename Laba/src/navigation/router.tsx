import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
  } from "react-router-dom";
import Layout from '../Layout';
import Dashboard from "../pages/dashboard/Dashboard.tsx";
import Login from "../pages/login/Login.tsx"

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Login />} />
      </Route>
    )
);