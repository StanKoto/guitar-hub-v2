export const searchResults = (model, associatedModels) => async (req, res, next) => {
  let results,
      queryOptions = {};
  const query = { ...req.query };
  const excludedFields = [ 'select', 'sort', 'textSearch', 'page', 'limit' ];
  for (const param of excludedFields) {
    delete query[param];
  }
  let queryString = JSON.stringify(query).replace(/\bgt|gte|lt|lte|in\b/g, match => `[Op.${match}]`);
  const adjustedQuery = JSON.parse(queryString);
  if (req.baseUrl.includes('tip-ratings')) adjustedQuery.tipId = req.params.id
  if (req.path.includes('given-ratings')) adjustedQuery.reviewerId = req.params.id
  if (req.path.includes('received-ratings')) adjustedQuery.recipientId = req.params.id
  // if (req.query.textSearch) adjustedQuery['$text'] = { $search: req.query.textSearch.split(',').join(' ') }
  // results = req.query.textSearch ? model.find(adjustedQuery, { score: { $meta: 'textScore' } }) : model.find(adjustedQuery)
  if (Object.keys(adjustedQuery).length !== 0) queryOptions.where = adjustedQuery;
  if (req.query.select) queryOptions.attributes = req.query.select.split(',')
  if (associatedModels) queryOptions.include = associatedModels
  // if (req.query.textSearch) results = results.sort({ score: { $meta: 'textScore' } })
  if (req.query.sort) {
    queryOptions.order = [];
    let sortingParams = req.query.sort.split(',');
    for (const param of sortingParams) {
      if (param.startsWith('-')) {
        queryOptions.order.push([ param.substring(1), 'DESC', 'NULLS LAST' ]);
      } else {
        queryOptions.order.push([ param, 'ASC', 'NULLS LAST' ]);
      }
    }
  } else {
    queryOptions.order = [[ 'createdAt', 'DESC', 'NULLS LAST' ]];
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  // const total = await model.countDocuments();
  Object.assign(queryOptions, { offset: startIndex, limit });
  results = await model.findAndCountAll(queryOptions);
  const pagination = {};
  const total = results.count;
  if (startIndex > 0) pagination.prev = page - 1
  if (endIndex < total) pagination.next = page + 1

  res.searchResults = { results: results.rows, pagination };
  next();
};