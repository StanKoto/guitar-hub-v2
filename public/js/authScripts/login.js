import { emptyErrors, makeRequest } from '../modules/helpers.js';

const form = document.querySelector('form');

const credentialsError = { element: document.querySelector('.credentials.error'), errorType: 'credentials' };

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors([ credentialsError ]);

  const email = form.email.value;
  const password = form.password.value;

  const url = location.pathname;
  const method = 'POST';
  const redirectUrl = '/';
  const body = JSON.stringify({ email, password });
  
  await makeRequest(url, method, redirectUrl, body, [ credentialsError ]);
});