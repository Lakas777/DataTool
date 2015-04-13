var React       = require("react");
var d3          = require("d3");
var topojson    = require("topojson");
var colorbrewer = require("colorbrewer");

var Config      = require("./config");
var getKey      = require("./addons/get-key");
var indexOfProp = require("./addons/index-of-prop");

var Visualization = React.createClass({
  getDefaultProps: function() {
    return {
      width:  640,
      height: 480
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

    console.log("getting geojson", url);

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
    var columnGeoTopojson = getKey(Config.dataTypes[columnGeoIndex], "topojson");

    var projection = d3.geo.mercator()
      .center([ 20, 51.8 ])
      .scale(scale)
      .translate([ width / 2, height / 2 ]);

    var colorScale = d3.scale.quantize()
      .domain([ 0, 100 ]) // TODO domain should be set in toolbox (0-1, 0-100, min-max from data, user input)
      .range(colorbrewer.PuBu[7]); // TODO colors should be set in toolbox

    // svg.selectAll("*").remove();

    var path = d3.geo.path().projection(projection);

    if (getKey(this.props, "geo.type")) {
      this.getGeoJson(function(error, geojson) {
        console.log(geojson);

        if (!error) {
          var geoData = topojson.feature(
            geojson,
            getKey(geojson, columnGeoTopojson)
          ).features;

          var paths = svg.selectAll("path")
            .data(geoData, function(d) {
              return getKey(d, columnGeoAccessor);
            });

          paths
            .enter()
            .append("path")
            .each(function(d) {
              if (getKey(d, columnGeoAccessor) === "powiat Zamość") {
                d.geometry.coordinates = [ d.geometry.coordinates[0] ];
              }
            })
            .attr("d", path)
            .attr("data-name", function(d) {
              return getKey(d, columnGeoAccessor);
            })
            .attr("fill", "white")
            .attr("stroke", "#ddd");

          paths
            .transition()
            .duration(500)
            .attr("fill", function(d) {
              var color = "#ddd";
              var key   = getKey(d, columnGeoAccessor);
              var index = indexOfProp(data, "geo", key, { fuzzy: true })[0];

              if (index >= 0) { color = colorScale(data[index].value); }

              return color;
            });

          paths
            .exit()
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();
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
