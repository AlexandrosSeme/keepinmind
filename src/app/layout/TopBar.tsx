import React from "react";
import { Bell, Menu, User } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => (
  <header className="km-topbar shadow-sm">
    <div className="container-fluid">
      <div className="row align-items-center py-3">
        <div className="col">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary d-lg-none"
              onClick={onMenuClick}
            >
              <Menu size={20} />
            </button>
            <div>
              <small className="welcome-label">
                Καλως ηρθατε στο συστημα διαχειρισης
              </small>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="d-flex align-items-center gap-4">
            <button
              type="button"
              className="btn btn-outline-secondary position-relative"
            >
              <Bell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <div className="d-flex align-items-center gap-2">
              <div className="km-avatar d-flex align-items-center justify-content-center">
                <User size={20} />
              </div>
              <div className="d-none d-md-block">
                <div className="admin-name">Admin</div>
                <small className="welcome-label">Διαχειριστης</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default TopBar;
