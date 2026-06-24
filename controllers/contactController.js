const Contact = require('../models/Contact');
exports.submit = async (req, res) => {
  try {
    await Contact.create(req.body);
    res.status(201).json({ message: 'Thank you! We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};