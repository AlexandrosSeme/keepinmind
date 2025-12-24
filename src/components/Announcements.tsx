import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import type { Member } from '../types';

interface Announcement {
  id: number;
  title: string;
  sentTo: string;
  channel: string;
  date: string;
  status: 'sent' | 'scheduled' | 'draft';
  successful: number;
}

// Function to create beautiful HTML email template
const createEmailHTML = (text: string): string => {
  // Convert text to HTML with proper formatting
  const html = text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in beautiful email template
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-content {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-top: 20px;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    .content {
      font-size: 16px;
      line-height: 1.8;
    }
    .content p {
      margin: 15px 0;
    }
    .offer-box {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .contact-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎄 Καλά Χριστούγεννα! 🎁</h1>
    </div>
    <div class="email-content">
      <div class="content">
        <p>${html}</p>
      </div>
      <div class="footer">
        <p><strong>"Keep in Mind"</strong></p>
        <p>📧 info@keepinmind.gr | 📱 210 1234567</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          Αυτό το email στάλθηκε από το "Keep in Mind" Gym Management System
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

const Announcements: React.FC = () => {
  const { members } = useAppData();
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [channel, setChannel] = useState('email'); // Default to email
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [manualPhones, setManualPhones] = useState<string[]>([]);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'Χριστουγεννιάτικες Προσφορές',
      sentTo: '142 μέλη',
      channel: 'SMS',
      date: '10/12/2024 10:00',
      status: 'sent',
      successful: 138
    }
  ]);

  // Filter members based on recipient selection
  const getFilteredMembers = (): Member[] => {
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    switch (recipients) {
      case 'all':
        return members;
      case 'active':
        return members.filter(m => m.status === 'active');
      case 'expiring': {
        // Members expiring within 7 days
        return members.filter(m => {
          const expiryDate = new Date(m.expiry);
          return expiryDate >= today && expiryDate <= weekLater;
        });
      }
      case 'overdue':
        return members.filter(m => {
          const expiryDate = new Date(m.expiry);
          return expiryDate < new Date() && m.status === 'expired';
        });
      case 'monthly':
        return members.filter(m => m.package.toLowerCase().includes('μηνιαί'));
      case 'yearly':
        return members.filter(m => m.package.toLowerCase().includes('ετήσι'));
      default:
        return members;
    }
  };

  const filteredMembers = getFilteredMembers();
  
  const recipientOptions = [
    { value: 'all', label: `Όλα τα μέλη (${members.length})` },
    { value: 'active', label: `Ενεργά μέλη (${members.filter(m => m.status === 'active').length})` },
    { value: 'expiring', label: `Λήξη εντός 7 ημερών (${members.filter(m => {
      const expiryDate = new Date(m.expiry);
      const today = new Date();
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate >= today && expiryDate <= weekLater;
    }).length})` },
    { value: 'overdue', label: `Ληξιπρόθεσμα (${members.filter(m => {
      const expiryDate = new Date(m.expiry);
      return expiryDate < new Date() && m.status === 'expired';
    }).length})` },
    { value: 'monthly', label: `Μηνιαία συνδρομή (${members.filter(m => m.package.toLowerCase().includes('μηνιαί')).length})` },
    { value: 'yearly', label: `Ετήσια συνδρομή (${members.filter(m => m.package.toLowerCase().includes('ετήσι')).length})` }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { class: 'bg-success text-white', text: 'Στάλθηκε' },
      scheduled: { class: 'bg-warning text-dark', text: 'Προγραμματισμένο' },
      draft: { class: 'bg-secondary text-white', text: 'Πρόχειρο' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'bg-secondary text-white', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  // Calculate estimated cost based on channel
  const calculateEstimatedCost = (): number => {
    if (!message) return 0;
    
    if (channel === 'email') {
      return 0; // Email is free with Maileroo
    }
    
    const smsChannel = channel === 'viber' ? 'viber' : 'sms';
    // For SMS cost, count only members with phone + manual phone numbers
    const memberPhoneCount = filteredMembers.filter(m => m.phone).length;
    const totalRecipients = memberPhoneCount + manualPhones.length;
    if (totalRecipients === 0) return 0;

    return smsService.calculateCost(message, totalRecipients, smsChannel);
  };

  const estimatedCost = calculateEstimatedCost();

  // Load settings from localStorage (set in Settings component)
  useEffect(() => {
    // Check localStorage first, then use default Maileroo API key
    const emailApiKey = localStorage.getItem('emailApiKey') || '2f97c1ef3c4c95f61976e3043bedf139976c6e688428e24576bc87c3ea37d530';
    const emailFrom = localStorage.getItem('emailFrom') || 'noreply@807c33da300c12b9.maileroo.org'; // Verified Maileroo domain
    const emailFromName = localStorage.getItem('emailFromName') || 'Colosseum Gym';
    
    const smsUsername = localStorage.getItem('smsUsername');
    const smsPassword = localStorage.getItem('smsPassword');
    const smsSenderId = localStorage.getItem('smsSenderId') || 'FightingRstr';

    if (emailApiKey) {
      emailService.initialize(emailApiKey, emailFrom, emailFromName);
      console.log('Email service initialized on component mount');
    }
    
    if (smsUsername && smsPassword) {
      smsService.initialize(smsUsername, smsPassword, smsSenderId);
      console.log('SMS service initialized on component mount');
    }
  }, []);

  const handleSend = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('=== handleSend FUNCTION CALLED ===');
    console.log('Event object:', e);
    console.log('Timestamp:', new Date().toISOString());

    if (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Event prevented and stopped');
    }
    
    console.log('=== handleSend STATE ===', { 
      message: message.substring(0, 100),
      messageLength: message.length, 
      messageTrimmed: message.trim().length,
      channel, 
      recipients,
      filteredMembers: filteredMembers.length,
      filteredMembersList: filteredMembers.map(m => ({ name: m.name, email: m.email, phone: m.phone })),
      manualEmails: manualEmails,
      manualEmailsCount: manualEmails.length,
      sending,
      emailServiceInitialized: emailService.isInitialized(),
      smsServiceInitialized: smsService.isInitialized()
    });
    
    if (!message.trim()) {
      console.log('No message, returning');
      setSendResult({ success: false, message: 'Παρακαλώ εισάγετε μήνυμα' });
      return;
    }

    // Check if we have recipients based on channel - more flexible validation
    if (channel === 'email') {
      // For email, we need either member emails OR manual emails
      const hasMemberEmails = filteredMembers.some(m => m.email);
      if (!hasMemberEmails && manualEmails.length === 0) {
        setSendResult({ 
          success: false, 
          message: 'Δεν υπάρχουν email addresses. Προσθέστε manual emails (πατήστε "Προσθήκη" μετά το email) ή επιλέξτε μέλη με email.' 
        });
        return;
      }
    } else if (channel === 'sms' || channel === 'viber') {
      // For SMS/Viber, χρειαζόμαστε μέλη με τηλέφωνο ή manual τηλέφωνα
      const hasMemberPhones = filteredMembers.some(m => m.phone);
      const hasManualPhones = manualPhones.length > 0;
      if (!hasMemberPhones && !hasManualPhones) {
        setSendResult({
          success: false,
          message: 'Δεν υπάρχουν αριθμοί κινητού. Επιλέξτε μέλη με τηλέφωνο ή προσθέστε manual αριθμούς (πατήστε "Προσθήκη" μετά τον αριθμό).'
        });
        return;
      }
    } else if (channel === 'both') {
      // For both, we need at least one email OR one phone
      const hasMemberEmails = filteredMembers.some(m => m.email);
      const hasMemberPhones = filteredMembers.some(m => m.phone) || manualPhones.length > 0;
      
      if (!hasMemberEmails && manualEmails.length === 0 && !hasMemberPhones) {
        setSendResult({ 
          success: false, 
          message: 'Δεν υπάρχουν αποδέκτες. Προσθέστε manual emails ή επιλέξτε μέλη με email/phone.' 
        });
        return;
      }
    }

    console.log('=== SETTING SENDING STATE TO TRUE ===');
    setSending(true);
    setSendResult(null);
    console.log('✅ Sending state updated, starting send process...');

    try {
      let result: { success: number; failed: number; errors: string[] } | null = null;
      const channels: string[] = [];

      // Send based on selected channel
      console.log('=== CHECKING CHANNEL ===', { channel });
      
      if (channel === 'email' || channel === 'both') {
        console.log('=== EMAIL CHANNEL SELECTED ===');
        console.log('Email service initialized:', emailService.isInitialized());
        
        if (!emailService.isInitialized()) {
          console.error('Email service NOT initialized!');
          throw new Error('Email service not configured. Please set up Maileroo API in Settings.');
        }
        
        // Check if fromEmail is set
        const emailFrom = localStorage.getItem('emailFrom');
        console.log('📧 Checking fromEmail from localStorage:', emailFrom);
        
        if (!emailFrom || emailFrom.trim() === '') {
          throw new Error(
            'Το email address δεν είναι set. Παρακαλώ:\n' +
            '1. Πηγαίνετε στο Settings (Ρυθμίσεις)\n' +
            '2. Βάλτε ένα email address στο πεδίο "Αποστολέας Email" (π.χ. alexandros.seme@gmail.com)\n' +
            '3. Κάντε κλικ στο "Αποθήκευση" (Save)\n' +
            '4. Δοκιμάστε ξανά'
          );
        }
        
        console.log('✅ Using fromEmail:', emailFrom);
        
        console.log('Email service is initialized, proceeding...');

        // Get emails from members
        const memberEmails = filteredMembers
          .filter(m => m.email)
          .map(m => ({
            email: m.email!,
            name: m.name,
          }));

        // Add manual emails
        const manualEmailRecipients = manualEmails.map(email => ({
          email,
          name: email.split('@')[0], // Use part before @ as name
        }));

        // Combine all email recipients
        const allEmailRecipients = [...memberEmails, ...manualEmailRecipients];
        console.log('📋 === EMAIL RECIPIENTS ===');
        console.log('Member emails:', memberEmails);
        console.log('Manual emails:', manualEmailRecipients);
        console.log('All email recipients:', allEmailRecipients);
        console.log('Total recipients count:', allEmailRecipients.length);

        if (allEmailRecipients.length === 0 && (channel === 'email' || channel === 'both')) {
          console.error('❌ No email recipients found!');
          throw new Error('Δεν υπάρχουν email addresses για αποστολή. Προσθέστε μέλη με email ή manual emails.');
        }

        if (allEmailRecipients.length > 0) {
          console.log('📤 === STARTING EMAIL SEND ===');
          console.log('Recipients:', allEmailRecipients.map(r => r.email));
          console.log('Message length:', message.length);
          console.log('Subject: Ανακοίνωση - Colosseum Gym');
          
          const sendRate = parseInt(localStorage.getItem('sendRate') || '3', 10);
          console.log('Send rate:', sendRate);
          
          try {
            console.log('🔄 Calling emailService.sendBulkEmails...');
            
            // Create beautiful HTML email template
            const htmlMessage = createEmailHTML(message);
            
            result = await emailService.sendBulkEmails(
              allEmailRecipients,
              '🎄 Χριστουγεννιάτικες Προσφορές - Colosseum Gym',
              message,
              htmlMessage,
              sendRate
            );
            console.log('✅ === EMAIL SEND RESULT ===', result);
            channels.push('Email');
          } catch (error) {
            console.error('❌ === EMAIL SEND ERROR ===', error);
            throw error;
          }
        } else {
          console.log('⚠️ No email recipients found');
        }
      }

      if (channel === 'sms' || channel === 'viber' || channel === 'both') {
        console.log('📱 === SMS CHANNEL SELECTED ===');
        if (!smsService.isInitialized()) {
          throw new Error('SMS service not configured. Please set up SMSme.gr API in Settings.');
        }

        const memberSmsRecipients = filteredMembers
          .filter(m => m.phone)
          .map(m => ({
            phone: m.phone,
            name: m.name,
          }));

        const manualSmsRecipients = manualPhones.map(phone => ({
          phone,
          name: phone,
        }));

        const smsRecipients = [...memberSmsRecipients, ...manualSmsRecipients];
        console.log('📱 SMS Recipients:', {
          memberRecipients: memberSmsRecipients.length,
          manualRecipients: manualSmsRecipients.length,
          total: smsRecipients.length,
          recipients: smsRecipients.map(r => ({ phone: r.phone, name: r.name })),
        });

        if (smsRecipients.length > 0) {
          const smsChannel = channel === 'viber' ? 'viber' : 'sms';
          const sendRate = parseInt(localStorage.getItem('sendRate') || '3', 10);
          console.log('📱 Starting SMS send:', { channel: smsChannel, sendRate, messageLength: message.length });
          result = await smsService.sendBulkSMS(smsRecipients, message, smsChannel, sendRate);
          console.log('📱 SMS send result:', result);
          channels.push(smsChannel === 'viber' ? 'Viber' : 'SMS');
        } else {
          console.warn('⚠️ No SMS recipients found');
        }
      }

      if (result) {
        // Check if there were any errors
        if (result.failed > 0 && result.errors.length > 0) {
          // Show error message to user
          setSendResult({
            success: false,
            message: `Αποστολή απέτυχε: ${result.errors.join('; ')}`,
          });
        } else if (result.success > 0) {
          // Success - create announcement
        const newAnnouncement: Announcement = {
          id: Date.now(),
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            sentTo: `${result.success} παραλήπτες`,
          channel: channels.join(' + '),
          date: new Date().toLocaleString('el-GR'),
          status: 'sent',
          successful: result.success,
        };

        setRecentAnnouncements([newAnnouncement, ...recentAnnouncements]);
        setMessage('');
        setManualEmails([]); // Clear manual emails after successful send
          setManualPhones([]); // Clear manual phones after successful send
        setSendResult({
          success: true,
          message: `Αποστολή ολοκληρώθηκε! Επιτυχημένα: ${result.success}, Αποτυχημένα: ${result.failed}`,
        });
        } else {
          // All failed
          setSendResult({
            success: false,
            message: `Αποστολή απέτυχε: ${result.errors.join('; ') || 'Άγνωστο σφάλμα'}`,
          });
        }
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      
      let errorMessage = 'Σφάλμα κατά την αποστολή';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a domain verification error
        if (error.message.includes('not associated') || 
            error.message.includes('domain') || 
            error.message.includes('Domain verification')) {
          errorMessage = 'Το email domain δεν είναι verified στο Maileroo. ' +
            'Πηγαίνετε στο Settings και χρησιμοποιήστε ένα verified email address ' +
            '(π.χ. Gmail) ή verify το domain σας στο Maileroo Dashboard.';
        }
      }
      
      setSendResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving to database
    console.log('Saving draft...', { message, recipients, channel });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const email = newEmailInput.trim();
    if (!email) {
      setSendResult({ success: false, message: 'Παρακαλώ εισάγετε email' });
      return;
    }

    if (!validateEmail(email)) {
      setSendResult({ success: false, message: 'Μη έγκυρο email address' });
      return;
    }

    if (manualEmails.includes(email)) {
      setSendResult({ success: false, message: 'Το email υπάρχει ήδη στη λίστα' });
      return;
    }

    setManualEmails([...manualEmails, email]);
    setNewEmailInput('');
    setSendResult(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setManualEmails(manualEmails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddEmail();
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Allow digits, spaces, plus sign, and common separators
    const cleaned = phone.replace(/[+\s\-().]/g, '');
    // Basic validation: at least 8 digits
    return /^[0-9]{8,15}$/.test(cleaned);
  };

  const handleAddPhone = () => {
    const phone = newPhoneInput.trim();
    if (!phone) {
      setSendResult({ success: false, message: 'Παρακαλώ εισάγετε αριθμό κινητού' });
      return;
    }

    if (!validatePhone(phone)) {
      setSendResult({ success: false, message: 'Μη έγκυρος αριθμός κινητού. Χρησιμοποιήστε μορφή 69..., 3069... ή +3069...' });
      return;
    }

    if (manualPhones.includes(phone)) {
      setSendResult({ success: false, message: 'Ο αριθμός υπάρχει ήδη στη λίστα' });
      return;
    }

    setManualPhones([...manualPhones, phone]);
    setNewPhoneInput('');
    setSendResult(null);
  };

  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddPhone();
    }
  };

  const handleRemovePhone = (phoneToRemove: string) => {
    setManualPhones(manualPhones.filter(phone => phone !== phoneToRemove));
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <h2 className="h4 mb-3 mb-md-0">Ανακοινώσεις</h2>
        <button className="btn btn-primary">
          <Send size={16} className="me-2" />
          Νέα Ανακοίνωση
        </button>
      </div>

      {/* Create Announcement Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h5 className="card-title mb-0">Δημιουργία Ανακοίνωσης</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            {/* Recipients */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Αποδέκτες</label>
              <select 
                className="form-select"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              >
                {recipientOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Κανάλι</label>
              <div className="d-flex gap-3 flex-wrap">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="sms"
                    value="sms"
                    checked={channel === 'sms'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sms">
                    SMS
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="viber"
                    value="viber"
                    checked={channel === 'viber'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="viber">
                    Viber
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="email"
                    value="email"
                    checked={channel === 'email'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="email">
                    Email
                  </label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="channel" 
                    id="both"
                    value="both"
                    checked={channel === 'both'}
                    onChange={(e) => setChannel(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="both">
                    SMS + Email
                  </label>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">Μήνυμα</label>
                {channel === 'email' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      const christmasTemplate = `🎄🎅 Χριστουγεννιάτικες Προσφορές! 🎁❄️

Καλησπέρα!

Αυτές τις γιορτές, το Colosseum Gym σας προσφέρει ειδικές προσφορές! 🎉

🔥 Προσφορές:
✨ 20% έκπτωση σε όλες τις συνδρομές
✨ Δωρεάν Personal Training session
✨ Special gift για νέους πελάτες

⏰ Η προσφορά ισχύει έως 31 Δεκεμβρίου!

📞 Επικοινωνήστε μαζί μας:
📧 info@fightingrooster.gr
📱 210 1234567

Καλά Χριστούγεννα! 🎄🎁

Η ομάδα του Colosseum Gym`;

                      setMessage(christmasTemplate);
                    }}
                  >
                    🎄 Load Χριστουγεννιάτικο Template
                  </button>
                )}
              </div>
              <textarea
                className="form-control"
                rows={8}
                placeholder="Γράψτε το μήνυμά σας εδώ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="d-flex justify-content-between mt-2 flex-wrap gap-2">
                <small className="text-muted">
                  Χαρακτήρες: {message.length}{channel !== 'email' && '/160'}
                </small>
                <small className="text-muted">
                  {channel === 'email' ? (
                    <span className="text-success">Δωρεάν (Maileroo)</span>
                  ) : (
                    <>Εκτιμώμενο κόστος: €{estimatedCost.toFixed(2)}</>
                  )}
                </small>
              </div>
              <div className="d-flex flex-column gap-1 mt-1">
                {filteredMembers.length > 0 && (
                  <small className="text-muted">
                    Αποδέκτες: {filteredMembers.length} {channel === 'email' && `(${filteredMembers.filter(m => m.email).length} με email)`}
                  </small>
                )}
                {manualEmails.length > 0 && (channel === 'email' || channel === 'both') && (
                  <small className="text-info">
                    Manual Emails: {manualEmails.length}
                  </small>
                )}
                {manualPhones.length > 0 && (channel === 'sms' || channel === 'both') && (
                  <small className="text-info">
                    Manual Τηλέφωνα (SMS): {manualPhones.length}
                  </small>
                )}
                {(channel === 'email' || channel === 'both') && (
                  <small className="text-muted fw-semibold">
                    Σύνολο Email Recipients: {filteredMembers.filter(m => m.email).length + manualEmails.length}
                  </small>
                )}
                {(channel === 'sms' || channel === 'both') && (
                  <small className="text-muted fw-semibold">
                    Σύνολο SMS Recipients: {filteredMembers.filter(m => m.phone).length + manualPhones.length}
                  </small>
                )}
              </div>
            </div>

            {/* Manual Email Addresses */}
            {(channel === 'email' || channel === 'both') && (
              <div className="col-12">
                <label className="form-label fw-semibold">Προσθήκη Email Addresses (Manual)</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="example@email.com"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={handleAddEmail}
                  >
                    <Plus size={16} />
                    Προσθήκη
                  </button>
                </div>
                {manualEmails.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted d-block mb-2">
                      Προστέθηκαν {manualEmails.length} email{manualEmails.length > 1 ? 's' : ''}:
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {manualEmails.map((email, index) => (
                        <span
                          key={index}
                          className="badge bg-primary d-flex align-items-center gap-2"
                          style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                        >
                          {email}
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleRemoveEmail(email)}
                            aria-label="Remove"
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <small className="text-muted d-block mt-2">
                  Προσθέστε email addresses για αποστολή εκτός από τα μέλη
                </small>
              </div>
            )}

            {/* Manual Phone Numbers for SMS */}
            {(channel === 'sms' || channel === 'both') && (
              <div className="col-12">
                <label className="form-label fw-semibold">Προσθήκη Αριθμών Κινητού (SMS Manual)</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="69..., 3069..., ή +3069..."
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    onKeyPress={handlePhoneKeyPress}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={handleAddPhone}
                  >
                    <Plus size={16} />
                    Προσθήκη
                  </button>
                </div>
                {manualPhones.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted d-block mb-2">
                      Προστέθηκαν {manualPhones.length} αριθμοί:
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {manualPhones.map((phone, index) => (
                        <span
                          key={index}
                          className="badge bg-success d-flex align-items-center gap-2"
                          style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                        >
                          {phone}
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleRemovePhone(phone)}
                            aria-label="Remove"
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <small className="text-muted d-block mt-2">
                  Προσθέστε αριθμούς κινητού που δεν ανήκουν στα μέλη (μπορείτε να γράψετε 69..., 3069..., ή +3069..., θα γίνουν αυτόματα κανονικοποίηση).
                </small>
              </div>
            )}

            {/* Send Result */}
            {sendResult && (
              <div className="col-12">
                <div className={`alert ${sendResult.success ? 'alert-success' : 'alert-danger'} d-flex align-items-start gap-2`}>
                  {sendResult.success ? (
                    <CheckCircle size={20} className="mt-1" />
                  ) : (
                    <XCircle size={20} className="mt-1" />
                  )}
                  <div className="flex-grow-1">
                    {sendResult.message.split('\n').map((line, index) => (
                      <div key={index}>
                        {line.includes('http') ? (
                          <span>
                            {line.split(/(https?:\/\/[^\s]+)/).map((part, i) => 
                              part.match(/^https?:\/\//) ? (
                                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-decoration-underline">
                                  {part}
                                </a>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                          </span>
                        ) : (
                          <span>{line}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary flex-fill"
                  onClick={handleSaveDraft}
                  disabled={sending || !message.trim()}
                >
                  Αποθήκευση Πρόχειρου
                </button>
                <button 
                  type="button"
                  className="cursor-pointer btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                  onClick={(e) => {
                    console.log('🚀 ===== BUTTON CLICKED ===== 🚀');
                    console.log('Timestamp:', new Date().toISOString());
                    console.log('Button click event:', e);
                    console.log('Current state:', {
                      sending,
                      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                      messageLength: message.length,
                      messageTrimmed: message.trim().length,
                      channel,
                      recipients,
                      manualEmails: manualEmails,
                      manualEmailsCount: manualEmails.length,
                      filteredMembers: filteredMembers.length,
                      filteredMembersList: filteredMembers.map(m => ({ name: m.name, email: m.email, phone: m.phone })),
                      emailServiceInitialized: emailService.isInitialized(),
                      smsServiceInitialized: smsService.isInitialized()
                    });
                    console.log('Calling handleSend function...');
                    handleSend(e);
                    console.log('handleSend function called');
                  }}
                  disabled={false}
                  title="Κάντε κλικ για αποστολή"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="spinner-border spinner-border-sm" />
                      Αποστολή...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Αποστολή Τώρα
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h5 className="card-title mb-0">Πρόσφατες Ανακοινώσεις</h5>
        </div>
        <div className="card-body p-0">
          {recentAnnouncements.map(announcement => (
            <div key={announcement.id} className="border-bottom p-4 hover-bg-light">
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-dark">{announcement.title}</h6>
                  <p className="text-muted mb-2 small">
                    Στάλθηκε σε {announcement.sentTo} | {announcement.channel}
                  </p>
                  <small className="text-muted">{announcement.date}</small>
                </div>
                <div className="text-end">
                  {getStatusBadge(announcement.status)}
                  <div className="mt-1">
                    <small className="text-muted">
                      {announcement.successful} επιτυχημένα
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {recentAnnouncements.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <Send size={32} className="text-muted" />
            </div>
          </div>
          <h5 className="text-muted">Δεν υπάρχουν ανακοινώσεις</h5>
          <p className="text-muted mb-4">Δημιουργήστε την πρώτη ανακοίνωση για να ξεκινήσετε</p>
          <button className="btn btn-primary">
            <Send size={16} className="me-2" />
            Δημιουργία Ανακοίνωσης
          </button>
        </div>
      )}
    </div>
  );
};

export default Announcements;
