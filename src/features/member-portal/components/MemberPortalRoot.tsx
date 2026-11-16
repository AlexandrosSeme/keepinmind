import React from "react";
import { Outlet } from "react-router-dom";
import MemberSessionProvider from "../session/MemberSessionProvider";
import MemberInstallProvider from "../pwa/MemberInstallProvider";

/** Route element wrapping every `/member/*` route with the member session. */
const MemberPortalRoot: React.FC = () => (
  <MemberSessionProvider>
    <MemberInstallProvider>
      <Outlet />
    </MemberInstallProvider>
  </MemberSessionProvider>
);

export default MemberPortalRoot;
