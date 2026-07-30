import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Plus,
  User,
  Edit,
  Trash2,
  Camera,
  X,
  Eye,
  CreditCard,
  Printer,
  AlertTriangle,
} from "lucide-react";
import type { Member } from "../types";
import { useAppData } from "../contexts/AppDataContext";
import { uploadMemberPhoto } from "../services/photoService";
import StatusBadge from "./ui/StatusBadge";

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members: membersProp }) => {
  const { members, addMember, editMember, removeMember } = useAppData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Omit<Member, "id">>({
    name: "",
    phone: "",
    status: "active",
    expiry: "",
    package: "",
  });

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFileInput, setUseFileInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use members from context if available, otherwise use prop
  const displayMembers = members.length > 0 ? members : membersProp;

  const filteredMembers = displayMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      status: "active",
      expiry: "",
      package: "",
    });
    setCapturedPhoto(null);
    setPhotoFile(null);
    setShowAddModal(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      status: member.status,
      expiry: member.expiry,
      package: member.package,
      photo_url: member.photo_url,
    });
    setCapturedPhoto(member.photo_url || null);
    setPhotoFile(null);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm("Ειστε σιγουροι οτι θελετε να διαγραψετε αυτο το μελος;")
    ) {
      await removeMember(id);
    }
  };

  const handleToggleCardLost = async (member: Member) => {
    const isCurrentlyLost = member.card_lost === true;
    const confirmMessage = isCurrentlyLost
      ? `Ειστε σιγουροι οτι θελετε να ενεργοποιησετε την καρτα του ${member.name};`
      : `Ειστε σιγουροι οτι θελετε να ακυρωσετε την καρτα του ${member.name};\n\nΑυτο θα εμποδισει τη χρηση της καρτας μεχρι να εκτυπωθει νεα.`;

    if (window.confirm(confirmMessage)) {
      const updated = await editMember(member.id, {
        card_lost: !isCurrentlyLost,
      });
      if (updated) {
        alert(
          isCurrentlyLost
            ? `Η καρτα του ${member.name} ενεργοποιηθηκε επιτυχως.`
            : `Η καρτα του ${member.name} ακυρωθηκε. Μπορειτε να εκτυπωσετε νεα καρτα.`
        );
      }
    }
  };

  const handlePrintNewCard = (member: Member) => {
    // Navigate to print page with member ID
    navigate(`/print-qr-codes?id=${member.id}`);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload photo if captured
    if (photoFile && !formData.photo_url) {
      // We'll upload after member creation to get the member ID
      const tempMember = await addMember({ ...formData, photo_url: undefined });
      if (tempMember) {
        const uploadedUrl = await uploadMemberPhoto(tempMember.id, photoFile);
        if (uploadedUrl) {
          // Update member with photo URL
          await editMember(tempMember.id, { photo_url: uploadedUrl });
          setShowAddModal(false);
          setFormData({
            name: "",
            phone: "",
            status: "active",
            expiry: "",
            package: "",
          });
          setCapturedPhoto(null);
          setPhotoFile(null);
          return;
        }
      }
    }

    const newMember = await addMember(formData);
    if (newMember) {
      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        status: "active",
        expiry: "",
        package: "",
      });
      setCapturedPhoto(null);
      setPhotoFile(null);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      // Upload new photo if captured
      let photoUrl = formData.photo_url;
      if (photoFile) {
        const uploadedUrl = await uploadMemberPhoto(
          editingMember.id,
          photoFile
        );
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const updated = await editMember(editingMember.id, {
        ...formData,
        photo_url: photoUrl,
      });
      if (updated) {
        setShowEditModal(false);
        setEditingMember(null);
        setCapturedPhoto(null);
        setPhotoFile(null);
      }
    }
  };

  // Camera functions
  const startCamera = async () => {
    // Check if browser supports camera API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Το browser σας δεν υποστηριζει προσβαση στην καμερα. Χρησιμοποιηστε file upload."
      );
      setUseFileInput(true);
      return;
    }

    // Check if running on HTTPS or localhost
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isSecure) {
      setCameraError(
        "Η καμερα απαιτει HTTPS connection. Χρησιμοποιηστε file upload."
      );
      setUseFileInput(true);
      return;
    }

    try {
      setCameraError(null);

      // Try with facingMode first (preferred for selfie)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (facingModeError) {
        console.warn(
          "[Camera] facingMode failed, trying without constraints:",
          facingModeError
        );
        // Fallback: try without facingMode constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (fallbackError) {
          console.warn(
            "[Camera] Fallback failed, trying minimal constraints:",
            fallbackError
          );
          // Last resort: minimal constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      setCameraStream(stream);
      setShowCamera(true);
      setUseFileInput(false);

      // Use setTimeout to ensure modal is rendered before setting video src
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current
                .play()
                .catch((err) => {
                  console.error("[Camera] Error playing video:", err);
                  setCameraError("Σφαλμα κατα την αναπαραγωγη του video.");
                });
            }
          };

          videoRef.current.onerror = (e) => {
            console.error("[Camera] Video error:", e);
            setCameraError("Σφαλμα κατα την προβολη της καμερας.");
          };

          // Try to play immediately as well
          videoRef.current.play().catch((err) => {
            console.warn(
              "[Camera] Could not play immediately, waiting for metadata:",
              err
            );
          });
        } else {
          console.error("[Camera] Video ref is null after modal open");
        }
      }, 100);
    } catch (error: unknown) {
      console.error("[Camera] Error accessing camera:", error);
      let errorMessage = "Δεν ηταν δυνατη η προσβαση στην καμερα.";
      let showInstructions = false;

      const errorObj = error as { name?: string; message?: string };
      if (
        errorObj.name === "NotAllowedError" ||
        errorObj.name === "PermissionDeniedError"
      ) {
        errorMessage = "Δεν δοθηκε αδεια προσβασης στην καμερα.";
        showInstructions = true;
      } else if (
        errorObj.name === "NotFoundError" ||
        errorObj.name === "DevicesNotFoundError"
      ) {
        errorMessage =
          "Δεν βρεθηκε καμερα. Παρακαλω χρησιμοποιηστε file upload.";
      } else if (
        errorObj.name === "NotReadableError" ||
        errorObj.name === "TrackStartError"
      ) {
        errorMessage =
          "Η καμερα χρησιμοποιειται απο αλλη εφαρμογη. Παρακαλω κλειστε την αλλη εφαρμογη.";
      } else if (
        errorObj.name === "OverconstrainedError" ||
        errorObj.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage = "Η καμερα δεν υποστηριζει τις απαιτουμενες ρυθμισεις.";
      } else if (errorObj.name === "SecurityError") {
        errorMessage =
          "Σφαλμα ασφαλειας. Βεβαιωθειτε οτι χρησιμοποιειτε HTTPS.";
      }

      if (showInstructions) {
        errorMessage +=
          '\n\nΟδηγιες για Chrome:\n1. Καντε κλικ στο εικονιδιο κλειδωματος (🔒) στην αριστερη πλευρα της γραμμης διευθυνσεων\n2. Βρειτε "Camera" και επιλεξτε "Allow"\n3. Καντε refresh τη σελιδα';
      }

      setCameraError(errorMessage);
      setUseFileInput(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("[Camera] Video or canvas ref is missing");
      setCameraError(
        "Σφαλμα: Δεν βρεθηκε video element. Παρακαλω δοκιμαστε ξανα."
      );
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    if (video.readyState < 2) {
      setCameraError("Η καμερα δεν ειναι ετοιμη. Παρακαλω περιμενετε...");
      setTimeout(() => {
        setCameraError(null);
        capturePhoto();
      }, 500);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("[Camera] Video dimensions are zero");
      setCameraError(
        "Η καμερα δεν βγαζει εικονα. Παρακαλω ελεγξτε τη συνδεση της καμερας."
      );
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("[Camera] Could not get canvas context");
      setCameraError("Σφαλμα κατα την ληψη της φωτογραφιας.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            setPhotoFile(file);
            setCapturedPhoto(canvas.toDataURL("image/jpeg"));
            stopCamera();
            setCameraError(null);
          } else {
            console.error("[Camera] Failed to create blob");
            setCameraError("Σφαλμα κατα την αποθηκευση της φωτογραφιας.");
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("[Camera] Error capturing photo:", error);
      setCameraError("Σφαλμα κατα την ληψη της φωτογραφιας.");
    }
  };

  const removePhoto = () => {
    setCapturedPhoto(null);
    setPhotoFile(null);
    setCameraError(null);
    setUseFileInput(false);
    setFormData((prev) => ({ ...prev, photo_url: undefined }));
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Παρακαλω επιλεξτε αρχειο εικονας.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Το αρχειο ειναι πολυ μεγαλο. Μεγιστο μεγεθος: 10MB.");
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  // Set video stream when modal opens and video element is ready
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStream;

      video.onloadedmetadata = () => {
        video
          .play()
          .catch((err) => {
            console.error("[Camera] Error playing video in useEffect:", err);
            setCameraError("Σφαλμα κατα την αναπαραγωγη του video.");
          });
      };

      video.onerror = (e) => {
        console.error("[Camera] Video error in useEffect:", e);
        setCameraError("Σφαλμα κατα την προβολη της καμερας.");
      };

      // Try to play immediately
      video.play().catch((err) => {
        console.warn(
          "[Camera] Could not play immediately in useEffect:",
          err
        );
      });
    }
  }, [showCamera, cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div>
      {/* Header */}
      <div className="km-page-header">
        <h2 className="km-page-title">Μελη Γυμναστηριου</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} className="me-2" />
          Νεο Μελος
        </button>
      </div>

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
                  placeholder="Αναζητηση μελους (ονομα, τηλεφωνο)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                Φιλτρα
              </button>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <button className="btn btn-outline-secondary w-100">
                <Download size={16} className="me-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0 ps-4">Ονοματεπωνυμο</th>
                  <th className="border-0">Τηλεφωνο</th>
                  <th className="border-0 d-none d-md-table-cell">Πακετο</th>
                  <th className="border-0 d-none d-lg-table-cell">Ληξη</th>
                  <th className="border-0">Κατασταση</th>
                  <th className="border-0 pe-4">Ενεργειες</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="rounded-circle me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() => setShowPhotoModal(member.photo_url!)}
                          />
                        ) : (
                          <div
                            className="km-avatar-soft rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <User size={20} className="text-primary" />
                          </div>
                        )}
                        <div>
                          <div 
                            className="fw-semibold text-dark"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/members/${member.id}`)}
                          >
                            {member.name}
                          </div>
                          <small className="text-muted d-md-none">
                            {member.phone}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <span className="text-muted">{member.phone}</span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <span className="text-muted">{member.package}</span>
                    </td>
                    <td className="d-none d-lg-table-cell">
                      <span className="text-muted">{member.expiry}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-column align-items-start gap-1">
                        <StatusBadge status={member.status} />
                        {member.card_lost === true && (
                          <StatusBadge
                            status="card_lost"
                            icon={<AlertTriangle size={11} />}
                            showDot={false}
                          />
                        )}
                      </div>
                    </td>
                    <td className="pe-4">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-link btn-sm km-action-link p-0 me-2"
                          onClick={() => navigate(`/members/${member.id}`)}
                          title="Προβολη"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-link btn-sm km-action-link p-0 me-2"
                          onClick={() => handleEdit(member)}
                          title="Επεξεργασια"
                        >
                          <Edit size={16} />
                        </button>
                        {member.card_lost === true ? (
                          <>
                            <button
                              className="btn btn-link btn-sm km-action-link p-0 me-2"
                              onClick={() => handleToggleCardLost(member)}
                              title="Ενεργοποιηση Καρτας"
                            >
                              <CreditCard size={16} />
                            </button>
                            <button
                              className="btn btn-link btn-sm km-action-link p-0 me-2"
                              onClick={() => handlePrintNewCard(member)}
                              title="Εκτυπωση Νεας Καρτας"
                            >
                              <Printer size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-link btn-sm km-action-link km-action-danger p-0 me-2"
                            onClick={() => handleToggleCardLost(member)}
                            title="Ακυρωση Καρτας (Χαμενη)"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button
                          className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                          onClick={() => handleDelete(member.id)}
                          title="Διαγραφη"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="d-md-none">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="rounded-circle me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowPhotoModal(member.photo_url!)}
                    />
                  ) : (
                    <div
                      className="km-avatar-soft rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <User size={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h6 
                      className="mb-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      {member.name}
                    </h6>
                    <small className="text-muted">{member.phone}</small>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end gap-1">
                  <StatusBadge status={member.status} />
                  {member.card_lost === true && (
                    <StatusBadge
                      status="card_lost"
                      icon={<AlertTriangle size={11} />}
                      showDot={false}
                    />
                  )}
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">Πακετο</small>
                  <span className="text-dark">{member.package}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Ληξη</small>
                  <span className="text-dark">{member.expiry}</span>
                </div>
              </div>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <Eye size={14} className="me-1" />
                  Προβολη
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleEdit(member)}
                >
                  <Edit size={14} className="me-1" />
                  Επεξεργασια
                </button>
                {member.card_lost === true ? (
                  <>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleToggleCardLost(member)}
                    >
                      <CreditCard size={14} className="me-1" />
                      Ενεργοποιηση Καρτας
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handlePrintNewCard(member)}
                    >
                      <Printer size={14} className="me-1" />
                      Εκτυπωση Νεας Καρτας
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleToggleCardLost(member)}
                  >
                    <CreditCard size={14} className="me-1" />
                    Ακυρωση Καρτας
                  </button>
                )}
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 size={14} className="me-1" />
                  Διαγραφη
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowAddModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Προσθηκη Νεου Μελους</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitAdd}>
                <div className="modal-body">
                  {/* Photo Section */}
                  <div className="mb-4">
                    <label className="form-label">Φωτογραφια Προφιλ</label>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-3">
                        {capturedPhoto ? (
                          <div className="position-relative">
                            <img
                              src={capturedPhoto}
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                              style={{
                                width: "24px",
                                height: "24px",
                                padding: 0,
                              }}
                              onClick={removePhoto}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "100px", height: "100px" }}
                          >
                            <User size={40} className="text-muted" />
                          </div>
                        )}
                        <div className="d-flex flex-column gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={useFileInput ? openFileInput : startCamera}
                          >
                            <Camera size={16} className="me-2" />
                            {capturedPhoto
                              ? "Αλλαγη Φωτογραφιας"
                              : useFileInput
                              ? "Επιλογη Αρχειου"
                              : "Ληψη Φωτογραφιας"}
                          </button>
                          {!useFileInput && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={openFileInput}
                            >
                              Επιλογη απο Αρχειο
                            </button>
                          )}
                        </div>
                      </div>
                      {cameraError && (
                        <div className="alert alert-warning mb-0" role="alert">
                          <small style={{ whiteSpace: "pre-line" }}>
                            {cameraError}
                          </small>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ονοματεπωνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Τηλεφωνο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατασταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as Member["status"],
                        }))
                      }
                      required
                    >
                      <option value="active">Ενεργη</option>
                      <option value="expiring_soon">Ληγει Συντομα</option>
                      <option value="expired">Ληγμενη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ημερομηνια Ληξης</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DD/MM/YYYY"
                      value={formData.expiry}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expiry: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Πακετο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.package}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, package: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Ακυρωση
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Αποθηκευση
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowEditModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Επεξεργασια Μελους</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  {/* Photo Section */}
                  <div className="mb-4">
                    <label className="form-label">Φωτογραφια Προφιλ</label>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-3">
                        {capturedPhoto ? (
                          <div className="position-relative">
                            <img
                              src={capturedPhoto}
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                              style={{
                                width: "24px",
                                height: "24px",
                                padding: 0,
                              }}
                              onClick={removePhoto}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "100px", height: "100px" }}
                          >
                            <User size={40} className="text-muted" />
                          </div>
                        )}
                        <div className="d-flex flex-column gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={useFileInput ? openFileInput : startCamera}
                          >
                            <Camera size={16} className="me-2" />
                            {capturedPhoto
                              ? "Αλλαγη Φωτογραφιας"
                              : useFileInput
                              ? "Επιλογη Αρχειου"
                              : "Ληψη Φωτογραφιας"}
                          </button>
                          {!useFileInput && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={openFileInput}
                            >
                              Επιλογη απο Αρχειο
                            </button>
                          )}
                        </div>
                      </div>
                      {cameraError && (
                        <div className="alert alert-warning mb-0" role="alert">
                          <small style={{ whiteSpace: "pre-line" }}>
                            {cameraError}
                          </small>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ονοματεπωνυμο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Τηλεφωνο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατασταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as Member["status"],
                        }))
                      }
                      required
                    >
                      <option value="active">Ενεργη</option>
                      <option value="expiring_soon">Ληγει Συντομα</option>
                      <option value="expired">Ληγμενη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ημερομηνια Ληξης</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DD/MM/YYYY"
                      value={formData.expiry}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expiry: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Πακετο</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.package}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, package: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Ακυρωση
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Αποθηκευση
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Ληψη Φωτογραφιας</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={stopCamera}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div
                  className="position-relative"
                  style={{
                    width: "100%",
                    maxWidth: "640px",
                    margin: "0 auto",
                    backgroundColor: "#000",
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      display: "block",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      backgroundColor: "#000",
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch((err) => {
                          console.error(
                            "[Camera] Play error in onLoadedMetadata:",
                            err
                          );
                        });
                      }
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  {cameraError && (
                    <div className="position-absolute top-0 start-0 w-100 p-3">
                      <div className="alert alert-danger mb-0">
                        <small>{cameraError}</small>
                      </div>
                    </div>
                  )}
                  {!cameraError &&
                    videoRef.current &&
                    videoRef.current.readyState >= 2 && (
                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                        <StatusBadge tone="success" label="Καμερα ενεργη ✓" />
                      </div>
                    )}
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={stopCamera}
                >
                  Ακυρωση
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={capturePhoto}
                >
                  <Camera size={16} className="me-2" />
                  Ληψη Φωτογραφιας
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo View Modal */}
      {showPhotoModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1070 }}
          onClick={() => setShowPhotoModal(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Φωτογραφια Προφιλ</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPhotoModal(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <img
                  src={showPhotoModal}
                  alt="Profile"
                  className="img-fluid w-100"
                  style={{ maxHeight: "80vh", objectFit: "contain" }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
