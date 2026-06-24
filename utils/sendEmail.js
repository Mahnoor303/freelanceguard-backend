module.exports = async (options) => {
  // For development, just log the email instead of sending
  console.log('========= MOCK EMAIL =========');
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.html || options.text}`);
  console.log('==============================');
  // No real send, so no error
};