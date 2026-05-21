const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5500;
const JWT_SECRET = process.env.JWT_SECRET || 'asylen-ventures-kashmir-secret-key-98765';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure uploads folder exists and serve it statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Middleware to verify JWT admin authorization
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// File Upload Endpoint (Admin only)
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file selected for upload.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully!', url: fileUrl });
});

// Helper function to resolve and convert Google Maps URLs (including shortened links and iframe embeds)
async function resolveAndConvertMapUrl(inputUrl) {
  if (!inputUrl) return '';
  let url = inputUrl.trim();

  // 1. If it's an iframe tag, extract the src attribute
  if (/<iframe/i.test(url)) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      url = match[1];
    }
  }

  // 2. If it's a shortened url (like maps.app.goo.gl or goo.gl/maps), resolve the redirect first
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      url = res.url;
    } catch (err) {
      console.error('Error resolving redirect for shortened URL:', err);
    }
  }

  // 3. Extract the coordinates/place name and build the embed URL
  if (url.includes('/maps/embed') || url.includes('output=embed')) {
    return url;
  }

  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = atMatch[1];
    const lng = atMatch[2];
    const placeMatch = url.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const dataMatch = url.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    const lat = dataMatch[1];
    const lng = dataMatch[2];
    const placeMatch = url.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const placeMatchOnly = url.match(/\/place\/([^/]+)/);
  if (placeMatchOnly) {
    const placeName = decodeURIComponent(placeMatchOnly[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  if (/google\.[a-z.]+\/maps/i.test(url)) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}output=embed`;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Login Route
app.post(['/api/auth/login', '/api/admin/login'], (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during login.' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT token (expires in 12 hours)
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({ message: 'Login successful', username: user.username, role: user.role });
  });
});

// Verify Auth Token Route / Admin Me Route
app.get(['/api/auth/verify', '/api/admin/me'], (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'Access denied. Please log in.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, id: verified.id, username: verified.username, role: verified.role });
  } catch (err) {
    res.clearCookie('token');
    res.status(401).json({ authenticated: false, error: 'Invalid or expired session. Please log in again.' });
  }
});

// Logout Route
app.post(['/api/auth/logout', '/api/admin/logout'], (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Change Password Route (Admin only)
app.post('/api/admin/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error fetching user profile.' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id], (err2) => {
      if (err2) {
        return res.status(500).json({ error: 'Failed to update admin password.' });
      }
      res.json({ message: 'Password updated successfully!' });
    });
  });
});


// ==========================================
// 2. BOOKINGS ENDPOINTS (SITE VISITS)
// ==========================================

// Create booking (Public)
app.post('/api/bookings', (req, res) => {
  const { name, email, datetime, property_interest, message } = req.body;

  if (!name || !email || !datetime || !property_interest) {
    return res.status(400).json({ error: 'Missing required booking fields (name, email, datetime, property_interest).' });
  }

  db.run(
    'INSERT INTO bookings (name, email, datetime, property_interest, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, datetime, property_interest, message || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save reservation: ' + err.message });
      }
      res.status(201).json({ message: 'Site visit scheduled successfully!', bookingId: this.lastID });
    }
  );
});

// Get all bookings (Admin only)
app.get('/api/bookings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Update booking status (Admin only)
app.put(['/api/bookings/:id', '/api/bookings/:id/status'], authenticateToken, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update booking: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ message: 'Booking status updated successfully.' });
  });
});

// Delete booking (Admin only)
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM bookings WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete booking: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ message: 'Booking deleted successfully.' });
  });
});


// ==========================================
// 3. PROPERTIES ENDPOINTS
// ==========================================

// Get all properties (Public)
app.get('/api/properties', (req, res) => {
  db.all('SELECT * FROM properties ORDER BY category, id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Get single property by ID (Public/Admin)
app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM properties WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json(row);
  });
});

// Add new property (Admin only)
app.post('/api/properties', authenticateToken, (req, res) => {
  const { title, category, description, price, image_url } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required.' });
  }

  db.run(
    'INSERT INTO properties (title, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
    [title, category, description || '', price || 'Enquire', image_url || 'img/villa_exterior_both.png'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save property: ' + err.message });
      }
      res.status(201).json({ message: 'Property added successfully!', propertyId: this.lastID });
    }
  );
});

// Update property (Admin only)
app.put('/api/properties/:id', authenticateToken, (req, res) => {
  const { title, category, description, price, image_url } = req.body;
  const { id } = req.params;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required.' });
  }

  db.run(
    'UPDATE properties SET title = ?, category = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
    [title, category, description, price, image_url, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update property: ' + err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Property not found.' });
      }
      res.json({ message: 'Property updated successfully.' });
    }
  );
});

// Delete property (Admin only)
app.delete('/api/properties/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM properties WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete property: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json({ message: 'Property deleted successfully.' });
  });
});


// ==========================================
// 4. CONTACT MESSAGES ENDPOINTS
// ==========================================

// Create message (Public)
app.post('/api/messages', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required inquiry fields (name, email, subject, message).' });
  }

  db.run(
    'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message: ' + err.message });
      }
      res.status(201).json({ message: 'Message sent successfully!', messageId: this.lastID });
    }
  );
});

// Get all messages (Admin only)
app.get('/api/messages', authenticateToken, (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Update message status (Admin only)
app.put(['/api/messages/:id', '/api/messages/:id/status'], authenticateToken, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  db.run('UPDATE messages SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update message: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.json({ message: 'Message status updated successfully.' });
  });
});

// Delete message (Admin only)
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM messages WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete message: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.json({ message: 'Message deleted successfully.' });
  });
});

// ==========================================
// 4.5. NEWSLETTER SUBSCRIBERS ENDPOINTS
// ==========================================

// Subscribe to newsletter (Public)
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  db.run(
    'INSERT INTO newsletter_subscribers (email) VALUES (?)',
    [email.trim().toLowerCase()],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'This email is already subscribed.' });
        }
        return res.status(500).json({ error: 'Failed to subscribe: ' + err.message });
      }
      res.status(201).json({ message: 'Subscribed successfully! Thank you.' });
    }
  );
});

// Get all newsletter subscribers (Admin only)
app.get('/api/newsletter/subscribers', authenticateToken, (req, res) => {
  db.all('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Delete a subscriber (Admin only)
app.delete('/api/newsletter/subscribers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM newsletter_subscribers WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete subscriber: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }
    res.json({ message: 'Subscriber deleted successfully.' });
  });
});


// ==========================================
// 5. PROPERTY GALLERY ENDPOINTS
// ==========================================

// Get gallery images for a specific property (Public)
app.get('/api/properties/:id/gallery', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM property_gallery WHERE property_id = ? ORDER BY id ASC', [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Add a gallery image to a property (Admin only)
app.post('/api/properties/:id/gallery', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'image_url is required.' });
  }

  db.run(
    'INSERT INTO property_gallery (property_id, image_url) VALUES (?, ?)',
    [id, image_url],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add gallery image: ' + err.message });
      }
      res.status(201).json({ message: 'Gallery image added successfully!', id: this.lastID, image_url });
    }
  );
});

// Delete a gallery image by ID (Admin only)
app.delete('/api/properties/gallery/:gallery_id', authenticateToken, (req, res) => {
  const { gallery_id } = req.params;

  db.run('DELETE FROM property_gallery WHERE id = ?', [gallery_id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete gallery image: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gallery image not found.' });
    }
    res.json({ message: 'Gallery image deleted successfully.' });
  });
});


// ==========================================
// 6. SITE SETTINGS ENDPOINTS
// ==========================================

// Get all site settings (Public)
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM site_settings', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Update site settings in bulk (Admin only)
app.put('/api/settings', authenticateToken, async (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid settings update payload.' });
  }

  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Run updates sequentially
    for (const [key, value] of Object.entries(updates)) {
      let updatedValue = String(value);
      if (key === 'contact_map_url') {
        updatedValue = await resolveAndConvertMapUrl(updatedValue);
      }
      await new Promise((resolve, reject) => {
        db.run('UPDATE site_settings SET value = ? WHERE key = ?', [updatedValue, key], function(err) {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ message: 'Site settings updated successfully.' });
  } catch (err) {
    console.error('Error updating site settings:', err);
    db.run('ROLLBACK', () => {});
    res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
});


// ==========================================
// 7. SOCIAL LINKS ENDPOINTS
// ==========================================

// Get all social links (Public)
app.get('/api/social-links', (req, res) => {
  db.all('SELECT * FROM social_links', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Add a new social link (Admin only)
app.post('/api/social-links', authenticateToken, (req, res) => {
  const { platform_name, icon_class, url } = req.body;
  if (!platform_name || !icon_class || !url) {
    return res.status(400).json({ error: 'Platform name, icon class, and URL are required.' });
  }
  db.run(
    'INSERT INTO social_links (platform_name, icon_class, url) VALUES (?, ?, ?)',
    [platform_name, icon_class, url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.status(201).json({ id: this.lastID, platform_name, icon_class, url });
    }
  );
});

// Update a social link (Admin only)
app.put('/api/social-links/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { platform_name, icon_class, url } = req.body;
  if (!platform_name || !icon_class || !url) {
    return res.status(400).json({ error: 'Platform name, icon class, and URL are required.' });
  }
  db.run(
    'UPDATE social_links SET platform_name = ?, icon_class = ?, url = ? WHERE id = ?',
    [platform_name, icon_class, url, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.json({ message: 'Social link updated successfully.' });
    }
  );
});

// Delete a social link (Admin only)
app.delete('/api/social-links/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM social_links WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({ message: 'Social link deleted successfully.' });
  });
});


// ==========================================
// 8. MAP LOCATIONS ENDPOINTS
// ==========================================

// Get all map locations (Public)
app.get('/api/map-locations', (req, res) => {
  db.all('SELECT * FROM map_locations', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Add a new map location (Admin only)
app.post('/api/map-locations', authenticateToken, async (req, res) => {
  const { title, address, map_url, is_active } = req.body;
  if (!title || !address || !map_url) {
    return res.status(400).json({ error: 'Title, address, and Map Embed URL are required.' });
  }
  const resolvedUrl = await resolveAndConvertMapUrl(map_url);
  db.run(
    'INSERT INTO map_locations (title, address, map_url, is_active) VALUES (?, ?, ?, ?)',
    [title, address, resolvedUrl, is_active ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.status(201).json({ id: this.lastID, title, address, map_url: resolvedUrl, is_active: is_active ? 1 : 0 });
    }
  );
});

// Update a map location (Admin only)
app.put('/api/map-locations/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, address, map_url, is_active } = req.body;
  if (!title || !address || !map_url) {
    return res.status(400).json({ error: 'Title, address, and Map Embed URL are required.' });
  }
  const resolvedUrl = await resolveAndConvertMapUrl(map_url);
  db.run(
    'UPDATE map_locations SET title = ?, address = ?, map_url = ?, is_active = ? WHERE id = ?',
    [title, address, resolvedUrl, is_active ? 1 : 0, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.json({ message: 'Map location updated successfully.' });
    }
  );
});

// Set a map location as active (Admin only)
app.put('/api/map-locations/:id/activate', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if location exists
    const location = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM map_locations WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!location) {
      return res.status(404).json({ error: 'Map location not found.' });
    }

    // Begin transaction to deactivate others and activate this one
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('UPDATE map_locations SET is_active = 0', function(err) {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('UPDATE map_locations SET is_active = 1 WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ message: 'Map location activated successfully.' });
  } catch (err) {
    console.error('Error activating map location:', err);
    db.run('ROLLBACK', () => {});
    res.status(500).json({ error: 'Failed to activate map location: ' + err.message });
  }
});

// Delete a map location (Admin only)
app.delete('/api/map-locations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM map_locations WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({ message: 'Map location deleted successfully.' });
  });
});



// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname)));

// Admin routing fallback (redirect /admin to /admin-dashboard.html)
app.get('/admin', (req, res) => {
  res.redirect('/admin-dashboard.html');
});

// Fallback for all other routes -> serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Asylen Ventures backend server running locally!`);
  console.log(` Dev URL: http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`==================================================`);
});
