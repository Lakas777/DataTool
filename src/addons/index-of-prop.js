module.exports = function(array, key, prop, options) {
  var fuzzy = options && options.fuzzy === true;
  var index = -1;

  var expressionPropMap = {};
  var expressionKeyMap  = {};

  var createRegExp = function(previous, string) {
    var regexp;

    if (previous[string]) {
      regexp = previous[string];
    }
    else {
      regexp = new RegExp(string, "i");
      previous[string] = regexp;
    }

    return regexp;
  };

  if (fuzzy) {
    index = array
      .map(function(o, i) {
        var expressionProp = createRegExp(expressionPropMap, prop);
        var expressionKey  = createRegExp(expressionKeyMap, o[key]);

        return {
          match: o[key] ? (o[key].match(expressionProp) || prop.match(expressionKey)) : null,
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
