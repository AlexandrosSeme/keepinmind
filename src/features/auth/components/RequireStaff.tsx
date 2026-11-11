import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "@/shared/ui";
import { useStaffAuth } from "../session/useStaffAuth";

/** Lets only signed-in staff (admin/owner/trainer) through; everyone else goes to `/login`. */
const RequireStaff: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, loading, signedOut } = useStaffAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!profile) {
    // Remember the requested page only for real redirects, not after a sign-out.
    return (
      <Navigate
        to="/login"
        replace
        state={signedOut ? undefined : { from: location }}
      />
    );
  }
  return <>{children}</>;
};

export default RequireStaff;
