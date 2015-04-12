var React       = require("react");
var d3          = require("d3");
var colorbrewer = require("colorbrewer");

var Config      = require("./config");
var getKey      = require("./addons/get-key");
var indexOfProp = require("./addons/index-of-prop");

var Visualization = React.createClass({
  getDefaultProps: function() {
    return {
      width:  640,
      height: 420
    };
  },

  componentDidMount: function() {
    this.renderVisualization();
  },

  componentDidUpdate: function() {
    this.renderVisualization();
  },

  getGeoJson: function(callback) {
    var type  = this.props.geo.type;
    var index = indexOfProp(Config.dataTypes, "key", type);
    var url   = Config.dataTypes[index].url;

    d3.json(url, callback);
  },

  renderVisualization: function() {
    console.log("render viz");

    var svg               = d3.select(React.findDOMNode(this));
    var width             = this.props.width;
    var height            = this.props.height;
    var scale             = Math.min(width, height) * 5;
    var data              = this.props.data;
    var columnGeo         = getKey(this.props, "geo.type");
    var columnGeoIndex    = indexOfProp(Config.dataTypes, "key", columnGeo);
    var columnGeoAccessor = getKey(Config.dataTypes[columnGeoIndex], "accessor");


    var projection = d3.geo.mercator()
      .center([ 20, 51.8 ])
      .scale(scale)
      .translate([ width / 2, height / 2 ]);

    var colorScale = d3.scale.quantize()
      .domain([ 0, 100 ])
      .range(colorbrewer.PuBu[7]);

    svg.selectAll("*").remove();

    if (getKey(this.props, "geo.type")) {
      this.getGeoJson(function(error, geojson) {

        if (!error) {
          svg.selectAll("path")
            .data(geojson)
            .enter()
            .append("path")
            .attr("d", d3.geo.path().projection(projection))
            .attr("stroke", "#ddd")
            .attr("fill", function(d) {
              var key   = getKey(d, columnGeoAccessor);
              var index = indexOfProp(data, "geo", key, { fuzzy: true })[0];
              var color = "#ddd";

              console.log(d, key, index);

              if (index >= 0) { color = colorScale(data[index].value); }

              return color;
            });
        }
      });
    }
  },

  render: function() {
    console.log("render props", this.props, getKey(this.props, "geo.type"));

    return React.DOM.svg({
      className: "visualization",
      width:     this.props.width,
      height:    this.props.height
    });
  }
});

module.exports = Visualization;
