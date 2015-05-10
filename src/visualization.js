/*jslint unparam: true */

var React                = require("react");
var d3                   = require("d3");
var topojson             = require("topojson");
var colorbrewer          = require("colorbrewer");
var classNames           = require("classnames");

var Config               = require("./config");
var CreateClass          = require("./addons/create-class");

var Reflux               = require("reflux");
var DocumentStore        = require("./store").DocumentStore;
var DocumentStoreActions = require("./store").DocumentStoreActions;

var getIn                = require("insides").getIn;
var indexOfProp          = require("./addons/index-of-prop");

var stringToNumber = function(string) {
  string = string || "";
  return Number(string.replace(",", "."));
};

var LayerChooser = CreateClass({
  getInitialState: function() {
    return { selectedIndex: 0 };
  },

  onClickLayer: function(index) {
    this.setState({ selectedIndex: index });
    this.props.onClickLayer(index);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.layers.length !== nextProps.layers.length) {
      this.onClickLayer(0);
    }
  },

  renderLayer: function(layer, index) {
    var selectedIndex = this.state.selectedIndex;

    return React.DOM.button(
      {
        key:       index,
        className: classNames("layer btn", {
          "btn-default": index !== selectedIndex,
          "btn-primary": index === selectedIndex
        }),
        onClick:   this.onClickLayer.bind(null, index)
      },
      layer.name
    );
  },

  render: function() {
    return React.DOM.div(
      { className: "layer-chooser btn-group" },
      this.props.layers.length > 1 ? this.props.layers.map(this.renderLayer) : null
    );
  }
});

var Visualization = CreateClass({
  getDefaultProps: function() {
    return { width: 640, height: 480 };
  },

  componentDidMount: function() {
    this.renderVisualization();
  },

  componentWillUpdate: function(nextProps) {
    // dirty workaround for resizing browser window
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      d3.select(React.findDOMNode(this)).selectAll("*").remove();
    }
  },

  componentDidUpdate: function() {
    this.renderVisualization();
  },

  getDomain: function(data) {
    var rangeType = this.props.layer.vis.rangeType;

    var calculateDomain = {
      normalized: function()  { return [ 0, 1 ]; },
      percentage: function()  { return [ 0, 100 ]; },
      minmax:     function(d) {
        return [
          d3.min(d, function(d) { return d.value; }),
          d3.max(d, function(d) { return d.value; })
        ];
      }
    };

    return calculateDomain[rangeType](data);
  },

  getColors: function() {
    var colorNum        = this.props.layer.vis.colorNum;
    var colorPalette    = this.props.layer.vis.colorPalette;

    return colorbrewer[colorPalette][colorNum];
  },

  getFile: function() {
    return this.props.files.filter(function(file) {
      return file.id === this.props.layer.fileId;
    }.bind(this))[0];
  },

  getData: function() {
    var data        = this.getFile().data;
    var columnGeo   = this.props.layer.geo.column;
    var columnVis   = this.props.layer.vis.column;
    var mappingType = this.props.layer.vis.mappingType;

    var calculate = {
      avg: function(d) { return d.sum / d.count; },
      max: function(d) { return d.max; },
      min: function(d) { return d.min; },
      sum: function(d) { return d.sum; }
    };

    data = data
      .reduce(function(memo, d) {
        var index = indexOfProp(memo, "geo", d[columnGeo]);
        var value = stringToNumber(d[columnVis]);

        // TODO: switch to updateIn
        if (index >= 0) {
          memo[index].sum   += value;
          memo[index].min    = Math.min(memo[index].min, value);
          memo[index].max    = Math.max(memo[index].max, value);
          memo[index].count += 1;
        }
        else {
         memo.push({
            sum:   value,
            min:   value,
            max:   value,
            count: 1,
            geo:   d[columnGeo]
          });
        }

        return memo;
      }, [])
      .map(function(d) {
        return {
          value: calculate[mappingType](d),
          geo:   d.geo
        };
      });

    return data;
  },

  getGeoJson: function(callback) {
    var type  = this.props.layer.geo.type;
    var index = indexOfProp(Config.dataTypes, "key", type);
    var url   = getIn(Config.dataTypes, [ index, "url" ]);

    if (url) {
      d3.json(Config.domainURL + "/" + url, callback);
    }
    else {
      callback(new Error("no url"));
    }
  },

  renderMap: function(svg) {
    var width           = this.props.width;
    var height          = this.props.height;
    var scale           = Math.min(width, height) * 4.5;

    var colors          = this.getColors();
    var data            = this.getData();
    var domain          = this.getDomain(data);

    var dataType        = getIn(Config.dataTypes, indexOfProp(Config.dataTypes, "key", this.props.layer.geo.type));
    var geoAccessor     = getIn(dataType, "accessor");
    var geoCodeAccessor = getIn(dataType, "codeAccessor");
    var geoTopojson     = getIn(dataType, "topojson");

    var updateTriangle  = this.updateTriangle;

    if (svg.select(".legend").empty()) {
      svg.append("g").attr("class", "map");
    }

    var map = svg.select(".map");

    var projection = d3.geo.mercator()
      .center([ 20, 51.8 ])
      .scale(scale)
      .translate([ width / 2, height / 2 ]);

    var colorScale = d3.scale.quantize()
      .domain(domain)
      .range(colors);

    var path = d3.geo.path()
      .projection(projection);

    this.getGeoJson(function(error, geojson) {
      if (!error) {
        var geoData = topojson.feature(
          geojson,
          getIn(geojson, geoTopojson)
        ).features;

        var paths = map.selectAll("path")
          .data(geoData, function(d) {
            return getIn(d, geoCodeAccessor);
          })
          .each(function(d) {
            var key   = getIn(d, geoAccessor);
            var index = indexOfProp(data, "geo", key, { fuzzy: true })[0];

            d.value = getIn(data, [ index, "value" ]);
          });

        paths
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 1)
          .attr("fill", "#eee")
          .attr("stroke", "#ddd");

        paths
          .transition()
          .duration(Config.visualization.animationDuration)
          .attr("fill-opacity", 1)
          .attr("fill", function(d) {
            return d.value ? colorScale(d.value) : "#eee";
          });

        paths
          .exit()
          .transition()
          .duration(Config.visualization.animationDuration)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .remove();

        paths
          .on("mouseover", function(d) { updateTriangle(svg, d.value); })
          .on("mouseout",  function()  { updateTriangle(svg); });
      }
    });
  },

  renderLegend: function(svg) {
    var width        = this.props.width;
    var height       = this.props.height;
    var size         = Config.visualization.legendRectSize;
    var margin       = Config.visualization.legendMargin;

    var colorNum     = this.props.layer.vis.colorNum;
    var colorPalette = this.props.layer.vis.colorPalette;
    var colors       = colorbrewer[colorPalette][colorNum];

    var calculateTranslate = function() {
      var x = width - size - margin.right;
      var y = height - size * colors.length - margin.bottom;

      return "translate(" + x + "," + y + ")";
    };

    if (svg.select(".legend").empty()) {
      svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", calculateTranslate);
    }

    var legend = svg.select(".legend");
    var rects  = legend.selectAll("rect").data(colors);

    legend
      .transition()
      .duration(Config.visualization.animationDuration)
      .attr("transform", calculateTranslate);

    rects
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(_, i) { return size * (colors.length - 1 - i); })
      .attr("width", size)
      .attr("height", size)
      .attr("fill", function(d) { return d; });

    rects
      .transition()
      .duration(Config.visualization.animationDuration)
      .attr("y", function(_, i) { return size * (colors.length - 1 - i); })
      .attr("fill", function(d) { return d; });

    rects
      .exit()
      .transition()
      .duration(Config.visualization.animationDuration)
      .attr("fill-opacity", 0)
      .remove();
  },

  renderTriangle: function(svg) {
    if (svg.select(".triangle").empty()) {
      var group = svg.append("g")
        .attr("class", "triangle")
        .attr("fill-opacity", 0);

      group
        .append("path")
        .attr("fill", "#333")
        .attr("d", "M0,4l4,-4l-4,-4z");

      group
        .append("text")
        .attr("y", 4)
        .attr("x", -4)
        .text("");
    }
  },

  updateTriangle: function(svg, value) {
    var triangle = svg.select(".triangle");

    if (value) {
      var text      = triangle.select("text");
      var rangeType = this.props.layer.vis.rangeType;

      var data      = this.getData();
      var domain    = this.getDomain(data);
      var colors    = this.getColors();

      var width     = this.props.width;
      var height    = this.props.height;
      var size      = Config.visualization.legendRectSize;
      var margin    = Config.visualization.legendMargin;

      var scale = d3.scale.linear()
        .domain(domain)
        .range([ colors.length * size, 0 ]);

      var calculateTranslate = function(value) {
        var x = width - size - margin.right - 8;
        var y = height - size * colors.length - margin.bottom + value;

        return "translate(" + x + "," + y + ")";
      };

      triangle
        .attr("transform", function() {
          return d3.select(this).attr("transform") || calculateTranslate(scale(value));
        })
        .transition()
        .duration(Config.visualization.animationDuration)
        .attr("fill-opacity", 1)
        .attr("transform", calculateTranslate.bind(null, scale(value)));

      text.text(function() {
        var num    = parseFloat(value).toFixed(2);
        var suffix = rangeType === "percentage" ? "%" : "";

        return num + suffix;
      });
    }
    else {
      triangle
        .transition()
        .duration(Config.visualization.animationDuration)
        .attr("fill-opacity", 0);
    }
  },

  renderVisualization: function() {
    var canRenderVisualization = [
      [ "layer", "geo", "column"       ],
      [ "layer", "geo", "type"         ],
      [ "layer", "vis", "column"       ],
      [ "layer", "vis", "mappingType"  ],
      [ "layer", "vis", "rangeType"    ],
      [ "layer", "vis", "colorNum"     ],
      [ "layer", "vis", "colorPalette" ]
    ].every(function(keys) {
      return getIn(this.props, keys, null) !== null;
    }.bind(this));

    if (canRenderVisualization) {
      var svg = d3.select(React.findDOMNode(this));

      this.renderMap(svg);
      this.renderLegend(svg);
      this.renderTriangle(svg);
    }
  },

  render: function() {
    return React.DOM.svg({
      className: "visualization",
      width:     this.props.width,
      height:    this.props.height
    });
  }
});

var VisualizationWrapper = React.createClass({
  mixins: [
    Reflux.connectFilter(DocumentStore, "files", function(data) {
      return getIn(data, "files", []);
    }),

    Reflux.connectFilter(DocumentStore, "layers", function(data) {
      return getIn(data, "layers", []);
    })
  ],

  getInitialState: function() {
    return { layerIndex: 0 };
  },

  componentDidMount: function() {
    DocumentStoreActions.load({ id: this.props.documentId });
  },

  onClickLayer: function(layerIndex) {
    this.setState({ layerIndex: layerIndex });
  },

  render: function() {
    var layer  = getIn(this.state.layers, this.state.layerIndex);

    return React.DOM.div(
      { className: "visualization-wrapper" },
      Visualization({
        width:  this.props.width,
        height: this.props.height,
        files:  this.state.files,
        layer:  layer
      }),
      LayerChooser({
        layers:       this.state.layers,
        onClickLayer: this.onClickLayer
      })
    );
  }
});

module.exports = VisualizationWrapper;
