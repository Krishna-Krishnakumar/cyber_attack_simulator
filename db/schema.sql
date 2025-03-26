CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATETIME NOT NULL,
  isPhishing BOOLEAN NOT NULL,
  phishing_type VARCHAR(255),
  red_flags TEXT,
  completed BOOLEAN DEFAULT FALSE
); 