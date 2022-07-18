import { emptyErrors, makeRequest } from '../modules/helpers.js';

const form = document.querySelector('form');

const emailError = { element: document.querySelector('.email.error'), errorType: 'email' };

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  emptyErrors([ emailError ]);

  const email = form.email.value;

  const url = location.pathname;
  const method = 'POST';
  const redirectUrl = location.pathname;
  const body = JSON.stringify({ email });
  const message = 'We have sent an email with further instructions to the address you provided. Please check for it in your mailbox or try again should you not receive it shortly.';

  await makeRequest(url, method, redirectUrl, body, [ emailError ], message);
});