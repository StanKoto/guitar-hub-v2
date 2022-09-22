import { Sequelize, Op } from "sequelize";

export const searchResults = (model, associatedModels, attributesToExclude) => async (req, res, next) => {
  let results,
      queryOptions = {};
  const query = { ...req.query };
  const excludedFields = [ 'select', 'sort', 'textSearch', 'page', 'limit' ];
  for (const param of excludedFields) {
    delete query[param];
  }
  const searchOperators = [ 'gt', 'gte', 'lt', 'lte', 'in' ];
  for (const param in query) {
    let paramWithOperator = query[param];
    if (typeof paramWithOperator === 'object') {
      for (const key in paramWithOperator) {
        if (searchOperators.includes(key)) {
          const searchValue = key === 'in' ? paramWithOperator[key].split(',') : paramWithOperator[key]
          Object.assign(paramWithOperator, { [ Op[key] ]: searchValue });
          delete paramWithOperator[key];
        }
      }
    }
  }
  if (req.baseUrl.includes('tip-ratings')) query.tipId = req.params.id
  if (req.path.includes('given-ratings')) query.reviewerId = req.params.id
  if (req.path.includes('received-ratings')) query.recipientId = req.params.id
  if (Object.keys(query).length !== 0) queryOptions.where = query;
  if (req.query.textSearch) {
    if (!queryOptions.where) queryOptions.where = {};
    const searchedText = req.query.textSearch.split(' ').join(' & ');
    const firstSearchField = model.name === 'User' ? 'username' : 'title';
    const secondSearchField = model.name === 'User' ? 'email' : 'contents';
    Object.assign(queryOptions.where, { 
      [ Op.or ]: [
        { [ firstSearchField ]: { [ Op.match ]: Sequelize.fn('to_tsquery', `${searchedText}`) } },
        { [ secondSearchField ]: { [ Op.match ]: Sequelize.fn('to_tsquery', `${searchedText}`) } }
      ]
    })
  }
  const forbiddenFields = [ 'password', 'passwordSet', 'resetPasswordToken', 'resetPasswordExpire' ];
  if (req.query.select) queryOptions.attributes = req.query.select.split(',').filter(attr => !forbiddenFields.includes(attr))
  if (attributesToExclude && !req.query.select) queryOptions.attributes = { exclude: attributesToExclude }
  if (associatedModels) queryOptions.include = associatedModels
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
  Object.assign(queryOptions, { offset: startIndex, limit });
  results = await model.findAndCountAll(queryOptions);
  const pagination = {};
  const total = results.count;
  if (startIndex > 0) pagination.prev = page - 1
  if (endIndex < total) pagination.next = page + 1

  res.searchResults = { results: results.rows, pagination };
  next();
};