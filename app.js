const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

// File paths for storing hire requests, testimonials, and contacts
const hireRequestsFilePath = path.join(__dirname, 'hireRequests.json');
const testimonialsFilePath = path.join(__dirname, 'testimonials.json');
const businessContactFilePath = path.join(__dirname, 'businessContacts.json');
const companyContactFilePath = path.join(__dirname, 'companyContacts.json');
const mainContactFilePath = path.join(__dirname, 'mainContacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to detect ad blocker
app.use((req, res, next) => {
  const adBlockHeader = req.headers['x-adblock-detected'];
  if (adBlockHeader === 'true') {
    return res.status(403).json({
      error: 'Request blocked by ad blocker. Please disable your ad blocker to continue.',
    });
  }
  next();
});

// Utility functions for reading and writing JSON data to files
const readHireRequests = () => {
  try {
    const data = fs.readFileSync(hireRequestsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeHireRequests = (requests) => {
  fs.writeFileSync(hireRequestsFilePath, JSON.stringify(requests, null, 2));
};

// Additional utility functions (testimonials, business contacts, etc.)
const readTestimonials = () => {
  try {
    const data = fs.readFileSync(testimonialsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeTestimonials = (testimonials) => {
  fs.writeFileSync(testimonialsFilePath, JSON.stringify(testimonials, null, 2));
};

const readBusinessContacts = () => {
  try {
    const data = fs.readFileSync(businessContactFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeBusinessContacts = (contacts) => {
  fs.writeFileSync(businessContactFilePath, JSON.stringify(contacts, null, 2));
};

const readCompanyContacts = () => {
  try {
    const data = fs.readFileSync(companyContactFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeCompanyContacts = (contacts) => {
  fs.writeFileSync(companyContactFilePath, JSON.stringify(contacts, null, 2));
};

const readMainContacts = () => {
  try {
    const data = fs.readFileSync(mainContactFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeMainContacts = (contacts) => {
  fs.writeFileSync(mainContactFilePath, JSON.stringify(contacts, null, 2));
};

// POST endpoint to handle hire requests (updated)
app.post('/api/hire', (req, res) => {
  console.log('Request body:', req.body); // Log the request data for debugging

  const {
    name,
    email,
    serviceType,
    businessType,
    projectDescription,
    budgetNGN,
    budgetUSD,
    services,
  } = req.body;

  // Validate all required fields
  if (!name || !email || !serviceType || !businessType || !projectDescription || (!budgetNGN && !budgetUSD) || !services || services.length === 0) {
    return res.status(400).json({ error: 'All fields are required, including selected services.' });
  }

  const hireRequest = {
    name,
    email,
    serviceType,
    businessType,
    projectDescription,
    budgetNGN,
    budgetUSD,
    services,
    createdAt: new Date().toISOString(),
  };

  const hireRequests = readHireRequests();
  hireRequests.push(hireRequest);
  writeHireRequests(hireRequests);

  // Email configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'itechteamservices@gmail.com',
      pass: 'thgp kcjn zmod iwhm',
    },
  });

  const mailOptions = {
    from: 'itechteamservices@gmail.com',
    to: email,
    subject: `New Hire Request: ${name}`,
    text: `
      You have received a new hire request.

      Name: ${name}
      Email: ${email}
      Services Selected: ${services.join(', ')}
      Service Type: ${serviceType}
      Business Type: ${businessType}
      Project Description: ${projectDescription}
      Budget (NGN): ${budgetNGN || 'Not provided'}
      Budget (USD): ${budgetUSD || 'Not provided'}
      Request received at: ${new Date().toLocaleString()}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.status(201).json({
      message: 'Hire request received successfully',
      hireRequest,
    });
  });
});

// POST endpoint to handle business contact messages
app.post('/api/business', (req, res) => {
  console.log('Request body:', req.body); // Log the request data to debug

  const {
    name,
    email,
    phone,
    businessCategory,
    selectedServices,
    budget,
    description,
  } = req.body;

  // Check all required fields
  if (!name || !email || !phone || !businessCategory || !selectedServices || !budget || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const contactMessage = {
    name,
    email,
    phone,
    businessCategory,
    selectedServices,
    budget,
    description,
    createdAt: new Date().toISOString(),
  };

  const businessContacts = readBusinessContacts();
  businessContacts.push(contactMessage);
  writeBusinessContacts(businessContacts);

  // Optionally, send an email notification to admin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'itechteamservices@gmail.com',
      pass: 'thgp kcjn zmod iwhm',
    },
  });

  const mailOptions = {
    from: 'itechteamservices@gmail.com',
    to: 'itechteamservices@gmail.com',
    subject: `New Business Contact Us Message from ${name}`,
    text: `
      You have received a new contact message from the Business Contact Us form.

      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Business Category: ${businessCategory}
      Selected Services: ${selectedServices.join(', ')}
      Budget: ${budget}
      Description: ${description}
      Contact received at: ${new Date().toLocaleString()}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.status(201).json({
      message: 'Your contact message has been submitted successfully',
      contactMessage,
    });
  });
});

// POST endpoint to handle company contact messages
app.post('/api/company', (req, res) => {
  console.log('Request body:', req.body); // Log the request data to debug

  const {
    name,
    email,
    phone,
    companyCategory,
    selectedServices,
    budget,
    description,
  } = req.body;

  // Check all required fields
  if (!name || !email || !phone || !companyCategory || !selectedServices || !budget || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const contactMessage = {
    name,
    email,
    phone,
    companyCategory,
    selectedServices,
    budget,
    description,
    createdAt: new Date().toISOString(),
  };

  const companyContacts = readCompanyContacts();
  companyContacts.push(contactMessage);
  writeCompanyContacts(companyContacts);

  // Optionally, send an email notification to admin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'itechteamservices@gmail.com',
      pass: 'thgp kcjn zmod iwhm',
    },
  });

  const mailOptions = {
    from: 'itechteamservices@gmail.com',
    to: 'itechteamservices@gmail.com',
    subject: `New Company Contact Us Message from ${name}`,
    text: `
      You have received a new contact message from the Company Contact Us form.

      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Company Category: ${companyCategory}
      Selected Services: ${selectedServices.join(', ')}
      Budget: ${budget}
      Description: ${description}
      Contact received at: ${new Date().toLocaleString()}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.status(201).json({
      message: 'Your contact message has been submitted successfully',
      contactMessage,
    });
  });
});

// POST endpoint to handle company contact messages
app.post('/api/contact', (req, res) => {
  console.log('Request body:', req.body); // Log the request data to debug

  const {
    name,
    email,
    phone,
    description,
  } = req.body;

  // Check all required fields
  if (!name || !email || !phone || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const contactMessage = {
    name,
    email,
    phone,
    description,
    createdAt: new Date().toISOString(),
  };

  const mainContacts = readMainContacts();
  mainContacts.push(contactMessage);
  writeMainContacts(mainContacts);

  // Optionally, send an email notification to admin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'itechteamservices@gmail.com',
      pass: 'thgp kcjn zmod iwhm',
    },
  });

  const mailOptions = {
    from: 'itechteamservices@gmail.com',
    to: 'itechteamservices@gmail.com',
    subject: `New Main Contact Us Message from ${name}`,
    text: `
      You have received a new contact message from the Main Contact Us form.

      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Description: ${description}
      Contact received at: ${new Date().toLocaleString()}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.status(201).json({
      message: 'Your contact message has been submitted successfully',
      contactMessage,
    });
  });
});

// GET endpoint to fetch all testimonials
app.get('/testimonials', (req, res) => {
  const testimonials = readTestimonials();
  res.json(testimonials);
});

// POST endpoint to add a new testimonial
app.post('/testimonials', (req, res) => {
  const { user, content, rating, createdAt } = req.body;

  if (!user || !content || !rating || !createdAt) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const testimonials = readTestimonials();

  const newTestimonial = {
    id: testimonials.length + 1,
    user,
    content,
    rating: parseInt(rating, 10),
    createdAt,
  };

  testimonials.push(newTestimonial);
  writeTestimonials(testimonials);

  res.status(201).json(newTestimonial);
});

// Handle 404 for non-existent routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
