import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import TradeHistory from "./pages/TradeHistory";
import TradeDetail from "./pages/TradeDetail";
import Review from "./pages/Review";
import TradingProfile from "./pages/TradingProfile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/add",
    Component: AddTrade,
  },
  {
    path: "/history",
    Component: TradeHistory,
  },
  {
    path: "/trade/:id",
    Component: TradeDetail,
  },
  {
    path: "/review",
    Component: Review,
  },
  {
    path: "/profile",
    Component: TradingProfile,
  },
]);