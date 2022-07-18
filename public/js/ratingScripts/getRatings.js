import { setupSorting, setupPagination } from '../modules/helpers.js';

setupSorting('rating-asc', 'rating');
setupSorting('rating-desc', '-rating');
setupSorting('created-asc', 'createdAt');
setupSorting('created-desc', '-createdAt');

setupPagination([ 'prev', 'next' ]);