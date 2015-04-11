module.exports = function(array, key, prop) {
  return array.map(function(o) { return o[key]; }).indexOf(prop);
};
