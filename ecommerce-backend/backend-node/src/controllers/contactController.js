const contactService = require('../services/contactService');

const submitInquiry = async (req, res, next) => {
  try {
    const result = await contactService.sendContactRequest(req.body);
    res.status(201).json({
      success: true,
      message: 'Contact request delivered to concierge team.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
};



