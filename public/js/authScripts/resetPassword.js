import { emptyErrors, makeRequest } from "../modules/helpers.js";

const form = document.querySelector('form');

const passwordError = { element: document.querySelector('.password.error'), errorType: 'password' };
const tokenError = { element: document.querySelector('.token.error'), errorType: 'token' };

const customErrors = [ passwordError, tokenError ];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customErrors);

  const password = form.password.value;

  const url = location.pathname;
  const method = 'PUT';
  const redirectUrl = '/auth/logout';
  const body = JSON.stringify({ password });
  const message = 'Success! You should now be able to log in with your registered email and the password you have just reset!';

  await makeRequest(url, method, redirectUrl, body, customErrors, message);
});