const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'asylen.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
  }
});

// Initialize database schema
db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin user
  const adminUsername = 'admin';
  const adminPassword = 'Admin123!';
  db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (err) {
      console.error('Error querying users table:', err.message);
      return;
    }
    if (!row) {
      const hash = bcrypt.hashSync(adminPassword, 10);
      db.run(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [adminUsername, hash, 'admin'],
        (err2) => {
          if (err2) {
            console.error('Error seeding admin user:', err2.message);
          } else {
            console.log('Seeded default admin user (username: admin, password: Admin123!)');
          }
        }
      );
    }
  });

  // 2. Properties Table
  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Apartment', 'Villa', 'Plot'
      description TEXT,
      price TEXT DEFAULT 'Enquire',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial properties
  db.get('SELECT COUNT(*) as count FROM properties', (err, row) => {
    if (err) {
      console.error('Error querying properties table:', err.message);
      return;
    }
    if (row && row.count === 0) {
      const initialProperties = [
        // Apartments
        {
          title: 'Srinagar Family Apartment',
          category: 'Apartment',
          description: 'Well-planned apartment suited for everyday family living in Kashmir.',
          price: 'Enquire',
          image_url: 'img/villa_exterior_both.png'
        },
        {
          title: 'Dal Lake View Apartment',
          category: 'Apartment',
          description: 'Apartment option close to city conveniences and natural beauty.',
          price: 'Enquire',
          image_url: 'img/menu-7.jpg'
        },
        // Villas
        {
          title: 'The Alabaster Manor',
          category: 'Villa',
          description: 'An exquisite 5-bedroom premium white brick villa finished to visual perfection.',
          price: 'Enquire',
          image_url: 'img/villa_exterior_white.png'
        },
        {
          title: 'The Crimson Estate',
          category: 'Villa',
          description: 'A beautiful 4-bedroom regional red brick luxury villa with traditional contours.',
          price: 'Enquire',
          image_url: 'img/villa_exterior_red.png'
        },
        {
          title: 'The Sage Lounge Villa',
          category: 'Villa',
          description: 'Features custom wainscoted sage-green interiors and premium marble floors.',
          price: 'Enquire',
          image_url: 'img/villa_interior_living.png'
        },
        {
          title: 'The Twin Meadows',
          category: 'Villa',
          description: 'Double estate package containing adjacent white and red brick signature homes.',
          price: 'Enquire',
          image_url: 'img/villa_exterior_both.png'
        },
        {
          title: 'Gulmarg View Villa',
          category: 'Villa',
          description: 'Premium villa-style residence with calm surroundings and scenic views.',
          price: 'Enquire',
          image_url: 'img/menu-2.jpg'
        },
        {
          title: 'Kashmir Valley Villa',
          category: 'Villa',
          description: 'Villa residence shaped for privacy, comfort, and mountain air.',
          price: 'Enquire',
          image_url: 'img/menu-8.jpg'
        },
        // Plots
        {
          title: 'Budgam Garden Home',
          category: 'Plot',
          description: 'Independent home option with garden space and convenient access.',
          price: 'Enquire',
          image_url: 'img/menu-3.jpg'
        },
        {
          title: 'Pahalgam Holiday Residence',
          category: 'Plot',
          description: 'Comfortable holiday residence for seasonal stays and long-term value.',
          price: 'Enquire',
          image_url: 'img/menu-4.jpg'
        },
        {
          title: 'Anantnag Duplex Home',
          category: 'Plot',
          description: 'Spacious duplex layout designed for growing families.',
          price: 'Enquire',
          image_url: 'img/menu-5.jpg'
        },
        {
          title: 'Baramulla Residential Plot',
          category: 'Plot',
          description: 'Residential plot opportunity with practical road connectivity.',
          price: 'Enquire',
          image_url: 'img/menu-6.jpg'
        }
      ];

      const stmt = db.prepare('INSERT INTO properties (title, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)');
      initialProperties.forEach(p => {
        stmt.run(p.title, p.category, p.description, p.price, p.image_url);
      });
      stmt.finalize();
      console.log('Seeded initial real estate properties data.');
    }
  });

  // 3. Bookings Table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      datetime TEXT NOT NULL,
      property_interest TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Messages Table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Unread', -- 'Unread', 'Read', 'Replied'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Property Gallery Table
  db.run(`
    CREATE TABLE IF NOT EXISTS property_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
    )
  `);

  // Seed sample gallery images for key villas
  db.get('SELECT COUNT(*) as count FROM property_gallery', (err, row) => {
    if (row && row.count === 0) {
      db.all("SELECT id, title FROM properties WHERE category = 'Villa'", [], (err2, rows) => {
        if (!err2 && rows && rows.length > 0) {
          const galleryStmt = db.prepare('INSERT INTO property_gallery (property_id, image_url) VALUES (?, ?)');
          rows.forEach(p => {
            if (p.title.includes('Alabaster')) {
              galleryStmt.run(p.id, 'img/villa_exterior_white.png');
              galleryStmt.run(p.id, 'img/villa_interior_panels_close.png');
              galleryStmt.run(p.id, 'img/villa_interior_living.png');
            } else if (p.title.includes('Crimson')) {
              galleryStmt.run(p.id, 'img/villa_exterior_red.png');
              galleryStmt.run(p.id, 'img/villa_exterior_both.png');
            } else if (p.title.includes('Meadows')) {
              galleryStmt.run(p.id, 'img/villa_exterior_both.png');
              galleryStmt.run(p.id, 'img/villa_exterior_white.png');
              galleryStmt.run(p.id, 'img/villa_exterior_red.png');
            }
          });
          galleryStmt.finalize();
          console.log('Seeded sample property gallery images.');
        }
      });
    }
  });

  // 6. Site Settings Table
  db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      section TEXT NOT NULL
    )
  `);

  // 7. Social Links Table
  db.run(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_name TEXT NOT NULL,
      icon_class TEXT NOT NULL,
      url TEXT NOT NULL
    )
  `);

  // Seed default social links if table is empty
  db.get('SELECT COUNT(*) as count FROM social_links', [], (err, row) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare('INSERT INTO social_links (platform_name, icon_class, url) VALUES (?, ?, ?)');
      stmt.run('Instagram', 'fab fa-instagram', 'https://instagram.com');
      stmt.run('Facebook', 'fab fa-facebook-f', 'https://facebook.com');
      stmt.run('YouTube', 'fab fa-youtube', 'https://youtube.com');
      stmt.run('LinkedIn', 'fab fa-linkedin-in', 'https://linkedin.com');
      stmt.finalize();
      console.log('Seeded default social links.');
    }
  });

  // 8. Map Locations Table
  db.run(`
    CREATE TABLE IF NOT EXISTS map_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      map_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 0
    )
  `);

  // Seed default map location if table is empty
  db.get('SELECT COUNT(*) as count FROM map_locations', [], (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(
        'INSERT INTO map_locations (title, address, map_url, is_active) VALUES (?, ?, ?, ?)',
        [
          'Srinagar Head Office',
          'Srinagar, Kashmir',
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd',
          1
        ]
      );
      console.log('Seeded default map location.');
    }
  });

  // Seed default site settings
  const defaultSettings = [
    { key: 'hero_title', value: 'Find Your Home in Kashmir', section: 'Hero' },
    { key: 'hero_subtitle', value: 'Discover thoughtfully selected residential properties across Kashmir, from family apartments to serene villa homes, guided by a local team that understands place, value, and comfort.', section: 'Hero' },
    { key: 'hero_video_url', value: 'video/video_202605202035.mp4', section: 'Hero' },
    { key: 'hero_button_text', value: 'Book A Site Visit', section: 'Hero' },
    { key: 'about_title', value: 'About Us', section: 'About' },
    { key: 'about_heading', value: 'Welcome to Asylen Ventures', section: 'About' },
    { key: 'about_desc1', value: 'Asylen Ventures helps families and investors find residential spaces that feel secure, well located, and suited to life in Kashmir.', section: 'About' },
    { key: 'about_desc2', value: 'Discover thoughtfully selected residential properties across Kashmir, from family apartments to serene villa homes, guided by a local team that understands place, value, and comfort.', section: 'About' },
    { key: 'about_experience_years', value: '15', section: 'About' },
    { key: 'about_homeowners_count', value: '500', section: 'About' },
    { key: 'about_img1', value: 'img/villa_exterior_both.png', section: 'About' },
    { key: 'about_img2', value: 'img/villa_exterior_white.png', section: 'About' },
    { key: 'about_img3', value: 'img/villa_interior_living.png', section: 'About' },
    { key: 'about_img4', value: 'img/villa_exterior_red.png', section: 'About' },
    { key: 'contact_address', value: 'Srinagar, Kashmir', section: 'Contact' },
    { key: 'contact_phone', value: '+91 70000 00000', section: 'Contact' },
    { key: 'contact_email', value: 'hello@asylenventures.com', section: 'Contact' },
    { key: 'contact_hours_weekdays', value: 'Monday - Saturday: 09AM - 09PM', section: 'Contact' },
    { key: 'contact_hours_sunday', value: 'Sunday: 10AM - 08PM', section: 'Contact' },
    { key: 'contact_map_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd', section: 'Contact' },
    { key: 'social_instagram', value: 'https://instagram.com', section: 'Social' },
    { key: 'social_facebook', value: 'https://facebook.com', section: 'Social' },
    { key: 'social_youtube', value: 'https://youtube.com', section: 'Social' },
    { key: 'social_linkedin', value: 'https://linkedin.com', section: 'Social' },
    { key: 'sig_title', value: 'Exclusive Masterpieces', section: 'Signature' },
    { key: 'sig_heading', value: 'Signature Estates In Kashmir', section: 'Signature' },
    { key: 'sig_estate1_title', value: 'The Alabaster Manor', section: 'Signature' },
    { key: 'sig_estate1_tag', value: 'White Villa', section: 'Signature' },
    { key: 'sig_estate1_desc', value: 'A magnificent white brick architectural wonder located in the heart of Kashmir, featuring sweeping cathedral windows, light-filled rooms, and a manicured private lawn.', section: 'Signature' },
    { key: 'sig_estate1_img', value: 'img/villa_exterior_white.png', section: 'Signature' },
    { key: 'sig_estate1_bed', value: '5 Bed', section: 'Signature' },
    { key: 'sig_estate1_bath', value: '6 Bath', section: 'Signature' },
    { key: 'sig_estate1_sqft', value: '4,200 Sqft', section: 'Signature' },
    { key: 'sig_estate2_title', value: 'The Crimson Estate', section: 'Signature' },
    { key: 'sig_estate2_tag', value: 'Red Villa', section: 'Signature' },
    { key: 'sig_estate2_desc', value: 'Crafted with high-end regional red brickwork, this iconic villa combines traditional slopes with luxurious modern interior volumes, nestled under soaring poplars.', section: 'Signature' },
    { key: 'sig_estate2_img', value: 'img/villa_exterior_red.png', section: 'Signature' },
    { key: 'sig_estate2_bed', value: '4 Bed', section: 'Signature' },
    { key: 'sig_estate2_bath', value: '5 Bath', section: 'Signature' },
    { key: 'sig_estate2_sqft', value: '3,850 Sqft', section: 'Signature' },
    { key: 'sig_estate3_title', value: 'The Sage Lounge', section: 'Signature' },
    { key: 'sig_estate3_tag', value: 'Custom Interior', section: 'Signature' },
    { key: 'sig_estate3_desc', value: 'Showcasing bespoke dark sage-green wainscoting wood paneling, highly polished marble flooring with elegant patterns, and hand-selected luxury furnishings.', section: 'Signature' },
    { key: 'sig_estate3_img', value: 'img/villa_interior_living.png', section: 'Signature' },
    { key: 'sig_estate3_bed', value: 'Lounge', section: 'Signature' },
    { key: 'sig_estate3_bath', value: 'Marble', section: 'Signature' },
    { key: 'sig_estate3_sqft', value: 'Handcrafted', section: 'Signature' },
    { key: 'sig_artistry_title', value: 'Uncompromising Artistry', section: 'Signature' },
    { key: 'sig_artistry_desc1', value: 'Our latest residential project represents the absolute pinnacle of estate design in Kashmir. Combining two beautifully contrasting structural models—The Alabaster Manor and The Crimson Estate—our owners enjoy a harmonious community layout under mature alpine tree cover.', section: 'Signature' },
    { key: 'sig_artistry_desc2', value: 'Inside, every wall is finished with handcrafted sage-green wood wainscoting (as detailed in our signature Sage Lounge), highlighting an obsession with quality, local materials, and timeless aesthetic styling.', section: 'Signature' },
    { key: 'sig_artistry_img', value: 'img/villa_exterior_both.png', section: 'Signature' },
    { key: 'sig_artistry_sub_title', value: 'Handcrafted Paneling', section: 'Signature' },
    { key: 'sig_artistry_sub_tag', value: 'Bespoke Wood Joinery', section: 'Signature' },
    { key: 'sig_artistry_sub_img', value: 'img/villa_interior_panels_close.png', section: 'Signature' },
    { key: 'test_title', value: 'Testimonials', section: 'Testimonials' },
    { key: 'test_heading', value: 'What Our Customers Say', section: 'Testimonials' },
    { key: 'test1_name', value: 'Aarif Mir', section: 'Testimonials' },
    { key: 'test1_title', value: 'Srinagar Homeowner', section: 'Testimonials' },
    { key: 'test1_desc', value: '"Finding a home in Srinagar that respects traditional aesthetics while offering modern amenities was challenging. Asylen Ventures guided us to the perfect villa. Their local insights and transparency made the search incredibly smooth and stress-free."', section: 'Testimonials' },
    { key: 'test1_img', value: 'img/customer-aarif.jpg', section: 'Testimonials' },
    { key: 'test2_name', value: 'Zoya Bhat', section: 'Testimonials' },
    { key: 'test2_title', value: 'Gulmarg Resident', section: 'Testimonials' },
    { key: 'test2_desc', value: '"We were looking for a cozy winter retreat in Gulmarg, and Asylen Ventures delivered exactly what we wanted. From the first site visit to the final paperwork, their team was professional, attentive, and handled everything with absolute care."', section: 'Testimonials' },
    { key: 'test2_img', value: 'img/customer-zoya.jpg', section: 'Testimonials' },
    { key: 'test3_name', value: 'Imran Shah', section: 'Testimonials' },
    { key: 'test3_title', value: 'Budgam Estate Owner', section: 'Testimonials' },
    { key: 'test3_desc', value: '"The attention to detail provided by Asylen Ventures is unmatched. They coordinated private walkthroughs, explained every structural detail, and helped us secure a beautiful garden estate in Budgam. Stellar service from start to finish!"', section: 'Testimonials' },
    { key: 'test3_img', value: 'img/customer-imran.jpg', section: 'Testimonials' },
    { key: 'test4_name', value: 'Mehak Rather', section: 'Testimonials' },
    { key: 'test4_title', value: 'Pahalgam Property Owner', section: 'Testimonials' },
    { key: 'test4_desc', value: '"Asylen Ventures understands what a family needs. They made us feel incredibly valued, guiding us to a scenic residential plot in Pahalgam. Their client-first dedication to perfection and coordination is truly outstanding!"', section: 'Testimonials' },
    { key: 'test4_img', value: 'img/customer-mehak.jpg', section: 'Testimonials' }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO site_settings (key, value, section) VALUES (?, ?, ?)');
  defaultSettings.forEach(s => {
    stmt.run(s.key, s.value, s.section);
  });
  stmt.finalize();
  console.log('Seeded default site settings.');
});

module.exports = db;
