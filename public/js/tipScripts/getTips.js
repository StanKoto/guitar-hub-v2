import { setupSorting, setupSearch, setupPagination } from '../modules/helpers.js';

const form = document.querySelector('form');

setupSorting('title-asc', 'title');
setupSorting('title-desc', '-title');
setupSorting('rating-asc', 'averageRating');
setupSorting('rating-desc', '-averageRating');
setupSorting('updated-asc', 'updatedAt');
setupSorting('updated-desc', '-updatedAt');

setupSearch(form, 'searchText');

setupPagination([ 'prev', 'next' ]);