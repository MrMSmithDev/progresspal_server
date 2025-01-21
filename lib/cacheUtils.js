module.exports.createCacheKey = function (prefix, params) {
  if (!prefix) throw new Error("Missing cache key prefix");
  return `${prefix}-${Object.values(params).join("-")}`;
};
