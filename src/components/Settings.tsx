import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [gymInfo, setGymInfo] = useState({
    name: 'Fighting Rooster Athens',
    phone: '210 1234567',
    email: 'info@fightingrooster.gr'
  });

  const [smsProvider, setSmsProvider] = useState({
    provider: 'Viber Business',
    apiKey: '',
    senderId: 'FightingRstr'
  });

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
    // Handle save logic here
    console.log('Settings saved');
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
              <h5 className="card-title mb-0">SMS Provider</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Provider</label>
                <select 
                  className="form-select"
                  value={smsProvider.provider}
                  onChange={(e) => setSmsProvider({...smsProvider, provider: e.target.value})}
                >
                  <option value="Viber Business">Viber Business</option>
                  <option value="Twilio">Twilio</option>
                  <option value="Plivo">Plivo</option>
                  <option value="EasySMS.gr">EasySMS.gr</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">API Key</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="••••••••••••"
                  value={smsProvider.apiKey}
                  onChange={(e) => setSmsProvider({...smsProvider, apiKey: e.target.value})}
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Sender ID</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={smsProvider.senderId}
                  onChange={(e) => setSmsProvider({...smsProvider, senderId: e.target.value})}
                />
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
