export const ANNOUNCEMENT_EMAIL_SUBJECT =
  "🎄 Χριστουγεννιατικες Προσφορες - Colosseum Gym";

export const CHRISTMAS_TEMPLATE = `🎄🎅 Χριστουγεννιατικες Προσφορες! 🎁❄️

Καλησπερα!

Αυτες τις γιορτες, το Colosseum Gym σας προσφερει ειδικες προσφορες! 🎉

🔥 Προσφορες:
✨ 20% εκπτωση σε ολες τις συνδρομες
✨ Δωρεαν Personal Training session
✨ Special gift για νεους πελατες

⏰ Η προσφορα ισχυει εως 31 Δεκεμβριου!

📞 Επικοινωνηστε μαζι μας:
📧 info@fightingrooster.gr
📱 210 1234567

Καλα Χριστουγεννα! 🎄🎁

Η ομαδα του Colosseum Gym`;

/** Wraps a plain-text announcement in the branded HTML email layout. */
export const createEmailHTML = (text: string): string => {
  const html = text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");

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
      background: #141414;
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
      background: #f5c400;
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
      <h1>🎄 Καλα Χριστουγεννα! 🎁</h1>
    </div>
    <div class="email-content">
      <div class="content">
        <p>${html}</p>
      </div>
      <div class="footer">
        <p><strong>"Keep in Mind"</strong></p>
        <p>📧 info@keepinmind.gr | 📱 210 1234567</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          Αυτο το email σταλθηκε απο το "Keep in Mind" Gym Management System
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
