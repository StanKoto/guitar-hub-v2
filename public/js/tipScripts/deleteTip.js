import { makeRequest } from '../modules/helpers.js'; 

const deleteButton = document.getElementById('delete-tip');
if (deleteButton) {
  deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const url = location.pathname;
    const method = 'DELETE';
    const redirectUrl = '/tips-overview';
    
    await makeRequest(url, method, redirectUrl);
  });
}