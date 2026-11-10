import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/shared/api/supabaseClient";
import { ImageModal, PageHeader, PageLoader } from "@/shared/ui";
import { stripAccents } from "@/shared/lib/text";
import type { Member, MemberInput } from "../types";
import { useMemberMutations, useMembers } from "../queries";
import { fetchMemberById } from "../api";
import { uploadMemberPhoto } from "../photoApi";
import { useMemberAttendance } from "../hooks/useMemberAttendance";
import MemberFormModal from "../components/MemberFormModal";
import MemberProfileCard from "../components/MemberProfileCard";
import MemberEntranceLogs from "../components/MemberEntranceLogs";
import MemberAttendanceChart from "../components/MemberAttendanceChart";
import "./MemberDetailsPage.scss";

const MemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members } = useMembers();
  const { editMember, removeMember } = useMemberMutations();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const attendance = useMemberAttendance(member?.id);

  useEffect(() => {
    const loadMember = async () => {
      if (!id) {
        setError("Δεν βρεθηκε ID μελους");
        setLoading(false);
        return;
      }

      const cached = members.find((m) => m.id === parseInt(id));
      if (cached) {
        setMember(cached);
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMemberById(parseInt(id));
        if (data) {
          setMember(data);
        } else {
          setError("Δεν βρεθηκε μελος με αυτο το ID");
        }
      } catch {
        setError("Σφαλμα κατα τη φορτωση των δεδομενων");
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id, members]);

  const handleDelete = async () => {
    if (!member) return;
    if (
      window.confirm("Ειστε σιγουροι οτι θελετε να διαγραψετε αυτο το μελος;")
    ) {
      const success = await removeMember(member.id);
      if (success) navigate("/members");
    }
  };

  const handleSubmitEdit = async (
    values: MemberInput,
    photoFile: File | null,
  ) => {
    if (!member) return;

    let photoUrl = values.photo_url;
    if (photoFile) {
      const uploadedUrl = await uploadMemberPhoto(member.id, photoFile);
      if (uploadedUrl) photoUrl = uploadedUrl;
    }

    const updated = await editMember(member.id, {
      ...values,
      photo_url: photoUrl,
    });
    if (updated) {
      setMember(updated);
      setShowEditModal(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !member) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <XCircle size={48} className="text-danger mb-3" />
          <h5 className="mb-2">Σφαλμα</h5>
          <p className="text-muted mb-4">{error || "Δεν βρεθηκε μελος"}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/members")}
          >
            <ArrowLeft size={16} className="me-2" />
            Επιστροφη στη Λιστα
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="km-member">
      <PageHeader
        title="Στοιχεια Μελους"
        subtitle={`#${member.id} · ${stripAccents(member.name)}`}
        leading={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/members")}
            aria-label="Πισω"
          >
            <ArrowLeft size={16} />
          </button>
        }
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowEditModal(true)}
            >
              <Edit size={14} className="me-1" />
              Επεξεργασια
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="me-1" />
              Διαγραφη
            </button>
          </>
        }
      />

      <MemberProfileCard
        member={member}
        yearAttendance={attendance.stats.thisYear}
        onPhotoClick={() => setShowPhotoModal(true)}
      />

      <div className="km-member__grid">
        <MemberEntranceLogs
          logs={attendance.entranceLogs}
          refreshing={attendance.refreshing}
          onRefresh={() => attendance.reload(true)}
        />
        <MemberAttendanceChart
          stats={attendance.stats}
          monthly={attendance.monthly}
        />
      </div>

      {showEditModal && (
        <MemberFormModal
          title="Επεξεργασια Μελους"
          showEmail
          initialValues={{
            name: member.name,
            phone: member.phone,
            status: member.status,
            expiry: member.expiry,
            package: member.package,
            email: member.email,
            photo_url: member.photo_url,
          }}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
        />
      )}

      {showPhotoModal && member.photo_url && (
        <ImageModal
          title="Φωτογραφια Προφιλ"
          src={member.photo_url}
          alt="Profile"
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  );
};

export default MemberDetailsPage;
