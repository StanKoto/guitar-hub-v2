import { emptyErrors, makeRequest } from '../modules/helpers.js';

const form = document.querySelector('form');

const usernameError = { element: document.querySelector('.username.error'), errorType: 'username' };
const emailError = { element: document.querySelector('.email.error'), errorType: 'email' };
const passwordError = { element: document.querySelector('.password.error'), errorType: 'password' };

const customErrors = [ usernameError, emailError, passwordError ];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  emptyErrors(customErrors);
  
  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;
  const role = form.role.value;

  const url = '/user-management/users';
  const method = 'POST';
  const redirectUrl = 'user';
  const body = JSON.stringify({ username, email, password, role });

  await makeRequest(url, method, redirectUrl, body, customErrors);
})