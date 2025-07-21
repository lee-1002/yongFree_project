import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import BasicLayout from "../layouts/BasicLayout"; // BasicLayout을 import
import memberRouter from "./memberRouter";
import sellingRouter from "./sellingRouter";
import donationRouter from "./donationRouter";
import boardRouter from "./boardRouter";
import searchRouter from "./searchRouter";
import eventRouter from "./eventRouter";

const Loading = <div>Loading...</div>;

const MainPage = lazy(() => import("../pages/MainPage"));
const MapPage = lazy(() => import("../pages/MapPage"));
const EventPage = lazy(() => import("../pages/event/EventPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const ChatbotPage = lazy(() => import("../pages/ChatbotPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <BasicLayout />, // 1. BasicLayout이 모든 페이지의 부모가 됩니다.
    children: [
      // 이 안에 있는 페이지들은 BasicLayout 안의 <Outlet>에 표시됩니다.
      {
        index: true, // path가 '/'일 때 MainPage를 보여줍니다.
        element: (
          <Suspense fallback={Loading}>
            <MainPage />
          </Suspense>
        ),
      },
      {
        path: "map",
        element: (
          <Suspense fallback={Loading}>
            <MapPage />
          </Suspense>
        ),
      },

      {
        path: "cart",
        element: (
          <Suspense fallback={Loading}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "event",
        element: (
          <Suspense fallback={Loading}>
            <EventPage />
          </Suspense>
        ),
        children: eventRouter(),
      },

      {
        path: "board",
        children: boardRouter(),
      },
      {
        path: "selling",
        children: sellingRouter(),
      },
      {
        path: "donation",
        children: donationRouter(),
      },
      {
        path: "search",
        children: searchRouter(),
      },
    ],
  },
  // 레이아웃이 필요 없는 독립적인 페이지 (예: 팝업 챗봇)
  {
    path: "/chatbot-window",
    element: (
      <Suspense fallback={Loading}>
        <ChatbotPage />
      </Suspense>
    ),
  },
  {
    path: "/member",
    children: memberRouter(),
  },
]);

export default root;
