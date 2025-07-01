import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Homepage from "@/pages/HomePage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

import Events from "@/pages/Events";
import { AdvancedPrivateRoute } from "@/pages/AdvancedPrivateRoute";
import MyEvents from "@/pages/MyEvents";
import AddEvent from "@/pages/AddEvent";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Homepage></Homepage>,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },

      {
        path: "/events",
        element: (
          <AdvancedPrivateRoute>
            <Events></Events>
          </AdvancedPrivateRoute>
        ),
      },
      {
        path: "/my-events",
        element: (
          <AdvancedPrivateRoute>
            <MyEvents></MyEvents>
          </AdvancedPrivateRoute>
        ),
      },
      {
        path: "/add-event",
        element: (
          <AdvancedPrivateRoute>
            <AddEvent></AddEvent>
          </AdvancedPrivateRoute>
        ),
      },
    ],
  },
]);

export default routes;
