import { emptyErrors, makeRequest } from '../modules/helpers.js';

const ratingForm = document.querySelector('form');

if (ratingForm) {
  const ratingError = { element: document.querySelector('.rating.error'), errorType: 'rating' };

  ratingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    emptyErrors([ ratingError ]);

    let body = {};
    const rating = ratingForm.rating.value;
    if (rating.length !== 0) body.rating = rating

    const url = `${location.pathname}/tip-ratings`;
    const method = 'POST';
    const redirectUrl = location.pathname;
    body = JSON.stringify(body);

    await makeRequest(url, method, redirectUrl, body, [ ratingError ]);
  })
};