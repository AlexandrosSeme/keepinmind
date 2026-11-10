import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="text-center py-5">
    <h1 className="h3 mb-3">Η σελιδα δεν βρεθηκε</h1>
    <Link to="/dashboard" className="btn btn-warning">
      Επιστροφη στο Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
