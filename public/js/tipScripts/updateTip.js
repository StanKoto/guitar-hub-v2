import { emptyErrors, makeRequest } from '../modules/helpers.js';

const contentForm = document.getElementById('contents-form');
const imageForm = document.getElementById('image-form');

const titleError = { element: document.querySelector('.title.error'), errorType: 'title' };
const contentsError = { element: document.querySelector('.contents.error'), errorType: 'contents' };
const categoryError = { element: document.querySelector('.category.error'), errorType: 'category' };
const imageError = { element: document.querySelector('.image.error'), errorType: 'images' };

const customContentErrors = [ titleError, contentsError, categoryError ];

const urlTemplate = location.pathname.split('/');
urlTemplate.pop();
const imgRedirectUrl = location.pathname;

contentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors(customContentErrors);

  const category = contentForm.category.value;

  const url = urlTemplate.join('/');
  const method = 'PUT';
  const redirectUrl = 'tip-edit-form';
  let body = {};
  body.title = contentForm.tipTitle.value;
  body.contents = contentForm.contents.value;
  if (category.length !== 0) body.category = category;
  
  body = JSON.stringify(body);

  await makeRequest(url, method, redirectUrl, body, customContentErrors);
});

imageForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  emptyErrors([ imageError ]);

  const formData = new FormData();
  const images = document.getElementById('images');
  for (const image of images.files) {
    formData.append('images', image);
  }

  const url = `${urlTemplate.join('/')}/images`;
  const method = 'POST';

  await makeRequest(url, method, imgRedirectUrl, formData, [ imageError ]);
});

for (const item of document.querySelectorAll('.delete.image')) {
  item.addEventListener('click', async (e) => {
    e.preventDefault();

    const url = `${urlTemplate.join('/')}/images/${item.id}`;
    const method = 'DELETE';

    await makeRequest(url, method, imgRedirectUrl);
  });
};