import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Filter, Plus, Search } from "lucide-react";
import { ImageModal, PageHeader } from "@/shared/ui";
import { EMPTY_MEMBER_INPUT, type Member, type MemberInput } from "../types";
import { useMemberMutations, useMembers } from "../queries";
import { uploadMemberPhoto } from "../photoApi";
import { useToggleCardLost } from "../hooks/useToggleCardLost";
import MemberFormModal from "../components/MemberFormModal";
import MembersTable from "../components/MembersTable";
import MemberCardList from "../components/MemberCardList";
import type { MemberRowActions } from "../components/memberActions";

type FormState = { mode: "add" } | { mode: "edit"; member: Member } | null;

const MembersPage: React.FC = () => {
  const { t } = useTranslation("members");
  const { members } = useMembers();
  const { addMember, editMember, removeMember } = useMemberMutations();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<FormState>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm),
  );

  const handleDelete = async (member: Member) => {
    if (window.confirm(t("confirmDelete"))) {
      await removeMember(member.id);
    }
  };

  const handleToggleCardLost = useToggleCardLost();

  const handleSubmitAdd = async (
    values: MemberInput,
    photoFile: File | null,
  ) => {
    // The photo is stored under the member id, so create the member first.
    if (photoFile && !values.photo_url) {
      const created = await addMember({ ...values, photo_url: undefined });
      if (!created) return;
      const uploadedUrl = await uploadMemberPhoto(created.id, photoFile);
      if (uploadedUrl) {
        await editMember(created.id, { photo_url: uploadedUrl });
      }
      setForm(null);
      return;
    }

    const created = await addMember(values);
    if (created) setForm(null);
  };

  const handleSubmitEdit = async (
    member: Member,
    values: MemberInput,
    photoFile: File | null,
  ) => {
    let photoUrl = values.photo_url;
    if (photoFile) {
      const uploadedUrl = await uploadMemberPhoto(member.id, photoFile);
      if (uploadedUrl) photoUrl = uploadedUrl;
    }

    const updated = await editMember(member.id, {
      ...values,
      photo_url: photoUrl,
    });
    if (updated) setForm(null);
  };

  const rowActions: MemberRowActions = {
    onView: (member) => navigate(`/members/${member.id}`),
    onEdit: (member) => setForm({ mode: "edit", member }),
    onToggleCardLost: handleToggleCardLost,
    onPrintCard: (member) => navigate(`/print-qr-codes?id=${member.id}`),
    onDelete: handleDelete,
    onPhotoClick: setPhotoPreview,
  };

  return (
    <div>
      <PageHeader
        title={t("page.title")}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setForm({ mode: "add" })}
          >
            <Plus size={16} className="me-2" />
            {t("page.newMember")}
          </button>
        }
      />

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-8">
              <div className="position-relative">
                <Search
                  size={16}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder={t("page.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                {t("page.filters")}
              </button>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Download size={16} className="me-2" />
                {t("page.export")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MembersTable members={filteredMembers} {...rowActions} />
      <MemberCardList members={filteredMembers} {...rowActions} />

      {form?.mode === "add" && (
        <MemberFormModal
          title={t("page.addTitle")}
          initialValues={EMPTY_MEMBER_INPUT}
          onClose={() => setForm(null)}
          onSubmit={handleSubmitAdd}
        />
      )}

      {form?.mode === "edit" && (
        <MemberFormModal
          title={t("page.editTitle")}
          initialValues={{
            name: form.member.name,
            phone: form.member.phone,
            status: form.member.status,
            expiry: form.member.expiry,
            package: form.member.package,
            photo_url: form.member.photo_url,
          }}
          onClose={() => setForm(null)}
          onSubmit={(values, photoFile) =>
            handleSubmitEdit(form.member, values, photoFile)
          }
        />
      )}

      {photoPreview && (
        <ImageModal
          title={t("fields.photo")}
          src={photoPreview}
          alt={t("fields.photo")}
          onClose={() => setPhotoPreview(null)}
        />
      )}
    </div>
  );
};

export default MembersPage;
