import React, { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { fetchAnnouncements } from "../../services/announcementService";
import type { Announcement } from "../../types";

const MemberAnnouncements: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchAnnouncements();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="mp-page-title">Ανακοινωσεις</h1>
      <p className="mp-page-sub">Νεα και ενημερωσεις απο το Melos.</p>

      {loading ? (
        <div className="mp-empty">Φορτωση...</div>
      ) : items.length === 0 ? (
        <div className="mp-empty">
          <Megaphone size={28} className="mb-2 opacity-50" />
          <div>Δεν υπαρχουν ανακοινωσεις</div>
        </div>
      ) : (
        items.map((a) => (
          <article key={a.id} className="mp-card">
            <div className="mp-card-title">{a.title}</div>
            <small className="text-muted d-block mb-2">
              {new Date(a.created_at).toLocaleDateString("el-GR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </small>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {a.body}
            </p>
          </article>
        ))
      )}
    </div>
  );
};

export default MemberAnnouncements;
