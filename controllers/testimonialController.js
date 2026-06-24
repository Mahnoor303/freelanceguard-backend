const Testimonial = require('../models/Testimonial');

exports.submitTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create({
      userId: req.user._id,
      name: req.user.name,
      role: req.body.role,
      quote: req.body.quote,
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApproved = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' })
      .populate('userId', 'name avatar')
      .sort('-createdAt');
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('userId', 'name email')
      .sort('-createdAt');
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};