const SiteContent = require('../models/SiteContent');

const getPublic = async (req, res) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      content = await SiteContent.create({});
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      content = new SiteContent();
    }
    Object.assign(content, req.body);
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublic, update };