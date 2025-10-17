import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Penalty from "./pages/Penalty";
import Leaderboards from "./pages/Leaderboards";
// import LeetCode from "./pages/LeetCode";
// import Codeforces from "./pages/Codeforces";
// import GitHub from "./pages/GitHub";
import Settings from "./pages/Settings";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const qc = new QueryClient();

const router = createBrowserRouter([
{
path: "/",
element: (
<AppLayout>
<Dashboard />
</AppLayout>

),
},
{ path: "/missions", element: <AppLayout><Missions /></AppLayout> },
{ path: "/penalty", element: <AppLayout><Penalty /></AppLayout> },
{ path: "/leaderboards", element: <AppLayout><Leaderboards /></AppLayout> },
// { path: "/platforms/leetcode", element: <AppLayout><LeetCode /></AppLayout> },
// { path: "/platforms/codeforces", element: <AppLayout><Codeforces /></AppLayout> },
// { path: "/platforms/github", element: <AppLayout><GitHub /></AppLayout> },
{ path: "/settings", element: <AppLayout><Settings /></AppLayout> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
<QueryClientProvider client={qc}>
<RouterProvider router={router} />
<ToastContainer position="bottom-right" theme="dark" /> 
<ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
</React.StrictMode>
);