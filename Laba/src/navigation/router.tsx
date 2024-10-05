import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
  } from "react-router-dom";
import App from '../App.tsx'
import Dashboard from "../pages/dashboard/Dashboard.tsx";
import Login from "../pages/login/Login.tsx"
import Navbar from "../pages/navbar/Navbar.tsx"

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="navbar" element={<Navbar />} />
        </>
    )
);