import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [gymInfo, setGymInfo] = useState({
    name: 'Colosseum Gym',
    phone: '210 1234567',
    email: 'info@colosseumgym.gr'
  });

  const [smsProvider, setSmsProvider] = useState({
    provider: 'SMSme.gr',
    username: localStorage.getItem('smsUsername') || '',
    password: localStorage.getItem('smsPassword') || '',
    senderId: localStorage.getItem('smsSenderId') || 'ColosseumGym'
  });

  const [emailProvider, setEmailProvider] = useState({
    provider: 'Maileroo',
    apiKey: localStorage.getItem('emailApiKey') || '2f97c1ef3c4c95f61976e3043bedf139976c6e688428e24576bc87c3ea37d530',
    fromEmail: localStorage.getItem('emailFrom') || 'noreply@807c33da300c12b9.maileroo.org', // Verified Maileroo domain
    fromName: localStorage.getItem('emailFromName') || 'Colosseum Gym'
  });

  const [sendRate, setSendRate] = useState<number>(
    parseInt(localStorage.getItem('sendRate') || '3', 10)
  );

  const [notifications, setNotifications] = useState({
    sevenDays: true,
    threeDays: true,
    expiryDay: true,
    threeDaysAfter: false,
    sendTime: '10:00'
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'el',
    currency: 'EUR'
  });

  const handleSave = () => {
    // Validate email settings
    if (emailProvider.apiKey && (!emailProvider.fromEmail || emailProvider.fromEmail.trim() === '')) {
      alert('Παρακαλώ εισάγετε ένα email address στο πεδίο "Αποστολέας Email". Το email πρέπει να είναι verified στο Maileroo account σας.');
      return;
    }

    // Save SMS provider settings
    if (smsProvider.username && smsProvider.password) {
      localStorage.setItem('smsUsername', smsProvider.username);
      localStorage.setItem('smsPassword', smsProvider.password);
      localStorage.setItem('smsSenderId', smsProvider.senderId);
    } else {
      // Clear SMS settings if credentials are incomplete
      localStorage.removeItem('smsUsername');
      localStorage.removeItem('smsPassword');
      localStorage.removeItem('smsSenderId');
    }

    // Save Email provider settings
    if (emailProvider.apiKey) {
      localStorage.setItem('emailApiKey', emailProvider.apiKey);
      if (emailProvider.fromEmail && emailProvider.fromEmail.trim() !== '') {
        localStorage.setItem('emailFrom', emailProvider.fromEmail.trim());
        console.log('💾 Saved emailFrom to localStorage:', emailProvider.fromEmail.trim());
      } else {
        // Clear it if empty
        localStorage.removeItem('emailFrom');
        console.log('⚠️ emailFrom is empty, removed from localStorage');
      }
      localStorage.setItem('emailFromName', emailProvider.fromName);
    }

    // Save send rate
    localStorage.setItem('sendRate', sendRate.toString());

    // Initialize services
    if (smsProvider.username && smsProvider.password) {
      import('../services/smsService').then(({ smsService }) => {
        smsService.initialize(smsProvider.username, smsProvider.password, smsProvider.senderId);
      });
    }

    if (emailProvider.apiKey && emailProvider.fromEmail && emailProvider.fromEmail.trim() !== '') {
      import('../services/emailService').then(({ emailService }) => {
        emailService.initialize(emailProvider.apiKey, emailProvider.fromEmail.trim(), emailProvider.fromName);
        console.log('✅ Email service initialized with API key and from email:', emailProvider.fromEmail.trim());
      });
    } else if (emailProvider.apiKey) {
      // Initialize even without fromEmail (will use default)
      import('../services/emailService').then(({ emailService }) => {
        emailService.initialize(emailProvider.apiKey);
        console.log('⚠️ Email service initialized with API key but no from email set');
      });
    }

    alert('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="h4">Ρυθμίσεις</h2>
      </div>

      <div className="row g-4">
        {/* Gym Information */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Στοιχεία Γυμναστηρίου</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Όνομα</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={gymInfo.name}
                  onChange={(e) => setGymInfo({...gymInfo, name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Τηλέφωνο</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={gymInfo.phone}
                  onChange={(e) => setGymInfo({...gymInfo, phone: e.target.value})}
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={gymInfo.email}
                  onChange={(e) => setGymInfo({...gymInfo, email: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SMS Provider */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">SMS Provider (SMSme.gr)</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Username (Email)</label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="your-email@example.com"
                  value={smsProvider.username}
                  onChange={(e) => setSmsProvider({...smsProvider, username: e.target.value})}
                />
                <small className="text-muted">
                  Το email που χρησιμοποιείτε για login στο SMSme.gr
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Εισάγετε τον κωδικό πρόσβασης"
                  value={smsProvider.password}
                  onChange={(e) => setSmsProvider({...smsProvider, password: e.target.value})}
                />
                <small className="text-muted">
                  <a href="https://smsme.gr" target="_blank" rel="noopener noreferrer">
                    Δημιουργήστε λογαριασμό στο SMSme.gr
                  </a>
                </small>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Sender ID</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="ColosseumGym"
                  maxLength={11}
                  value={smsProvider.senderId}
                  onChange={(e) => setSmsProvider({...smsProvider, senderId: e.target.value})}
                />
                <small className="text-muted d-block mt-1">
                  Το όνομα που θα εμφανίζεται ως αποστολέας (μέχρι 11 χαρακτήρες, αλφαριθμητικό)
                </small>
                <small className="text-warning d-block mt-1">
                  ⚠️ <strong>Σημαντικό:</strong> Τα alphanumeric sender IDs (όπως "ColosseumGym") πρέπει να είναι <strong>approved</strong> από το SMSme.gr support. 
                  Εάν λαμβάνετε 500 error, πιθανότατα το sender ID δεν είναι approved. 
                  Επικοινωνήστε με το SMSme.gr support για να approve το sender ID σας ή χρησιμοποιήστε numeric sender (π.χ. "1234567890").
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Email Provider */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Email Provider (Maileroo)</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">API Key</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Εισάγετε το API Key από Maileroo"
                  value={emailProvider.apiKey}
                  onChange={(e) => setEmailProvider({...emailProvider, apiKey: e.target.value})}
                />
                <small className="text-muted">
                  <a href="https://maileroo.com" target="_blank" rel="noopener noreferrer">
                    Δωρεάν: 3.000 emails/μήνα - Maileroo
                  </a>
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Αποστολέας Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="noreply@807c33da300c12b9.maileroo.org"
                  value={emailProvider.fromEmail}
                  onChange={(e) => setEmailProvider({...emailProvider, fromEmail: e.target.value})}
                />
                <small className="text-muted d-block mt-1">
                  ⚠️ <strong>Σημαντικό:</strong> Το Maileroo απαιτεί verified domain. Το Gmail δεν λειτουργεί σε sandbox mode.
                </small>
                <small className="text-muted d-block mt-1">
                  🌐 <strong>Λύση:</strong> Πρέπει να verify το domain σας (π.χ. fightingrooster.gr) στο{' '}
                  <a href="https://app.maileroo.com" target="_blank" rel="noopener noreferrer">
                    Maileroo Dashboard → Domains
                  </a>
                  {' '}προσθέτοντας DNS records (SPF, DKIM, DMARC).
                </small>
                <small className="text-muted d-block mt-1">
                  📝 <strong>Βήματα:</strong> 1) Πρόσθεσε domain στο Maileroo, 2) Πρόσθεσε DNS records, 3) Verify, 4) Χρησιμοποίησε email@yourdomain.com
                </small>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Όνομα Αποστολέα</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Colosseum Gym"
                  value={emailProvider.fromName}
                  onChange={(e) => setEmailProvider({...emailProvider, fromName: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Send Rate Settings */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Ρυθμός Αποστολής</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Manual Sender Rate (1-5)
                </label>
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    min="1"
                    max="5"
                    value={sendRate}
                    onChange={(e) => setSendRate(parseInt(e.target.value, 10))}
                  />
                  <span className="badge bg-primary" style={{ minWidth: '40px', fontSize: '1rem' }}>
                    {sendRate}
                  </span>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    {sendRate === 1 && 'Πολύ αργή αποστολή (1 email/SMS ανά batch)'}
                    {sendRate === 2 && 'Αργή αποστολή (2-5 emails/SMS ανά batch)'}
                    {sendRate === 3 && 'Μέτρια αποστολή (5-10 emails/SMS ανά batch) - Προτεινόμενη'}
                    {sendRate === 4 && 'Γρήγορη αποστολή (10-20 emails/SMS ανά batch)'}
                    {sendRate === 5 && 'Πολύ γρήγορη αποστολή (20-50 emails/SMS ανά batch)'}
                  </small>
                </div>
                <div className="mt-2">
                  <small className="text-muted d-block">
                    <strong>Σημείωση:</strong> Χρησιμοποιείται για να ελέγξετε τον ρυθμό αποστολής και να αποφύγετε rate limits από τα APIs.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automatic Notifications */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Αυτόματες Ειδοποιήσεις</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check d-flex justify-content-between align-items-center">
                  <label className="form-check-label" htmlFor="sevenDays">
                    7 ημέρες πριν λήξη
                  </label>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="sevenDays"
                    checked={notifications.sevenDays}
                    onChange={(e) => setNotifications({...notifications, sevenDays: e.target.checked})}
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check d-flex justify-content-between align-items-center">
                  <label className="form-check-label" htmlFor="threeDays">
                    3 ημέρες πριν λήξη
                  </label>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="threeDays"
                    checked={notifications.threeDays}
                    onChange={(e) => setNotifications({...notifications, threeDays: e.target.checked})}
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check d-flex justify-content-between align-items-center">
                  <label className="form-check-label" htmlFor="expiryDay">
                    Ημέρα λήξης
                  </label>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="expiryDay"
                    checked={notifications.expiryDay}
                    onChange={(e) => setNotifications({...notifications, expiryDay: e.target.checked})}
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check d-flex justify-content-between align-items-center">
                  <label className="form-check-label" htmlFor="threeDaysAfter">
                    3 ημέρες μετά λήξη
                  </label>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="threeDaysAfter"
                    checked={notifications.threeDaysAfter}
                    onChange={(e) => setNotifications({...notifications, threeDaysAfter: e.target.checked})}
                  />
                </div>
              </div>
              <div className="border-top pt-3">
                <label className="form-label fw-semibold">Ώρα Αποστολής</label>
                <input 
                  type="time" 
                  className="form-control"
                  value={notifications.sendTime}
                  onChange={(e) => setNotifications({...notifications, sendTime: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Εμφάνιση</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Θέμα</label>
                <select 
                  className="form-select"
                  value={appearance.theme}
                  onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                >
                  <option value="light">Ανοιχτό</option>
                  <option value="dark">Σκούρο</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Γλώσσα</label>
                <select 
                  className="form-select"
                  value={appearance.language}
                  onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                >
                  <option value="el">Ελληνικά</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Νόμισμα</label>
                <select 
                  className="form-select"
                  value={appearance.currency}
                  onChange={(e) => setAppearance({...appearance, currency: e.target.value})}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary">
          Ακύρωση
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Αποθήκευση
        </button>
      </div>
    </div>
  );
};

export default Settings;
