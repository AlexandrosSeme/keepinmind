import React from "react";
import { Outlet } from "react-router-dom";
import StaffAuthProvider from "../session/StaffAuthProvider";

/** Route element wrapping the staff login and admin routes with the staff session. */
const StaffAuthRoot: React.FC = () => (
  <StaffAuthProvider>
    <Outlet />
  </StaffAuthProvider>
);

export default StaffAuthRoot;
