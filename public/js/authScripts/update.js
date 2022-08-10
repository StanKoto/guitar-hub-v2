import { emptyErrors, makeRequest } from '../modules/helpers.js';

const detailsForm = document.getElementById('details-form');
const passwordForm = document.getElementById('password-form');
const matchPasswordErrorElement = document.querySelector('.match.password.error');

const usernameError = { element: document.querySelector('.username.error'), errorType: 'username' };
const emailError = { element: document.querySelector('.email.error'), errorType: 'email' };
let matchPasswordError;
const validatePasswordError = { element: document.querySelector('.validate.password.error'), errorType: 'password' };

const customDetailsErrors = [ usernameError, emailError ];
const customPasswordErrors = [ validatePasswordError ];
if (matchPasswordErrorElement) {
  matchPasswordError = { element: matchPasswordErrorElement, errorType: 'credentials' };
  customPasswordErrors.unshift(matchPasswordError);
}

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

  const url = `${location.pathname}/my-password`;
  let body = {};
  const currentPasswordElement = passwordForm.currentPassword;
  if (currentPasswordElement) body.currentPassword = currentPasswordElement.value;
  body.newPassword = passwordForm.newPassword.value;
  body = JSON.stringify(body);
  const message = currentPasswordElement ? 'You have successfully updated your password and can use it for future authorization from now on!' : 'You have successfully set your password and can use it for local login from now on!';

  await makeRequest(url, method, redirectUrl, body, customPasswordErrors, message);
});