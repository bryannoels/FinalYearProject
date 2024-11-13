import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
  } from "react-router-dom";
import Layout from '../Layout.tsx';
import Dashboard from "../pages/dashboard/Dashboard.tsx";
import Login from "../pages/login/Login.tsx"
import StockDetails from "../pages/stockDetails/StockDetails.tsx";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="stock/:symbol" element={<StockDetails />} />
      </Route>
    )
);