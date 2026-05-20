const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../asylen.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening DB:', err);
    process.exit(1);
  }
  console.log('Database opened successfully.');
});

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

db.serialize(() => {
  const stmt = db.prepare('INSERT OR IGNORE INTO site_settings (key, value, section) VALUES (?, ?, ?)');
  
  defaultSettings.forEach((setting) => {
    stmt.run(setting.key, setting.value, setting.section, (err) => {
      if (err) {
        console.error(`Error inserting key ${setting.key}:`, err);
      } else {
        // We can check if it inserted or did nothing.
      }
    });
  });
  
  stmt.finalize(() => {
    console.log('Successfully completed synchronization of missing settings keys.');
    
    // Log the current list of settings in the DB to confirm
    db.all('SELECT key, value, section FROM site_settings', [], (err, rows) => {
      if (err) {
        console.error('Error fetching settings list:', err);
      } else {
        console.log('All settings in database after sync:');
        rows.forEach(r => console.log(` - ${r.key} (${r.section}): ${r.value}`));
      }
      db.close();
    });
  });
});
