import { emptyErrors, makeRequest } from '../modules/helpers.js';

const detailsForm = document.getElementById('details-form');
const passwordForm = document.getElementById('password-form');

const usernameError = { element: document.querySelector('.username.error'), errorType: 'username' };
const emailError = { element: document.querySelector('.email.error'), errorType: 'email' };
const matchPasswordError = { element: document.querySelector('.match.password.error'), errorType: 'credentials' };
const validatePasswordError = { element: document.querySelector('.validate.password.error'), errorType: 'password' };

const customDetailsErrors = [ usernameError, emailError ];
const customPasswordErrors = [ matchPasswordError, validatePasswordError ];

const method = 'PUT';
const redirectUrl = location.pathname;

detailsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customDetailsErrors);
  
  const username = detailsForm.username.value;
  const email = detailsForm.email.value;

  const url = `${location.pathname}/my-details`;
  let body = {};
  if (username.length !== 0) body.username = username
  if (email.length !== 0) body.email = email
  body = JSON.stringify(body);

  await makeRequest(url, method, redirectUrl, body, customDetailsErrors);
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customPasswordErrors);

  const currentPassword = passwordForm.currentPassword.value;
  const newPassword = passwordForm.newPassword.value;

  const url = `${location.pathname}/my-password`;
  const body = JSON.stringify({ currentPassword, newPassword });
  const message = 'You have successfully updated your password and should use it for future authorization from now on!';

  await makeRequest(url, method, redirectUrl, body, customPasswordErrors, message);
});