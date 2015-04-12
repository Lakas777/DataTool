var extend        = require("extend");
var React         = require("react");
var OnResize      = require("react-window-mixins").OnResize;

var Config        = require("./config");

var CreateClass   = require("./addons/create-class");
var getKey        = require("./addons/get-key");
var indexOfProp   = require("./addons/index-of-prop");

var Visualization = React.createFactory(require("./visualization"));

var stringToNumber = function(string) {
  string = string || "";
  return Number(string.replace(",", "."));
};

/*
 * ASSUMPTIONS
 *  - single layer, should support multiple layers
 *  - only avaraging data (sum / count), should add max/min/sum/avg to choose from toolbox
 */

var VisualizationGenerator = React.createClass({
  mixins: [ OnResize ],

  getFile: function() {
    return getKey(this.props.files.filter(function(file) {
      return file.id === this.props.layers[0].fileId;
    }.bind(this)), 0);
  },

  getData: function() {
    var data = this.getFile().data;
    var columnGeo = this.props.layers[0].geo.column;
    var columnVis = this.props.layers[0].vis.column;

    console.log("columnGeo, columnVis", columnGeo, columnVis);

    data = data
      .reduce(function(memo, d) {
        var index = indexOfProp(memo, "geo", d[columnGeo]);
        var value = stringToNumber(d[columnVis]);

        if (index >= 0) {
          memo[index].value += value;
          memo[index].count += 1;
        }
        else {
          memo.push({
            value: value,
            count: 1,
            geo:   d[columnGeo]
          });
        }

        return memo;
      }, [])
      .map(function(d) {
        return {
          value: d.value / d.count,
          geo:   d.geo
        };
      });

    return data;
  },

  render: function() {
    var height = 0;
    var width  = this.state.window.width / 2;
    var data   = [];
    var geo    = getKey(this.props.layers, [ 0, "geo" ]);

    if (this.state.window.height > 0) {
      height = this.state.window.height / 2 - 30;
    }

    if (this.props.files && this.props.layers) {
      data = this.getData();
    }

    console.log("data", data);

    return React.DOM.div(
      { className: "visualization-generator" },
      Visualization({
        data:   data,
        geo:    geo,
        width:  width,
        height: height
      })
    );
  }
});

module.exports = VisualizationGenerator;
