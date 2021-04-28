const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy requesy query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop through removeFields, removing them from reuest query
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string from JSON
  let queryString = JSON.stringify(reqQuery);

  // filter opertators: greater than | gt or equal | less than | lt or equal | in
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Apply query to search, the populate using virtual data
  query = model.find(JSON.parse(queryString));

  // Select Fields (e.g. select=title,overview,cast,director)
  if (req.query.select) {
    // turn query into array at "," then convert each item into individual string
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort Fields (e.g. sort=title)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // sort decending from newest to oldest
    query = query.sort("-release_date");
  }

  // Pagination & Limit parseInt(req, convert from decimal) || default
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit; // start page index
  const endIndex = page * limit; // end page index
  const total = await model.countDocuments(); // count all resources

  query = query.skip(startIndex).limit(limit);

  //   populate
  if (populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;

  // Pagingation results
  const pagination = {};

  if (endIndex < total) {
    // if at end of index set next page
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    // if at end of index set previous page
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (results.length === 0) {
    return next(new ErrorResponse(`No Movies found.`, 404));
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
