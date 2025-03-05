import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
  } from "react-router-dom";
import Layout from '../Layout.tsx';
import LayoutUnique from '../LayoutUnique.tsx';
import Dashboard from "../pages/dashboard/Dashboard.tsx";
import Login from "../pages/login/Login.tsx"
import Signup from "../pages/signup/Signup.tsx"
import StockDetails from "../pages/stockDetails/StockDetails.tsx";
import StockList from "../pages/stockList/StockList.tsx";
import BenjaminGrahamList from "../pages/benjaminGrahamList/BenjaminGrahamList.tsx";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
      {/* Routes using the Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stocklist" element={<StockList />} />
        <Route path="benjamingrahamlist" element={<BenjaminGrahamList />} />
        <Route path="stock/:symbol" element={<StockDetails />} />
      </Route>

      {/* Unique route without Layout */}
      <Route path="/" element={<LayoutUnique />}>
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="signup" element={<Signup />} />
    </>
    )
);