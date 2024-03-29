import { emptyErrors, makeRequest } from '../modules/helpers.js';

const form = document.querySelector('form');

const titleError = { element: document.querySelector('.title.error'), errorType: 'title' };
const contentsError = { element: document.querySelector('.contents.error'), errorType: 'contents' };
const categoryError = { element: document.querySelector('.category.error'), errorType: 'category' };
const imageError = { element: document.querySelector('.image.error'), errorType: 'images' };

const customErrors = [ titleError, contentsError, categoryError, imageError ];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customErrors);

  const title = form.tipTitle.value;
  const contents = form.contents.value;
  const category = form.category.value;
  const images = document.getElementById('images');

  const formData = new FormData();
  if (title.length !== 0) formData.append('title', title);
  if (contents.length !== 0) formData.append('contents', contents);
  if (category.length !== 0) formData.append('category', category);
  for (const image of images.files) {
    formData.append('images', image);
  }

  const url = '/tips-overview/tips';
  const method = 'POST';
  const redirectUrl = 'tip';

  await makeRequest(url, method, redirectUrl, formData, customErrors);
});