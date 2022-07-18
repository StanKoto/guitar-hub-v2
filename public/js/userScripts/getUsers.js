import { setupSorting, setupSearch, setupPagination } from '../modules/helpers.js';

const form = document.querySelector('form');

setupSorting('username-asc', 'username');
setupSorting('username-desc', '-username');
setupSorting('tip-count-asc', 'tipCount');
setupSorting('tip-count-desc', '-tipCount');
setupSorting('status-asc', 'status');
setupSorting('status-desc', '-status');
setupSorting('role-asc', 'role');
setupSorting('role-desc', '-role');
setupSorting('created-asc', 'createdAt');
setupSorting('created-desc', '-createdAt');

setupSearch(form, 'searchText');

setupPagination([ 'prev', 'next' ]);
