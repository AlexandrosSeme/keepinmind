// import React, { useEffect, useState, useCallback } from "react";
// import { homeAssistantService } from "../services/homeAssistantService";
// import type { HomeAssistantState } from "../services/homeAssistantService";
// import {
//   RefreshCw,
//   Settings,
//   AlertCircle,
//   Lightbulb,
//   CheckCircle,
//   XCircle,
//   Power,
//   PowerOff,
// } from "lucide-react";
// import StatusBadge from "./ui/StatusBadge";

// export const HomeAssistant = () => {
//   const [states, setStates] = useState<HomeAssistantState[]>([]);
//   const [connected, setConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showSettings, setShowSettings] = useState(false);
//   const [config, setConfig] = useState({
//     baseUrl: localStorage.getItem("haBaseUrl") || "http://192.168.1.79:8123",
//     accessToken:
//       localStorage.getItem("haAccessToken") ||
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwNDA3M2IyNGU3YTI0ZGU0ODhhNTdkOTk1Y2YxNzU5ZCIsImlhdCI6MTc0ODEyNDk3MCwiZXhwIjoyMDYzNDg0OTcwfQ.HCDRE23HhxfJfMTugjwl4IzQvzi-7kt_dRIA9g-vNr0",
//   });
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const loadStates = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Ensure service has latest config
//       homeAssistantService.updateConfig(config.baseUrl, config.accessToken);

//       const haConfig = homeAssistantService.getConfig();
//       if (!haConfig || !haConfig.accessToken) {
//         setConnected(false);
//         setError("Παρακαλω ρυθμιστε το Access Token στις ρυθμισεις.");
//         setLoading(false);
//         return;
//       }

//       const testConnected = await homeAssistantService.testConnection();
//       setConnected(testConnected);

//       if (testConnected) {
//         const allStates = await homeAssistantService.getStates();
//         // Filter only L2 device
//         const l2State = allStates.filter(
//           (state) => state.entity_id === "light.sonoff_10013f8587"
//         );

//         setStates(l2State);
//         setError(null); // Clear any previous errors
//       } else {
//         setError(
//           "Δεν ηταν δυνατη η συνδεση με το Home Assistant. Ελεγξτε:\n1. Αν το backend server (localhost:3010) τρεχει\n2. Αν το Home Assistant ειναι ενεργο\n3. Αν το URL και το Access Token ειναι σωστα"
//         );
//       }
//     } catch (err: any) {
//       let errorMsg = err.message || "Σφαλμα κατα τη φορτωση των συσκευων.";

//       // Check for CORS errors
//       if (
//         err.message?.includes("Failed to fetch") ||
//         err.message?.includes("CORS")
//       ) {
//         errorMsg =
//           "Σφαλμα CORS: Το Home Assistant πρεπει να επιτρεπει requests απο αυτον τον server. Ελεγξτε τις ρυθμισεις CORS στο Home Assistant.";
//       } else if (err.message?.includes("401")) {
//         errorMsg = "Μη εγκυρο Access Token. Παρακαλω ελεγξτε το token.";
//       } else if (err.message?.includes("404")) {
//         errorMsg = "Το Home Assistant δεν βρεθηκε. Ελεγξτε τη διευθυνση URL.";
//       }

//       setError(errorMsg);
//       setConnected(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [config.baseUrl, config.accessToken]);

//   useEffect(() => {
//     // Initialize service with current config
//     homeAssistantService.updateConfig(config.baseUrl, config.accessToken);
//     loadStates();

//     if (autoRefresh) {
//       homeAssistantService.startAutoRefresh(5000);
//     }

//     return () => {
//       homeAssistantService.stopAutoRefresh();
//     };
//   }, [autoRefresh, config.baseUrl, config.accessToken, loadStates]);

//   const handleTurnOn = async (entityId: string) => {
//     try {
//       await homeAssistantService.turnOn(entityId);
//       // Refresh immediately and then again after a delay
//       loadStates();
//       setTimeout(() => {
//         loadStates();
//       }, 700);
//     } catch (err: any) {
//       setError(err.message || "Σφαλμα κατα την ενεργοποιηση.");
//     }
//   };

//   const handleTurnOff = async (entityId: string) => {
//     try {
//       await homeAssistantService.turnOff(entityId);
//       // Refresh immediately and then again after a delay
//       loadStates();
//       setTimeout(() => {
//         loadStates();
//       }, 700);
//     } catch (err: any) {
//       setError(err.message || "Σφαλμα κατα την απενεργοποιηση.");
//     }
//   };

//   const handleSetWhite = async (entityId: string) => {
//     try {
//       await homeAssistantService.setColor(entityId, [255, 255, 255]); // RGB for white
//       loadStates();
//     } catch (err: any) {
//       setError(err.message || "Σφαλμα κατα την αλλαγη χρωματος σε white.");
//     }
//   };

//   const handleSetGreen = async (entityId: string) => {
//     try {
//       await homeAssistantService.setColor(entityId, [0, 255, 0]); // RGB for green
//       setTimeout(() => {
//         handleSetWhite(entityId);
//       }, 1000);
//     } catch (err: any) {
//       setError(err.message || "Σφαλμα κατα την αλλαγη χρωματος σε green.");
//     }
//   };

//   const handleSetRed = async (entityId: string) => {
//     try {
//       await homeAssistantService.setColor(entityId, [255, 0, 0]); // RGB for red
//       setTimeout(() => {
//         handleSetWhite(entityId);
//       }, 1000);
//     } catch (err: any) {
//       setError(err.message || "Σφαλμα κατα την αλλαγη χρωματος σε red.");
//     }
//   };

//   const handleSaveSettings = () => {
//     homeAssistantService.updateConfig(config.baseUrl, config.accessToken);
//     localStorage.setItem("haBaseUrl", config.baseUrl);
//     localStorage.setItem("haAccessToken", config.accessToken);
//     setShowSettings(false);
//     // Reload states after a short delay to ensure config is saved
//     setTimeout(() => {
//       loadStates();
//     }, 100);
//   };

//   const getStateBadge = (state: string) => {
//     const upperState = state.toUpperCase();
//     if (upperState === "ON") {
//       return <StatusBadge status="on" />;
//     } else if (upperState === "OFF") {
//       return <StatusBadge status="off" />;
//     } else if (upperState === "UNAVAILABLE" || upperState === "UNKNOWN") {
//       return <StatusBadge status="na" />;
//     }
//     return <StatusBadge tone="info" label={state} />;
//   };

//   const formatTimestamp = (timestamp: string) => {
//     try {
//       const date = new Date(timestamp);
//       return date.toLocaleString("el-GR", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//       });
//     } catch {
//       return timestamp;
//     }
//   };

//   const getEntityName = (state: HomeAssistantState): string => {
//     return (
//       state.attributes.friendly_name ||
//       state.entity_id
//         .split(".")[1]
//         .replace(/_/g, " ")
//         .replace(/\b\w/g, (l) => l.toUpperCase())
//     );
//   };


//   return (
//     <div>
//       {/* Header */}
//       <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
//         <div>
//           <h2 className="h4 mb-2">L2 Control</h2>
//           <p className="text-muted mb-0">
//             Ελεγχος L2 (light.sonoff_10013f8587)
//           </p>
//         </div>
//         <div className="d-flex gap-2 mt-3 mt-md-0">
//           <button
//             className="btn btn-outline-secondary"
//             onClick={loadStates}
//             disabled={loading}
//           >
//             <RefreshCw
//               size={16}
//               className={loading ? "spinning" : ""}
//               style={{ marginRight: "8px" }}
//             />
//             Ανανεωση
//           </button>
//           <button
//             className="btn btn-outline-secondary"
//             onClick={() => setShowSettings(!showSettings)}
//           >
//             <Settings size={16} style={{ marginRight: "8px" }} />
//             Ρυθμισεις
//           </button>
//         </div>
//       </div>

//       {/* Connection Status */}
//       <div className="row mb-4">
//         <div className="col-12">
//           <div className="card border-0 shadow-sm">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between">
//                 <div className="d-flex align-items-center gap-3">
//                   {connected ? (
//                     <CheckCircle size={24} className="text-success" />
//                   ) : (
//                     <XCircle size={24} className="text-danger" />
//                   )}
//                   <div>
//                     <h5 className="mb-1">
//                       Συνδεση: {connected ? "Συνδεδεμενο" : "Ασυνδετο"}
//                     </h5>
//                     {config.baseUrl && (
//                       <small className="text-muted">{config.baseUrl}</small>
//                     )}
//                   </div>
//                 </div>
//                 <div className="form-check form-switch">
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id="autoRefresh"
//                     checked={autoRefresh}
//                     onChange={(e) => setAutoRefresh(e.target.checked)}
//                   />
//                   <label className="form-check-label" htmlFor="autoRefresh">
//                     Αυτοματη ανανεωση
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="row mb-4">
//           <div className="col-12">
//             <div
//               className="alert alert-danger d-flex align-items-start"
//               role="alert"
//             >
//               <AlertCircle size={20} className="me-2 mt-1" />
//               <div className="flex-grow-1">
//                 <strong>Σφαλμα:</strong>
//                 <div style={{ whiteSpace: "pre-line", marginTop: "8px" }}>
//                   {error}
//                 </div>
//                 {error.includes("backend server") && (
//                   <div className="mt-3 p-2 bg-light rounded">
//                     <small>
//                       <strong>Για να εκκινησετε το backend server:</strong>
//                       <br />
//                       <code>node server.js</code>
//                       <br />
//                       η<br />
//                       <code>npm run dev</code> (αν εχετε script)
//                     </small>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settings Modal */}
//       {showSettings && (
//         <div className="modal-overlay" onClick={() => setShowSettings(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Ρυθμισεις Home Assistant</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowSettings(false)}
//               >
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="alert alert-info mb-3">
//                 <small>
//                   <strong>Πως να βρειτε το Access Token:</strong>
//                   <br />
//                   1. Ανοιξτε το Home Assistant
//                   <br />
//                   2. Πηγαινετε στο Profil → Long-Lived Access Tokens
//                   <br />
//                   3. Δημιουργηστε ενα νεο token και αντιγραψτε το
//                 </small>
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Base URL</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={config.baseUrl}
//                   onChange={(e) =>
//                     setConfig({ ...config, baseUrl: e.target.value })
//                   }
//                   placeholder="http://192.168.1.79:8123"
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Access Token</label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   value={config.accessToken}
//                   onChange={(e) =>
//                     setConfig({ ...config, accessToken: e.target.value })
//                   }
//                   placeholder="Long-Lived Access Token"
//                 />
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowSettings(false)}
//               >
//                 Ακυρωση
//               </button>
//               <button className="btn btn-primary" onClick={handleSaveSettings}>
//                 Αποθηκευση
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* L2 Device Card */}
//       {states.length > 0 ? (
//         <div className="row">
//           <div className="col-12 col-md-6 col-lg-4">
//             {states.map((state) => (
//               <div key={state.entity_id} className="card border-0 shadow-sm">
//                 <div className="card-body">
//                   <div className="d-flex align-items-start justify-content-between mb-3">
//                     <div className="d-flex align-items-center gap-2">
//                       {state.state.toLowerCase() === "on" ? (
//                         <Lightbulb className="text-warning" size={24} />
//                       ) : (
//                         <Lightbulb size={24} />
//                       )}
//                       <div>
//                         <h5 className="card-title mb-1">
//                           {getEntityName(state)}
//                         </h5>
//                         <small className="text-muted d-block">
//                           {state.entity_id}
//                         </small>
//                       </div>
//                     </div>
//                     {getStateBadge(state.state)}
//                   </div>

//                   {/* State Info */}
//                   <div className="mb-3">
//                     <small className="text-muted d-block mb-1">
//                       Κατασταση:
//                     </small>
//                     <div className="bg-light p-2 rounded">
//                       <strong>{state.state}</strong>
//                     </div>
//                   </div>

//                   {/* Last Updated */}
//                   <div className="mb-3">
//                     <small className="text-muted">
//                       Τελευταια ενημερωση: {formatTimestamp(state.last_updated)}
//                     </small>
//                   </div>

//                   {/* Controls */}
//                   <div className="d-grid gap-2">
//                     <div className="btn-group" role="group">
//                       <button
//                         className="btn btn-sm btn-success"
//                         onClick={() => handleTurnOn(state.entity_id)}
//                         disabled={!connected || state.state.toLowerCase() === "on"}
//                       >
//                         <Power size={14} style={{ marginRight: "4px" }} />
//                         ON
//                       </button>
//                       <button
//                         className="btn btn-sm btn-secondary"
//                         onClick={() => handleTurnOff(state.entity_id)}
//                         disabled={!connected || state.state.toLowerCase() === "off"}
//                       >
//                         <PowerOff size={14} style={{ marginRight: "4px" }} />
//                         OFF
//                       </button>
//                     </div>
//                     <button
//                       className="btn btn-sm btn-success"
//                       onClick={() => handleSetGreen(state.entity_id)}
//                       disabled={!connected}
//                     >
//                       Green
//                     </button>
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleSetRed(state.entity_id)}
//                       disabled={!connected}
//                     >
//                       Red
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="row">
//           <div className="col-12">
//             <div className="card border-0 shadow-sm">
//               <div className="card-body text-center py-5">
//                 {loading ? (
//                   <>
//                     <div
//                       className="spinner-border text-primary mb-3"
//                       role="status"
//                     >
//                       <span className="visually-hidden">Φορτωση...</span>
//                     </div>
//                     <p className="text-muted">
//                       Φορτωση L2 απο Home Assistant...
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <AlertCircle size={48} className="text-muted mb-3" />
//                     <h5>Το L2 δεν βρεθηκε</h5>
//                     <p className="text-muted">
//                       {connected
//                         ? "Το L2 (light.sonoff_10013f8587) δεν βρεθηκε στο Home Assistant."
//                         : "Συνδεθειτε πρωτα στο Home Assistant για να δειτε το L2."}
//                     </p>
//                     {!config.accessToken && (
//                       <p className="text-muted small">
//                         Παρακαλω εισαγετε το Access Token στις ρυθμισεις.
//                       </p>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         .spinning {
//           animation: spin 1s linear infinite;
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.5);
//           backdrop-filter: blur(4px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//           padding: 20px;
//         }
//         .modal-content {
//           background: white;
//           border-radius: 12px;
//           width: 100%;
//           max-width: 500px;
//           max-height: 90vh;
//           overflow: hidden;
//           display: flex;
//           flex-direction: column;
//           box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
//         }
//         .modal-header {
//           padding: 20px;
//           border-bottom: 1px solid #e5e7eb;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }
//         .modal-header h3 {
//           margin: 0;
//           font-size: 20px;
//           font-weight: 600;
//         }
//         .modal-close {
//           width: 32px;
//           height: 32px;
//           border: none;
//           background: transparent;
//           font-size: 24px;
//           cursor: pointer;
//           color: #6b7280;
//         }
//         .modal-close:hover {
//           color: #1a1a1a;
//         }
//         .modal-body {
//           padding: 20px;
//           overflow-y: auto;
//         }
//         .modal-footer {
//           padding: 20px;
//           border-top: 1px solid #e5e7eb;
//           display: flex;
//           justify-content: flex-end;
//           gap: 10px;
//         }
//       `}</style>
//     </div>
//   );
// };


