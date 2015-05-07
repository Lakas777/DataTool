module.exports = function(object, keys, options) {
  keys       = (keys instanceof Array) ? keys : [ keys ];
  var remove = (options && options.remove) || false;
  var obj    = {};

  if (!remove) {
    obj = Object.keys(object).reduce(function(memo, key) {
      if (keys.indexOf(key) === -1) { memo[key] = object[key]; }

      return memo;
    }, {});
  }
  else {
    obj = object;
    keys.forEach(function(key) { delete obj[key]; });
  }

  return obj;
};
