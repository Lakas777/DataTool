module.exports = function(object) {
  return Object.keys(object).reduce(function(memo, key) {
    if (key && object[key] !== null && object[key] !== undefined) {
      memo[key] = object[key];
    }

    return memo;
  }, {});
};
