const sgMail = require('@sendgrid/mail');

exports.sendEmail = async (userEmail, subject, text) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text
  };

  await sgMail.send(msg);
};