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
      alert('Παρακαλω εισαγετε ενα email address στο πεδιο "Αποστολεας Email". Το email πρεπει να ειναι verified στο Maileroo account σας.');
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

    alert('Οι ρυθμισεις αποθηκευτηκαν επιτυχως!');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="h4">Ρυθμισεις</h2>
      </div>

      <div className="row g-4">
        {/* Gym Information */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 py-3">
              <h5 className="card-title mb-0">Στοιχεια Γυμναστηριου</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Ονομα</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={gymInfo.name}
                  onChange={(e) => setGymInfo({...gymInfo, name: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Τηλεφωνο</label>
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
            <div className="card-header border-0 py-3">
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
                  Το email που χρησιμοποιειτε για login στο SMSme.gr
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Εισαγετε τον κωδικο προσβασης"
                  value={smsProvider.password}
                  onChange={(e) => setSmsProvider({...smsProvider, password: e.target.value})}
                />
                <small className="text-muted">
                  <a href="https://smsme.gr" target="_blank" rel="noopener noreferrer">
                    Δημιουργηστε λογαριασμο στο SMSme.gr
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
                  Το ονομα που θα εμφανιζεται ως αποστολεας (μεχρι 11 χαρακτηρες, αλφαριθμητικο)
                </small>
                <small className="text-warning d-block mt-1">
                  ⚠️ <strong>Σημαντικο:</strong> Τα alphanumeric sender IDs (οπως "ColosseumGym") πρεπει να ειναι <strong>approved</strong> απο το SMSme.gr support. 
                  Εαν λαμβανετε 500 error, πιθανοτατα το sender ID δεν ειναι approved. 
                  Επικοινωνηστε με το SMSme.gr support για να approve το sender ID σας η χρησιμοποιηστε numeric sender (π.χ. "1234567890").
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Email Provider */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 py-3">
              <h5 className="card-title mb-0">Email Provider (Maileroo)</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">API Key</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Εισαγετε το API Key απο Maileroo"
                  value={emailProvider.apiKey}
                  onChange={(e) => setEmailProvider({...emailProvider, apiKey: e.target.value})}
                />
                <small className="text-muted">
                  <a href="https://maileroo.com" target="_blank" rel="noopener noreferrer">
                    Δωρεαν: 3.000 emails/μηνα - Maileroo
                  </a>
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Αποστολεας Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="noreply@807c33da300c12b9.maileroo.org"
                  value={emailProvider.fromEmail}
                  onChange={(e) => setEmailProvider({...emailProvider, fromEmail: e.target.value})}
                />
                <small className="text-muted d-block mt-1">
                  ⚠️ <strong>Σημαντικο:</strong> Το Maileroo απαιτει verified domain. Το Gmail δεν λειτουργει σε sandbox mode.
                </small>
                <small className="text-muted d-block mt-1">
                  🌐 <strong>Λυση:</strong> Πρεπει να verify το domain σας (π.χ. fightingrooster.gr) στο{' '}
                  <a href="https://app.maileroo.com" target="_blank" rel="noopener noreferrer">
                    Maileroo Dashboard → Domains
                  </a>
                  {' '}προσθετοντας DNS records (SPF, DKIM, DMARC).
                </small>
                <small className="text-muted d-block mt-1">
                  📝 <strong>Βηματα:</strong> 1) Προσθεσε domain στο Maileroo, 2) Προσθεσε DNS records, 3) Verify, 4) Χρησιμοποιησε email@yourdomain.com
                </small>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Ονομα Αποστολεα</label>
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
            <div className="card-header border-0 py-3">
              <h5 className="card-title mb-0">Ρυθμος Αποστολης</h5>
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
                    {sendRate === 1 && 'Πολυ αργη αποστολη (1 email/SMS ανα batch)'}
                    {sendRate === 2 && 'Αργη αποστολη (2-5 emails/SMS ανα batch)'}
                    {sendRate === 3 && 'Μετρια αποστολη (5-10 emails/SMS ανα batch) - Προτεινομενη'}
                    {sendRate === 4 && 'Γρηγορη αποστολη (10-20 emails/SMS ανα batch)'}
                    {sendRate === 5 && 'Πολυ γρηγορη αποστολη (20-50 emails/SMS ανα batch)'}
                  </small>
                </div>
                <div className="mt-2">
                  <small className="text-muted d-block">
                    <strong>Σημειωση:</strong> Χρησιμοποιειται για να ελεγξετε τον ρυθμο αποστολης και να αποφυγετε rate limits απο τα APIs.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automatic Notifications */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 py-3">
              <h5 className="card-title mb-0">Αυτοματες Ειδοποιησεις</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check d-flex justify-content-between align-items-center">
                  <label className="form-check-label" htmlFor="sevenDays">
                    7 ημερες πριν ληξη
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
                    3 ημερες πριν ληξη
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
                    Ημερα ληξης
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
                    3 ημερες μετα ληξη
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
                <label className="form-label fw-semibold">Ωρα Αποστολης</label>
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
            <div className="card-header border-0 py-3">
              <h5 className="card-title mb-0">Εμφανιση</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Θεμα</label>
                <select 
                  className="form-select"
                  value={appearance.theme}
                  onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                >
                  <option value="light">Ανοιχτο</option>
                  <option value="dark">Σκουρο</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Γλωσσα</label>
                <select 
                  className="form-select"
                  value={appearance.language}
                  onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                >
                  <option value="el">Ελληνικα</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Νομισμα</label>
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
          Ακυρωση
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Αποθηκευση
        </button>
      </div>
    </div>
  );
};

export default Settings;
