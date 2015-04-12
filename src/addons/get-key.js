module.exports = function(object, key) {
  var keys;

  if (key instanceof Array)       { keys = key; }
  else if (!isNaN(key))           { keys = [ key ]; }
  else if (key.indexOf(".") >= 0) { keys = key.split("."); }
  else                            { keys = [ key ]; }

  return keys.reduce(function(memo, key) {
    return memo && memo[key] ? memo[key] : undefined;
  }, object);
};
