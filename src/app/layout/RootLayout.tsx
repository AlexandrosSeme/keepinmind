import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { PageLoader } from "@/shared/ui";

/** Top-level route element: suspense boundary for lazily loaded standalone pages. */
const RootLayout: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);

export default RootLayout;
