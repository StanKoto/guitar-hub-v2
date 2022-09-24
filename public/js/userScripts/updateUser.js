import { emptyErrors, makeRequest } from '../modules/helpers.js';

const detailsForm = document.getElementById('details-form');
const passwordForm = document.getElementById('password-form');

const usernameError = { element: document.querySelector('.username.error'), errorType: 'username' };
const emailError = { element: document.querySelector('.email.error'), errorType: 'email' };
const roleError = { element: document.querySelector('.role.error'), errorType: 'role' };
const matchPasswordError = { element: document.querySelector('.match.password.error'), errorType: 'credentials' };
const validatePasswordError = { element: document.querySelector('.validate.password.error'), errorType: 'password' };

const customDetailsErrors = [ usernameError, emailError, roleError ];
const customPasswordErrors = [ matchPasswordError, validatePasswordError ];

const urlTemplate = location.pathname.split('/');
urlTemplate.pop();

detailsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customDetailsErrors);
  
  const username = detailsForm.username.value;
  const email = detailsForm.email.value;
  
  const url = `${urlTemplate.join('/')}/user-details`;
  const method = 'PUT';
  const redirectUrl = 'user-edit-form';
  let body = {};
  if (username.length !== 0) body.username = username
  if (email.length !== 0) body.email = email
  body.role = detailsForm.role.value;
  body = JSON.stringify(body);
  await makeRequest(url, method, redirectUrl, body, customDetailsErrors);
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customPasswordErrors);

  const adminPassword = passwordForm.adminPassword.value;
  const newPassword = passwordForm.newPassword.value;

  const url = `${urlTemplate.join('/')}/user-password`;
  const method = 'PUT';
  const redirectUrl = location.pathname;
  const body = JSON.stringify({ adminPassword, newPassword });
  const message = 'User password has been successfully updated and should be used for future authorization from now on!';

  await makeRequest(url, method, redirectUrl, body, customPasswordErrors, message);
});