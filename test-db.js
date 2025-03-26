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
      // Create the emails table
      await db.query(`
        CREATE TABLE IF NOT EXISTS emails (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subject VARCHAR(255),
          sender VARCHAR(255),
          content TEXT,
          isPhishing BOOLEAN
        )
      `);
      console.log('Created emails table!');
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