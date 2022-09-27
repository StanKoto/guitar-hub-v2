import sgMail from '@sendgrid/mail';
import config from '../envVariables.cjs';

export const sendEmail = async (userEmail, subject, text) => {
  sgMail.setApiKey(config.sendgrid.apiKey);

  const msg = {
    to: userEmail,
    from: config.sendgrid.fromEmail,
    subject,
    text
  };

  await sgMail.send(msg);
};