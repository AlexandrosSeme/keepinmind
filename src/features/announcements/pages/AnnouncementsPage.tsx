import React, { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { PageHeader } from "@/shared/ui";
import { isValidEmail, isValidPhone } from "@/shared/lib/validation";
import { useMembers } from "@/features/members";
import { initNotificationServices, smsService } from "@/features/notifications";
import type {
  MessageChannel,
  RecipientGroup,
  SendResult,
  SentAnnouncement,
} from "../types";
import { buildRecipientOptions, filterMembersByGroup } from "../lib/recipients";
import { CHRISTMAS_TEMPLATE } from "../lib/emailTemplate";
import {
  describeSendError,
  sendAnnouncement,
  validateRecipients,
} from "../sendAnnouncement";
import ChannelSelector from "../components/ChannelSelector";
import ManualRecipientsInput from "../components/ManualRecipientsInput";
import SendResultAlert from "../components/SendResultAlert";
import RecentAnnouncements from "../components/RecentAnnouncements";

const INITIAL_HISTORY: SentAnnouncement[] = [
  {
    id: 1,
    title: "Χριστουγεννιατικες Προσφορες",
    sentTo: "142 μελη",
    channel: "SMS",
    date: "10/12/2024 10:00",
    status: "sent",
    successful: 138,
  },
];

const AnnouncementsPage: React.FC = () => {
  const { members } = useMembers();
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<RecipientGroup>("all");
  const [channel, setChannel] = useState<MessageChannel>("email");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [manualPhones, setManualPhones] = useState<string[]>([]);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [history, setHistory] = useState<SentAnnouncement[]>(INITIAL_HISTORY);

  const filteredMembers = filterMembersByGroup(members, recipients);
  const recipientOptions = buildRecipientOptions(members);
  const usesEmail = channel === "email" || channel === "both";
  const usesSmsCount = channel === "sms" || channel === "both";
  const memberEmailCount = filteredMembers.filter((m) => m.email).length;
  const memberPhoneCount = filteredMembers.filter((m) => m.phone).length;

  const estimatedCost = (() => {
    if (!message || channel === "email") return 0;
    const totalRecipients = memberPhoneCount + manualPhones.length;
    if (totalRecipients === 0) return 0;
    return smsService.calculateCost(
      message,
      totalRecipients,
      channel === "viber" ? "viber" : "sms",
    );
  })();

  useEffect(() => {
    initNotificationServices();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      setSendResult({ success: false, message: "Παρακαλω εισαγετε μηνυμα" });
      return;
    }

    const input = {
      message,
      channel,
      members: filteredMembers,
      manualEmails,
      manualPhones,
    };
    const validationError = validateRecipients(input);
    if (validationError) {
      setSendResult({ success: false, message: validationError });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const { result, channels } = await sendAnnouncement(input);
      if (!result) return;

      if (result.failed > 0 && result.errors.length > 0) {
        setSendResult({
          success: false,
          message: `Αποστολη απετυχε: ${result.errors.join("; ")}`,
        });
      } else if (result.success > 0) {
        setHistory((prev) => [
          {
            id: Date.now(),
            title:
              message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            sentTo: `${result.success} παραληπτες`,
            channel: channels.join(" + "),
            date: new Date().toLocaleString("el-GR"),
            status: "sent",
            successful: result.success,
          },
          ...prev,
        ]);
        setMessage("");
        setManualEmails([]);
        setManualPhones([]);
        setSendResult({
          success: true,
          message: `Αποστολη ολοκληρωθηκε! Επιτυχημενα: ${result.success}, Αποτυχημενα: ${result.failed}`,
        });
      } else {
        setSendResult({
          success: false,
          message: `Αποστολη απετυχε: ${result.errors.join("; ") || "Αγνωστο σφαλμα"}`,
        });
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      setSendResult({ success: false, message: describeSendError(error) });
    } finally {
      setSending(false);
    }
  };

  const handleAddEmail = () => {
    const email = newEmailInput.trim();
    if (!email) {
      setSendResult({ success: false, message: "Παρακαλω εισαγετε email" });
      return;
    }
    if (!isValidEmail(email)) {
      setSendResult({ success: false, message: "Μη εγκυρο email address" });
      return;
    }
    if (manualEmails.includes(email)) {
      setSendResult({
        success: false,
        message: "Το email υπαρχει ηδη στη λιστα",
      });
      return;
    }
    setManualEmails([...manualEmails, email]);
    setNewEmailInput("");
    setSendResult(null);
  };

  const handleAddPhone = () => {
    const phone = newPhoneInput.trim();
    if (!phone) {
      setSendResult({
        success: false,
        message: "Παρακαλω εισαγετε αριθμο κινητου",
      });
      return;
    }
    if (!isValidPhone(phone)) {
      setSendResult({
        success: false,
        message:
          "Μη εγκυρος αριθμος κινητου. Χρησιμοποιηστε μορφη 69..., 3069... η +3069...",
      });
      return;
    }
    if (manualPhones.includes(phone)) {
      setSendResult({
        success: false,
        message: "Ο αριθμος υπαρχει ηδη στη λιστα",
      });
      return;
    }
    setManualPhones([...manualPhones, phone]);
    setNewPhoneInput("");
    setSendResult(null);
  };

  return (
    <div>
      <PageHeader
        title="Ανακοινωσεις"
        actions={
          <button className="btn btn-primary">
            <Send size={16} className="me-2" />
            Νεα Ανακοινωση
          </button>
        }
      />

      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-header border-0 py-3">
          <h5 className="card-title mb-0">Δημιουργια Ανακοινωσης</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Αποδεκτες</label>
              <select
                className="form-select"
                value={recipients}
                onChange={(e) =>
                  setRecipients(e.target.value as RecipientGroup)
                }
              >
                {recipientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Καναλι</label>
              <ChannelSelector value={channel} onChange={setChannel} />
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">Μηνυμα</label>
                {channel === "email" && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setMessage(CHRISTMAS_TEMPLATE)}
                  >
                    🎄 Load Χριστουγεννιατικο Template
                  </button>
                )}
              </div>
              <textarea
                className="form-control"
                rows={8}
                placeholder="Γραψτε το μηνυμα σας εδω..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="d-flex justify-content-between mt-2 flex-wrap gap-2">
                <small className="text-muted">
                  Χαρακτηρες: {message.length}
                  {channel !== "email" && "/160"}
                </small>
                <small className="text-muted">
                  {channel === "email" ? (
                    <span className="text-success">Δωρεαν (Maileroo)</span>
                  ) : (
                    <>Εκτιμωμενο κοστος: €{estimatedCost.toFixed(2)}</>
                  )}
                </small>
              </div>
              <div className="d-flex flex-column gap-1 mt-1">
                {filteredMembers.length > 0 && (
                  <small className="text-muted">
                    Αποδεκτες: {filteredMembers.length}{" "}
                    {channel === "email" && `(${memberEmailCount} με email)`}
                  </small>
                )}
                {manualEmails.length > 0 && usesEmail && (
                  <small className="text-info">
                    Manual Emails: {manualEmails.length}
                  </small>
                )}
                {manualPhones.length > 0 && usesSmsCount && (
                  <small className="text-info">
                    Manual Τηλεφωνα (SMS): {manualPhones.length}
                  </small>
                )}
                {usesEmail && (
                  <small className="text-muted fw-semibold">
                    Συνολο Email Recipients:{" "}
                    {memberEmailCount + manualEmails.length}
                  </small>
                )}
                {usesSmsCount && (
                  <small className="text-muted fw-semibold">
                    Συνολο SMS Recipients:{" "}
                    {memberPhoneCount + manualPhones.length}
                  </small>
                )}
              </div>
            </div>

            {usesEmail && (
              <ManualRecipientsInput
                label="Προσθηκη Email Addresses (Manual)"
                type="email"
                placeholder="example@email.com"
                value={newEmailInput}
                onValueChange={setNewEmailInput}
                onAdd={handleAddEmail}
                items={manualEmails}
                onRemove={(email) =>
                  setManualEmails(manualEmails.filter((e) => e !== email))
                }
                chipClassName="bg-primary"
                addedLabel={`Προστεθηκαν ${manualEmails.length} email${manualEmails.length > 1 ? "s" : ""}:`}
                hint="Προσθεστε email addresses για αποστολη εκτος απο τα μελη"
              />
            )}

            {usesSmsCount && (
              <ManualRecipientsInput
                label="Προσθηκη Αριθμων Κινητου (SMS Manual)"
                type="tel"
                placeholder="69..., 3069..., η +3069..."
                value={newPhoneInput}
                onValueChange={setNewPhoneInput}
                onAdd={handleAddPhone}
                items={manualPhones}
                onRemove={(phone) =>
                  setManualPhones(manualPhones.filter((p) => p !== phone))
                }
                chipClassName="bg-success"
                addedLabel={`Προστεθηκαν ${manualPhones.length} αριθμοι:`}
                hint="Προσθεστε αριθμους κινητου που δεν ανηκουν στα μελη (μπορειτε να γραψετε 69..., 3069..., η +3069..., θα γινουν αυτοματα κανονικοποιηση)."
              />
            )}

            {sendResult && <SendResultAlert result={sendResult} />}

            <div className="col-12">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  disabled={sending || !message.trim()}
                >
                  Αποθηκευση Προχειρου
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSend}
                  disabled={sending}
                  title="Καντε κλικ για αποστολη"
                >
                  {sending ? (
                    <>
                      <Loader2
                        size={16}
                        className="spinner-border spinner-border-sm"
                      />
                      Αποστολη...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Αποστολη Τωρα
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentAnnouncements items={history} />
    </div>
  );
};

export default AnnouncementsPage;
