import { Suspense, lazy } from "react";

const Loading = <div>Loading....</div>;
const Event = lazy(() => import("../pages/event/EventPage.js"));
const EventRead = lazy(() => import("../pages/event/EventReadPage.js"));
const EventAdd = lazy(() => import("../pages/event/EventAddPage.js"));
const eventRouter = () => {
  return [
    {
      path: "/event",
      element: (
        <Suspense fallback={Loading}>
          <Event />
        </Suspense>
      ),
    },
    {
      path: "/event/:id",
      element: (
        <Suspense fallback={Loading}>
          <EventRead />
        </Suspense>
      ),
    },
    {
      path: "/event/add",
      element: (
        <Suspense fallback={Loading}>
          <EventAdd />
        </Suspense>
      ),
    },
  ];
};

export default eventRouter;
