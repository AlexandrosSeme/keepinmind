import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  X,
  TrendingUp,
  LogIn,
  QrCode,
  CalendarDays,
  CalendarCheck,
} from "lucide-react";
import Chart from "react-apexcharts";
import { supabase } from "../lib/supabaseClient";
import type { Member, EntranceLog } from "../types";
import { useAppData } from "../contexts/AppDataContext";
import { uploadMemberPhoto } from "../services/photoService";
import { getEntranceLogsByMember } from "../services/entranceLogService";

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
        setError("Δεν βρέθηκε ID μέλους");
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
        setError("Η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη");
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
          setError("Δεν βρέθηκε μέλος με αυτό το ID");
        } else {
          setMember(data as Member);
        }
      } catch {
        setError("Σφάλμα κατά τη φόρτωση των δεδομένων");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, members]);

  // Load entrance logs and calculate statistics
  useEffect(() => {
    const loadEntranceLogs = async () => {
      if (!member) return;

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
      }
    };

    loadEntranceLogs();
  }, [member]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: "bg-success text-white", text: "Ενεργή", icon: CheckCircle },
      expiring_soon: { class: "bg-warning text-dark", text: "Λήγει Σύντομα", icon: Clock },
      expired: { class: "bg-danger text-white", text: "Ληγμένη", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      class: "bg-secondary text-white",
      text: status,
      icon: User,
    };

    const Icon = config.icon;

    return (
      <span className={`badge ${config.class} d-inline-flex align-items-center gap-1`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

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

  const getValidationStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return { class: 'bg-success text-white', text: 'Έγκυρο', icon: CheckCircle };
      case 'invalid':
        return { class: 'bg-danger text-white', text: 'Μη Έγκυρο', icon: XCircle };
      case 'expiring_soon':
        return { class: 'bg-warning text-dark', text: 'Λήγει Σύντομα', icon: Clock };
      default:
        return { class: 'bg-secondary text-white', text: status, icon: User };
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
      window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μέλος;")
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
        "Το browser σας δεν υποστηρίζει πρόσβαση στην κάμερα. Χρησιμοποιήστε file upload."
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
        "Η κάμερα απαιτεί HTTPS connection. Χρησιμοποιήστε file upload."
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
                setCameraError("Σφάλμα κατά την αναπαραγωγή του video.");
              });
            }
          };
        }
      }, 100);
    } catch (error: unknown) {
      console.error("[Camera] Error accessing camera:", error);
      setCameraError("Δεν ήταν δυνατή η πρόσβαση στην κάμερα.");
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
      setCameraError("Σφάλμα: Δεν βρέθηκε video element.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Η κάμερα δεν είναι έτοιμη. Παρακαλώ περιμένετε...");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Σφάλμα κατά την λήψη της φωτογραφίας.");
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
        alert("Παρακαλώ επιλέξτε αρχείο εικόνας.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 10MB.");
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
          <span className="visually-hidden">Φόρτωση...</span>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <XCircle size={48} className="text-danger mb-3" />
          <h5 className="mb-2">Σφάλμα</h5>
          <p className="text-muted mb-4">{error || "Δεν βρέθηκε μέλος"}</p>
          <button className="btn btn-primary" onClick={() => navigate("/members")}>
            <ArrowLeft size={16} className="me-2" />
            Επιστροφή στη Λίστα
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-link text-decoration-none p-0 me-3"
          onClick={() => navigate("/members")}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="h4 mb-0">Στοιχεία Μέλους</h2>
        <div className="ms-auto">
          <button className="btn btn-outline-primary me-2" onClick={handleEdit}>
            <Edit size={16} className="me-2" />
            Επεξεργασία
          </button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <Trash2 size={16} className="me-2" />
            Διαγραφή
          </button>
        </div>
      </div>

      {/* Member Details Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            {/* Photo Section - Left Side */}
            <div className="col-12 col-md-3 col-lg-2 text-center mb-4 mb-md-0">
              {member.photo_url ? (
                <div className="position-relative d-inline-block">
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="rounded-circle shadow-sm"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: "4px solid #e3f2fd",
                    }}
                    onClick={() => setShowPhotoModal(true)}
                  />
                </div>
              ) : (
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                  style={{ 
                    width: "160px", 
                    height: "160px",
                    backgroundColor: "#e3f2fd",
                    border: "4px solid #e3f2fd",
                  }}
                >
                  <User size={70} className="text-primary" style={{ color: "#1976d2" }} />
                </div>
              )}
            </div>

            {/* Details Section - Right Side */}
            <div className="col-12 col-md-9 col-lg-10">
              <div className="row g-4">
                {/* Name - Full Width at Top */}
                <div className="col-12">
                  <h3 className="h3 mb-0 fw-bold" style={{ color: "#212529" }}>
                    {member.name}
                  </h3>
                </div>

                {/* Information Grid */}
                <div className="col-12">
                  <div className="row g-3">
                    {/* Phone */}
                    <div className="col-12 col-sm-6 col-lg-4">
                      <div className="d-flex align-items-start">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                          style={{ 
                            width: "48px", 
                            height: "48px",
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <Phone size={22} className="text-primary" style={{ color: "#1976d2" }} />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Τηλέφωνο
                          </small>
                          <span className="fw-bold d-block" style={{ fontSize: "1rem", color: "#212529" }}>
                            {member.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                      <div className="col-12 col-sm-6 col-lg-4">
                        <div className="d-flex align-items-start">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                            style={{ 
                              width: "48px", 
                              height: "48px",
                              backgroundColor: "#e3f2fd",
                            }}
                          >
                            <Mail size={22} className="text-primary" style={{ color: "#1976d2" }} />
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                              Email
                            </small>
                            <span className="fw-bold d-block" style={{ fontSize: "1rem", color: "#212529" }}>
                                {member.email ?? `-` } 
                            </span>
                          </div>
                        </div>
                      </div>  

                    {/* Package */}
                    <div className="col-12 col-sm-6 col-lg-4">
                      <div className="d-flex align-items-start">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                          style={{ 
                            width: "48px", 
                            height: "48px",
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <Package size={22} className="text-primary" style={{ color: "#1976d2" }} />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Πακέτο
                          </small>
                          <span className="fw-bold d-block" style={{ fontSize: "1rem", color: "#212529" }}>
                            {member.package || "Δεν έχει οριστεί"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-12 col-sm-6 col-lg-4">
                      <div className="d-flex align-items-start">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                          style={{ 
                            width: "48px", 
                            height: "48px",
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <User size={22} className="text-primary" style={{ color: "#1976d2" }} />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Κατάσταση
                          </small>
                          <div className="mt-1">{getStatusBadge(member.status)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Expiration Date */}
                    <div className="col-12 col-sm-6 col-lg-4">
                      <div className="d-flex align-items-start">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                          style={{ 
                            width: "48px", 
                            height: "48px",
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <Calendar size={22} className="text-primary" style={{ color: "#1976d2" }} />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                            Ημερομηνία Λήξης
                          </small>
                          <span className="fw-bold d-block" style={{ fontSize: "1rem", color: "#212529" }}>
                            {member.expiry || "Δεν έχει οριστεί"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Statistics and Chart */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          {/* Monthly Attendance Chart - Full Width */}
          <div className="mb-4">
            <div className="mb-2">
              <h6 className="mb-0 d-flex align-items-center">
                <TrendingUp size={16} className="me-2 text-primary" />
                Προσελεύσεις ανά Μήνα
              </h6>
            </div>
            {(() => {
              // Calculate max value from data, default to 5, but use max if higher
              const maxDataValue = Math.max(...monthlyAttendance.map(item => item.count), 0);
              const yAxisMax = maxDataValue > 5 ? Math.ceil(maxDataValue * 1.1) : 5; // Add 10% padding if dynamic
              
              return (
                <Chart
                  options={{
                    chart: {
                      type: "bar",
                      height: 350,
                      toolbar: {
                        show: false,
                      },
                    },
                    colors: ["#0d6efd"],
                    plotOptions: {
                      bar: {
                        horizontal: false,
                        columnWidth: "30%",
                        borderRadius: 6,
                        borderRadiusApplication: 'end',
                        dataLabels: {
                          position: 'right',
                        },
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        colors: ["#0d6efd"],
                      },
                      offsetY: -20,
                      formatter: function (val: number) {
                        // Show label only for real values (> 0.1), hide for minimal bars (0.05)
                        return val > 0.1 ? Math.round(val).toString() : '';
                      },
                    },
                    stroke: {
                      show: true,
                      width: 2,
                      colors: ["transparent"],
                    },
                    xaxis: {
                      categories: monthlyAttendance.map(item => item.month),
                      labels: {
                        style: {
                          fontSize: '11px',
                          fontWeight: 500,
                        },
                        rotate: -45,
                        rotateAlways: false,
                      },
                      axisBorder: {
                        show: true,
                        color: '#e0e0e0',
                      },
                      axisTicks: {
                        show: true,
                        color: '#e0e0e0',
                      },
                    },
                    yaxis: {
                      title: {
                        text: "Αριθμός Προσελεύσεων",
                        style: {
                          fontSize: '12px',
                          fontWeight: 600,
                        },
                      },
                      labels: {
                        style: {
                          fontSize: '11px',
                        },
                        formatter: function (val: number) {
                          return Math.round(val).toString(); // Always show integers
                        },
                      },
                      min: 0,
                      max: yAxisMax,
                      forceNiceScale: true,
                      decimalsInFloat: 0,
                    },
                    fill: {
                      opacity: 1,
                    },
                    grid: {
                      borderColor: '#e0e0e0',
                      strokeDashArray: 3,
                      xaxis: {
                        lines: {
                          show: false,
                        },
                      },
                      yaxis: {
                        lines: {
                          show: true,
                        },
                      },
                    },
                    tooltip: {
                      theme: 'light',
                      y: {
                        formatter: function (val: number) {
                          // Convert 0.05 back to 0 for display
                          const actualVal = val < 0.1 ? 0 : Math.round(val);
                          return actualVal + (actualVal === 1 ? " προσελεύση" : " προσελεύσεις");
                        },
                      },
                    },
                  }}
                    series={[
                      {
                        name: "Προσελεύσεις",
                        data: monthlyAttendance.map(item => {
                          // Use 0.05 for visual bar (very small), but display as 0 everywhere
                          return item.count === 0 ? 0.10 : item.count;
                        }),
                      },
                    ]}
                    type="bar"
                    height={200}
                  />
                );
              })()}
          </div>

          {/* Attendance Statistics - 3 Columns Below Chart */}
          <div className="row g-3">
            {/* This Week */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                      <Calendar size={28} className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Αυτή τη Βδομάδα
                      </div>
                      <div className="h4 mb-0 fw-bold text-primary">{attendanceStats.thisWeek}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* This Month */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                      <CalendarDays size={28} className="text-success" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Αυτόν τον Μήνα
                      </div>
                      <div className="h4 mb-0 fw-bold text-success">{attendanceStats.thisMonth}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* This Year */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                      <CalendarCheck size={28} className="text-info" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Αυτό το Έτος
                      </div>
                      <div className="h4 mb-0 fw-bold text-info">{attendanceStats.thisYear}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entrance Logs Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 pb-0">
          <h5 className="mb-0 d-flex align-items-center">
            <LogIn size={20} className="me-2 text-primary" />
            Προσελεύσεις
            {entranceLogs.length > 0 && (
              <span className="badge bg-primary ms-2">{entranceLogs.length}</span>
            )}
          </h5>
        </div>
        <div className="card-body p-0">
          {entranceLogs.length === 0 ? (
            <div className="text-center py-5">
              <LogIn size={48} className="text-muted mb-3" />
              <p className="text-muted mb-0">Δεν υπάρχουν καταγραφές προσελεύσεων</p>
            </div>
          ) : (
            <div 
              className="table-responsive"
              style={{ maxHeight: '250px', overflowY: 'auto' }}
            >
              <table className="table table-hover mb-0">
                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th className="border-0 ps-4 bg-light">Ημερομηνία & Ώρα</th>
                    <th className="border-0 bg-light">Τρόπος Εισόδου</th>
                    <th className="border-0 bg-light">Κατάσταση</th>
                    <th className="border-0 pe-4 bg-light">Μήνυμα</th>
                  </tr>
                </thead>
                <tbody>
                  {entranceLogs.map((log) => {
                    const validationBadge = getValidationStatusBadge(log.validationStatus);
                    const ValidationIcon = validationBadge.icon;
                    return (
                      <tr key={log.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <Calendar size={16} className="text-muted me-2" />
                            <span className="fw-semibold">{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </td>
                        <td>
                          {log.entranceType === 'qr_scan' ? (
                            <span className="badge bg-info d-inline-flex align-items-center gap-1">
                              <QrCode size={14} />
                              QR Scan
                            </span>
                          ) : (
                            <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                              <LogIn size={14} />
                              Manual
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${validationBadge.class} d-inline-flex align-items-center gap-1`}>
                            <ValidationIcon size={14} />
                            {validationBadge.text}
                          </span>
                        </td>
                        <td className="pe-4">
                          <small className="text-muted">{log.validationMessage}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pb-0">
          <h5 className="mb-0">Πρόσθετες Πληροφορίες</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <small className="text-muted d-block mb-1">ID Μέλους</small>
              <span className="fw-semibold">#{member.id}</span>
            </div>
            <div className="col-12 col-md-6">
              <small className="text-muted d-block mb-1">Κατάσταση Συνδρομής</small>
              <div>{getStatusBadge(member.status)}</div>
            </div>
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
                <h5 className="modal-title">Επεξεργασία Μέλους</h5>
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
                    <label className="form-label">Φωτογραφία Προφίλ</label>
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
                            className="btn btn-outline-primary"
                            onClick={useFileInput ? () => fileInputRef.current?.click() : startCamera}
                          >
                            <Camera size={16} className="me-2" />
                            {capturedPhoto
                              ? "Αλλαγή Φωτογραφίας"
                              : useFileInput
                              ? "Επιλογή Αρχείου"
                              : "Λήψη Φωτογραφίας"}
                          </button>
                          {!useFileInput && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Επιλογή από Αρχείο
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
                    <label className="form-label">Ονοματεπώνυμο</label>
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
                    <label className="form-label">Τηλέφωνο</label>
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
                    <label className="form-label">Κατάσταση</label>
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
                      <option value="active">Ενεργή</option>
                      <option value="expiring_soon">Λήγει Σύντομα</option>
                      <option value="expired">Ληγμένη</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ημερομηνία Λήξης</label>
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
                    <label className="form-label">Πακέτο</label>
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
                    Ακύρωση
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Αποθήκευση
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
                <h5 className="modal-title text-white">Λήψη Φωτογραφίας</h5>
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
                  Ακύρωση
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={capturePhoto}
                >
                  <Camera size={16} className="me-2" />
                  Λήψη Φωτογραφίας
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
                <h5 className="modal-title text-white">Φωτογραφία Προφίλ</h5>
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

