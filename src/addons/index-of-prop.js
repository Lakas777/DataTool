module.exports = function(array, key, prop, options) {
  var fuzzy = options && options.fuzzy === true;
  var index = -1;

  if (fuzzy) {
    var expression = new RegExp(prop);

    index = array
      .map(function(o, i) {
        console.log("o[key]", o, key, o[key]);

        return {
          match: o[key] ? o[key].match(expression) : null,
          index: i
        };
      })
      .filter(function(match) {
        return match.match !== null;
      })
      .sort(function(a, b) {
        return a.match.index - b.match.index;
      })
      .map(function(match) {
        return match.index;
      });
  }
  else {
    index = array.map(function(o) { return o[key]; }).indexOf(prop);
  }

  return index;
};
