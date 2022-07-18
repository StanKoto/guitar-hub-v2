import { emptyErrors, makeRequest } from '../modules/helpers.js';

const ratingForm = document.querySelector('form');

if (ratingForm) {
  const ratingError = { element: document.querySelector('.rating.error'), errorType: 'rating' };

  ratingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    emptyErrors([ ratingError ]);

    const rating = ratingForm.rating.value;

    const url = `${location.pathname}/tip-ratings`;
    const method = 'POST';
    const redirectUrl = location.pathname;
    const body = JSON.stringify({ rating });

    await makeRequest(url, method, redirectUrl, body, [ ratingError ]);
  })
};