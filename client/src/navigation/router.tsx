import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
  } from "react-router-dom";
import Layout from '../Layout';
import LayoutUnique from '../LayoutUnique';
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login"
import Signup from "../pages/signup/Signup";
import StockDetails from "../pages/stockDetails/StockDetails";
import StockList from "../pages/stockList/StockList";
import BenjaminGrahamList from "../pages/benjaminGrahamList/BenjaminGrahamList";
import IntrinsicValueList from "../pages/intrinsicValueList/IntrinsicValueList";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
      {/* Routes using the Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stocklist" element={<StockList />} />
        <Route path="benjamingrahamlist" element={<BenjaminGrahamList />} />
        <Route path="stock/:symbol" element={<StockDetails />} />
        <Route path="intrinsicvaluelist" element={<IntrinsicValueList />} />
      </Route>

      {/* Unique route without Layout */}
      <Route path="/" element={<LayoutUnique />}>
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="signup" element={<Signup />} />
    </>
    )
);