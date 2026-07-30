import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  XCircle,
  Camera,
  X,
  LogIn,
  QrCode,
  RefreshCw,
} from "lucide-react";
import Chart from "react-apexcharts";
import { supabase } from "../lib/supabaseClient";
import type { Member, EntranceLog } from "../types";
import { useAppData } from "../contexts/AppDataContext";
import { uploadMemberPhoto } from "../services/photoService";
import { getEntranceLogsByMember } from "../services/entranceLogService";
import StatusBadge from "./ui/StatusBadge";
import "./SingleMember.scss";

const BRAND = {
  yellow: "#f5c400",
  yellowStrong: "#d4a800",
  ink: "#111111",
  muted: "#8a8680",
  canvas: "#e8e5df",
};

function stripAccents(text: string): string {
  const map: Record<string, string> = {
    ά: "α",
    έ: "ε",
    ή: "η",
    ί: "ι",
    ό: "ο",
    ύ: "υ",
    ώ: "ω",
    Ά: "Α",
    Έ: "Ε",
    Ή: "Η",
    Ί: "Ι",
    Ό: "Ο",
    Ύ: "Υ",
    Ώ: "Ω",
    ϊ: "ι",
    ϋ: "υ",
    ΐ: "ι",
    ΰ: "υ",
  };
  return [...text].map((c) => map[c] || c).join("");
}

const SingleMember: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, editMember, removeMember } = useAppData();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [entranceLogs, setEntranceLogs] = useState<EntranceLog[]>([]);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [monthlyAttendance, setMonthlyAttendance] = useState<{ month: string; count: number }[]>([]);
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFileInput, setUseFileInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setError("Δεν βρεθηκε ID μελους");
        setLoading(false);
        return;
      }

      // First try to get from context
      const memberFromContext = members.find((m) => m.id === parseInt(id));
      if (memberFromContext) {
        setMember(memberFromContext);
        setLoading(false);
        return;
      }

      // If not in context, fetch from Supabase
      if (!supabase) {
        setError("Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("members")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError || !data) {
          setError("Δεν βρεθηκε μελος με αυτο το ID");
        } else {
          setMember(data as Member);
        }
      } catch {
        setError("Σφαλμα κατα τη φορτωση των δεδομενων");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, members]);

  // Load entrance logs and calculate statistics
  const loadEntranceLogs = React.useCallback(async (showLoading = false) => {
    if (!member) return;

    if (showLoading) {
      setRefreshingLogs(true);
    }

    try {
      const logs = await getEntranceLogsByMember(member.id);
      setEntranceLogs(logs);

      // Calculate statistics
      const now = new Date();
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based week
      startOfWeek.setDate(now.getDate() - daysToMonday); // Start of current week (Monday)
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfYear = new Date(now.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);

      // Count ALL logs (all entrances, not just valid ones)
      const thisWeekCount = logs.filter(log => {
        if (!log.timestamp) return false;
        try {
          const logDate = new Date(log.timestamp);
          if (isNaN(logDate.getTime())) return false;
          return logDate >= startOfWeek;
        } catch {
          return false;
        }
      }).length;

      const thisMonthCount = logs.filter(log => {
        if (!log.timestamp) return false;
        try {
          const logDate = new Date(log.timestamp);
          if (isNaN(logDate.getTime())) return false;
          return logDate >= startOfMonth;
        } catch {
          return false;
        }
      }).length;

      const thisYearCount = logs.filter(log => {
        if (!log.timestamp) return false;
        try {
          const logDate = new Date(log.timestamp);
          if (isNaN(logDate.getTime())) return false;
          return logDate >= startOfYear;
        } catch {
          return false;
        }
      }).length;

      console.log("[SingleMember] Calculated stats:", {
        totalLogs: logs.length,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        thisYear: thisYearCount,
        startOfWeek: startOfWeek.toISOString(),
        startOfMonth: startOfMonth.toISOString(),
        startOfYear: startOfYear.toISOString(),
      });

      setAttendanceStats({
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        thisYear: thisYearCount,
      });

      // Calculate monthly attendance - show all 12 months of current year
      const monthNames = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
      const currentYear = now.getFullYear();

      // Initialize all 12 months of current year with 0 - ensure we always have 12 months
      const monthlyArray: { month: string; count: number }[] = [];
      for (let i = 0; i < 12; i++) {
        monthlyArray.push({
          month: `${monthNames[i]} ${currentYear}`,
          count: 0,
        });
      }

      // Count actual attendances
      logs.forEach(log => {
        if (!log.timestamp) return;
        try {
          const logDate = new Date(log.timestamp);
          if (isNaN(logDate.getTime())) return;
          const logYear = logDate.getFullYear();
          const logMonth = logDate.getMonth(); // 0-based index

          // Only count if it's from current year
          if (logYear === currentYear && logMonth >= 0 && logMonth < 12) {
            monthlyArray[logMonth].count++;
          }
        } catch {
          return;
        }
      });

      setMonthlyAttendance(monthlyArray);
    } catch (error) {
      console.error("[SingleMember] Error loading entrance logs:", error);
    } finally {
      if (showLoading) {
        setRefreshingLogs(false);
      }
    }
  }, [member]);

  useEffect(() => {
    loadEntranceLogs(false);
  }, [member, loadEntranceLogs]);

  // Auto-refresh entrance logs every 5 seconds
  useEffect(() => {
    if (!member) return;

    const interval = setInterval(() => {
      loadEntranceLogs(false);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [member, loadEntranceLogs]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return timestamp;
    }
  };

  const handleEdit = () => {
    if (member) {
      setFormData({
        name: member.name,
        phone: member.phone,
        status: member.status,
        expiry: member.expiry,
        package: member.package,
        email: member.email,
        photo_url: member.photo_url,
      });
      setCapturedPhoto(member.photo_url || null);
      setPhotoFile(null);
      setShowEditModal(true);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    if (
      window.confirm("Ειστε σιγουροι οτι θελετε να διαγραψετε αυτο το μελος;")
    ) {
      const success = await removeMember(member.id);
      if (success) {
        navigate("/members");
      }
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    let photoUrl = formData.photo_url;
    if (photoFile) {
      const uploadedUrl = await uploadMemberPhoto(member.id, photoFile);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      }
    }

    const updated = await editMember(member.id, {
      ...formData,
      photo_url: photoUrl,
    });
    if (updated) {
      setMember(updated);
      setShowEditModal(false);
      setCapturedPhoto(null);
      setPhotoFile(null);
    }
  };

  // Camera functions (same as in Members component)
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Το browser σας δεν υποστηριζει προσβαση στην καμερα. Χρησιμοποιηστε file upload."
      );
      setUseFileInput(true);
      return;
    }

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
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      setCameraStream(stream);
      setShowCamera(true);
      setUseFileInput(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.error("[Camera] Error playing video:", err);
                setCameraError("Σφαλμα κατα την αναπαραγωγη του video.");
              });
            }
          };
        }
      }, 100);
    } catch (error: unknown) {
      console.error("[Camera] Error accessing camera:", error);
      setCameraError("Δεν ηταν δυνατη η προσβαση στην καμερα.");
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
      setCameraError("Σφαλμα: Δεν βρεθηκε video element.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Η καμερα δεν ειναι ετοιμη. Παρακαλω περιμενετε...");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Σφαλμα κατα την ληψη της φωτογραφιας.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setPhotoFile(file);
          setCapturedPhoto(canvas.toDataURL("image/jpeg"));
          stopCamera();
          setCameraError(null);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Παρακαλω επιλεξτε αρχειο εικονας.");
        return;
      }
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Φορτωση...</span>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <XCircle size={48} className="text-danger mb-3" />
          <h5 className="mb-2">Σφαλμα</h5>
          <p className="text-muted mb-4">{error || "Δεν βρεθηκε μελος"}</p>
          <button className="btn btn-primary" onClick={() => navigate("/members")}>
            <ArrowLeft size={16} className="me-2" />
            Επιστροφη στη Λιστα
          </button>
        </div>
      </div>
    );
  }

  const maxAttendance = Math.max(
    ...monthlyAttendance.map((item) => item.count),
    0
  );
  const yAxisMax = maxAttendance > 5 ? Math.ceil(maxAttendance * 1.15) : 5;
  const chartCategories = monthlyAttendance.map((item) =>
    item.month.split(" ")[0]
  );
  const chartData = monthlyAttendance.map((item) =>
    item.count === 0 ? 0.08 : item.count
  );

  return (
    <div className="km-member">
      <div className="km-page-header">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/members")}
            aria-label="Πισω"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h2 className="km-page-title">Στοιχεια Μελους</h2>
            <p className="km-page-subtitle mb-0 text-truncate">
              #{member.id} · {stripAccents(member.name)}
            </p>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleEdit}
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
        </div>
      </div>

      {/* Profile */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="km-member__profile">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={stripAccents(member.name)}
                className="km-member__photo"
                onClick={() => setShowPhotoModal(true)}
              />
            ) : (
              <div className="km-member__photo-fallback">
                <User size={36} />
              </div>
            )}

            <div className="flex-grow-1 min-w-0">
              <h3 className="km-member__name">
                {stripAccents(member.name)}
              </h3>
              <div className="mb-2">
                <StatusBadge status={member.status} />
                {member.card_lost && (
                  <span className="ms-2">
                    <StatusBadge status="card_lost" />
                  </span>
                )}
              </div>
              <div className="km-member__meta">
                <div>
                  <div className="km-member__field-label">Τηλεφωνο</div>
                  <div className="km-member__field-value">{member.phone}</div>
                </div>
                <div>
                  <div className="km-member__field-label">Email</div>
                  <div className="km-member__field-value">
                    {member.email ? stripAccents(member.email) : "—"}
                  </div>
                </div>
                <div>
                  <div className="km-member__field-label">Πακετο</div>
                  <div className="km-member__field-value">
                    {member.package
                      ? stripAccents(member.package)
                      : "Δεν εχει οριστει"}
                  </div>
                </div>
                <div>
                  <div className="km-member__field-label">Ληξη</div>
                  <div className="km-member__field-value">
                    {member.expiry || "—"}
                  </div>
                </div>
                <div>
                  <div className="km-member__field-label">Ετος προσελευσεων</div>
                  <div className="km-member__field-value">
                    {attendanceStats.thisYear}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="km-member__grid">
        {/* Entrance logs */}
        <div className="card border-0 shadow-sm km-member__panel km-table-card">
          <div className="card-header border-0 py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="card-title mb-0 d-flex align-items-center gap-2">
              Προσελευσεις
              {entranceLogs.length > 0 && (
                <span className="km-badge km-badge--brand">
                  <span className="km-badge__label">{entranceLogs.length}</span>
                </span>
              )}
            </h6>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => loadEntranceLogs(true)}
              disabled={refreshingLogs}
            >
              <RefreshCw
                size={14}
                style={
                  refreshingLogs
                    ? {
                        animation: "spin 1s linear infinite",
                        transformOrigin: "center",
                      }
                    : undefined
                }
              />
              {refreshingLogs ? "..." : "Ανανεωση"}
            </button>
          </div>
          <div className="card-body p-0 km-member__logs">
            {entranceLogs.length === 0 ? (
              <div className="text-center text-muted py-5 px-3">
                <LogIn size={28} className="mb-2 opacity-50" />
                <div>Δεν υπαρχουν καταγραφες</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 km-table">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 ps-3">Ημ/νια</th>
                      <th className="border-0">Τροπος</th>
                      <th className="border-0">Κατασταση</th>
                      <th className="border-0 pe-3">Μηνυμα</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entranceLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="ps-3">
                          <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </td>
                        <td>
                          {log.entranceType === "qr_scan" ? (
                            <StatusBadge
                              status="qr_scan"
                              icon={<QrCode size={12} />}
                              showDot={false}
                            />
                          ) : (
                            <StatusBadge
                              status="manual"
                              icon={<LogIn size={12} />}
                              showDot={false}
                            />
                          )}
                        </td>
                        <td>
                          <StatusBadge status={log.validationStatus} />
                        </td>
                        <td className="pe-3">
                          <small className="text-muted">
                            {stripAccents(log.validationMessage || "—")}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Chart + mini stats */}
        <div className="card border-0 shadow-sm km-member__panel">
          <div className="card-header border-0 py-2 px-3">
            <h6 className="card-title mb-0">Προσελευσεις ανα μηνα</h6>
          </div>
          <div className="card-body p-3 pt-2">
            <div className="km-member__stats">
              <div className="km-member__stat">
                <div className="km-stat-label mb-1">Εβδομαδα</div>
                <div className="km-member__stat-value">
                  {attendanceStats.thisWeek}
                </div>
              </div>
              <div className="km-member__stat">
                <div className="km-stat-label mb-1">Μηνας</div>
                <div className="km-member__stat-value">
                  {attendanceStats.thisMonth}
                </div>
              </div>
              <div className="km-member__stat">
                <div className="km-stat-label mb-1">Ετος</div>
                <div className="km-member__stat-value">
                  {attendanceStats.thisYear}
                </div>
              </div>
            </div>

            <Chart
              options={{
                chart: {
                  type: "bar",
                  toolbar: { show: false },
                  fontFamily: "Barlow Condensed, Barlow, sans-serif",
                  parentHeightOffset: 0,
                },
                colors: [BRAND.yellow],
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: "42%",
                    borderRadius: 3,
                    borderRadiusApplication: "end",
                  },
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: "10px",
                    fontWeight: 700,
                    colors: [BRAND.ink],
                  },
                  offsetY: -14,
                  formatter: (val: number) =>
                    val > 0.1 ? String(Math.round(val)) : "",
                },
                stroke: { show: false },
                xaxis: {
                  categories: chartCategories,
                  labels: {
                    style: {
                      colors: BRAND.muted,
                      fontSize: "10px",
                      fontWeight: 700,
                    },
                    rotate: 0,
                  },
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                },
                yaxis: {
                  min: 0,
                  max: yAxisMax,
                  tickAmount: 4,
                  labels: {
                    style: {
                      colors: BRAND.muted,
                      fontSize: "10px",
                      fontWeight: 700,
                    },
                    formatter: (val: number) => String(Math.round(val)),
                  },
                },
                fill: { opacity: 1 },
                grid: {
                  borderColor: BRAND.canvas,
                  strokeDashArray: 0,
                  padding: { left: 4, right: 4 },
                },
                tooltip: {
                  theme: "light",
                  y: {
                    formatter: (val: number) => {
                      const actual = val < 0.1 ? 0 : Math.round(val);
                      return `${actual} προσελευσεις`;
                    },
                  },
                },
              }}
              series={[{ name: "Προσελευσεις", data: chartData }]}
              type="bar"
              height={210}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
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
                              onClick={() => {
                                setCapturedPhoto(null);
                                setPhotoFile(null);
                                setFormData({ ...formData, photo_url: undefined });
                              }}
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
                            onClick={useFileInput ? () => fileInputRef.current?.click() : startCamera}
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
                              onClick={() => fileInputRef.current?.click()}
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
                        setFormData({ ...formData, name: e.target.value })
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
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Κατασταση</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Member["status"],
                        })
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
                        setFormData({ ...formData, expiry: e.target.value })
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
                        setFormData({ ...formData, package: e.target.value })
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
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  {cameraError && (
                    <div className="position-absolute top-0 start-0 w-100 p-3">
                      <div className="alert alert-danger mb-0">
                        <small>{cameraError}</small>
                      </div>
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
      {showPhotoModal && member.photo_url && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1070 }}
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Φωτογραφια Προφιλ</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPhotoModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <img
                  src={member.photo_url}
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

export default SingleMember;

