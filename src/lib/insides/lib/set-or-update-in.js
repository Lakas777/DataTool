var extend      = require("extend");
var keysFromArg = require("./keys-from-arg");

var isFunction = function(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

module.exports = function(object, key, value, options) {
  options = extend({ extend: true }, options);

  keysFromArg(key).reduce(function(memo, key, index, keys) {
    if (index === keys.length - 1) {
      value = isFunction(value) ? value(memo[key]) : value;

      if (options.extend) {
        memo[key] = extend(true, memo[key], value);
      }
      else {
        memo[key] = value;
      }
    }
    else if (!memo[key]) {
      memo[key] = {};
    }

    return memo[key];
  }, object);

  return object;
};
