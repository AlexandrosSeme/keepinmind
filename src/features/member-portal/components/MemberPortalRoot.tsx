import React from "react";
import { Outlet } from "react-router-dom";
import MemberSessionProvider from "../session/MemberSessionProvider";

/** Route element wrapping every `/member/*` route with the member session. */
const MemberPortalRoot: React.FC = () => (
  <MemberSessionProvider>
    <Outlet />
  </MemberSessionProvider>
);

export default MemberPortalRoot;
