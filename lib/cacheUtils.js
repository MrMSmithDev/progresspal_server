module.exports.createCacheKey = function (prefix, params) {
  return `${prefix}-${Object.values(params).join("-")}`;
};
