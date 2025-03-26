const db = require('./db');

async function testConnection() {
  try {
    // Test connection
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful!');

    // Check if emails table exists
    const [tables] = await db.query('SHOW TABLES LIKE "emails"');
    if (tables.length === 0) {
      console.log('emails table does not exist!');
      // Create the emails table with more detailed fields
      await db.query(`
        CREATE TABLE IF NOT EXISTS emails (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender VARCHAR(255),
          sender_email VARCHAR(255),
          subject VARCHAR(255),
          content TEXT,
          date DATETIME,
          isPhishing BOOLEAN,
          phishing_type VARCHAR(50),
          red_flags TEXT
        )
      `);
      console.log('Created emails table!');

      // Insert sample emails
      await db.query(`
        INSERT INTO emails (sender, sender_email, subject, content, date, isPhishing, phishing_type, red_flags) VALUES
        ('IT Support', 'support@cornpany.com', 'URGENT: Your Account Access Will Be Terminated', 
        'Dear Valued Employee,\n\nOur security system has detected unusual login attempts on your account. To prevent unauthorized access, your account will be terminated in 24 hours unless you verify your identity.\n\nClick here to verify: http://security-verify.cornpany.com/verify\n\nThis is an automated message. Do not reply.\n\nBest regards,\nIT Support Team', 
        NOW(), true, 'Account Access', 'Urgent language, suspicious domain (cornpany instead of company), threatening tone, generic greeting'),

        ('John Smith', 'john.smith@company.com', 'Team Meeting - Project Update', 
        'Hi everyone,\n\nLet''s meet tomorrow at 2 PM in Conference Room A to discuss the Q3 project progress. Please bring your status updates.\n\nAgenda:\n1. Sprint Review\n2. Resource Planning\n3. Timeline Updates\n\nBest regards,\nJohn', 
        NOW(), false, NULL, NULL),

        ('PayPal Service', 'service@paypa1-secure.com', 'Payment Account: Unusual Activity Detected', 
        'Dear Customer,\n\nWe have detected suspicious activity on your PayPal account. Your account has been temporarily limited until we can verify your identity.\n\nTo restore full access to your account, please verify your information here:\nhttp://paypa1-secure.com/verify\n\nIf you don''t verify within 24 hours, your account will be permanently suspended.\n\nPayPal Security Team', 
        NOW(), true, 'Financial Fraud', 'Suspicious domain (paypa1 instead of paypal), urgent tone, threatening consequences, suspicious link'),

        ('HR Department', 'hr@company.com', 'Benefits Enrollment Period Now Open', 
        'Hello Team,\n\nThis is a reminder that the annual benefits enrollment period is now open and will close on Friday, November 15th.\n\nPlease review and update your selections through our secure HR portal:\nhttps://hr.company.com/benefits\n\nIf you have any questions, feel free to reach out to the HR team.\n\nBest regards,\nHR Department', 
        NOW(), false, NULL, NULL),

        ('Microsoft 365', 'no-reply@microsoftonline.net', 'Critical: Your Email Storage is Full', 
        'ATTENTION: Your mailbox has reached its storage limit!\n\nYour Microsoft 365 account will be suspended in 12 hours unless immediate action is taken.\n\nTo prevent loss of important emails, please verify your account and upgrade your storage:\nhttp://microsoft-365-storage.net/upgrade\n\nMicrosoft 365 Team', 
        NOW(), true, 'Cloud Storage', 'Suspicious domain (.net instead of .com), urgent language, threatening tone, unusual sender address'),

        ('Direct Deposit Service', 'payroll@company.com', 'ACTION REQUIRED: Update Direct Deposit Information', 
        'Important Notice:\n\nOur records indicate that your direct deposit information needs to be updated for the upcoming payroll cycle.\n\nPlease log in to the secure employee portal to verify your banking information:\nhttps://payroll.company.com/update\n\nNote: If you did not request this change, please contact HR immediately.\n\nRegards,\nPayroll Department', 
        NOW(), false, NULL, NULL),

        ('Security Team', 'security@g00gle.com', 'Security Alert: Multiple Login Attempts', 
        'Security Alert!\n\nMultiple failed login attempts have been detected on your Google Account from different locations.\n\nIf this wasn''t you, your account may be compromised.\n\nSecure your account now:\nhttp://g00gle.com/security/verify\n\nGoogle Security Team', 
        NOW(), true, 'Account Security', 'Suspicious domain (g00gle instead of google), urgent tone, security threat language, suspicious link'),

        ('LinkedIn', 'notifications@linkedin.com', 'John Miller viewed your profile', 
        'Hi there,\n\nJohn Miller, Director at Tech Solutions Inc., viewed your profile\n\nWant to stand out to recruiters? Upgrade to Premium to see all your viewers and unlock advanced features.\n\nBest regards,\nLinkedIn Team', 
        NOW(), false, NULL, NULL)
      `);
      console.log('Added sample emails!');
    } else {
      console.log('emails table exists!');
    }

    // Check if there's any data
    const [emails] = await db.query('SELECT COUNT(*) as count FROM emails');
    console.log(`Number of emails in database: ${emails[0].count}`);

  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection(); 