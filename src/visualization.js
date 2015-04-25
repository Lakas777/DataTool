/*jslint unparam: true */

var React                = require("react");
var OnResize             = require("react-window-mixins").OnResize;
var d3                   = require("d3");
var topojson             = require("topojson");
var colorbrewer          = require("colorbrewer");
var classNames           = require("classnames");

var Config               = require("./config");
var CreateClass          = require("./addons/create-class");

var Reflux               = require("reflux");
var DocumentStore        = require("./store").DocumentStore;
var DocumentStoreActions = require("./store").DocumentStoreActions;

var getIn                = require("./addons/get-in");
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
      this.props.layers.map(this.renderLayer)
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

  componentDidUpdate: function(nextProps) {
    this.renderVisualization();
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
        var calculate = {
          avg: function(d) { return d.sum / d.count; },
          max: function(d) { return d.max; },
          min: function(d) { return d.min; },
          sum: function(d) { return d.sum; }
        };

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
      d3.json(url, callback);
    }
    else {
      callback(new Error("no url"));
    }
  },

  renderMap: function(svg) {
    var width                 = this.props.width;
    var height                = this.props.height;
    var scale                 = Math.min(width, height) * 5;
    var data                  = this.getData();
    var columnGeo             = this.props.layer.geo.type;
    var columnGeoIndex        = indexOfProp(Config.dataTypes, "key", columnGeo);
    var columnGeoAccessor     = getIn(Config.dataTypes, [ columnGeoIndex, "accessor" ]);
    var columnGeoCodeAccessor = getIn(Config.dataTypes, [ columnGeoIndex, "codeAccessor" ]);
    var columnGeoTopojson     = getIn(Config.dataTypes, [ columnGeoIndex, "topojson" ]);
    var columnVisRangeType    = this.props.layer.vis.rangeType;
    var updateTriangle        = this.updateTriangle;

    if (svg.select(".legend").empty()) {
      svg.append("g").attr("class", "map");
    }

    var map = svg.select(".map");

    var projection = d3.geo.mercator()
      .center([ 20, 51.8 ])
      .scale(scale)
      .translate([ width / 2, height / 2 ]);

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

    var domain = calculateDomain[columnVisRangeType](data);
    var colors = colorbrewer.PuBu[7]; // TODO colors should be set in toolbox

    var colorScale = d3.scale.quantize()
      .domain(domain)
      .range(colors);

    var path = d3.geo.path()
      .projection(projection);

    this.getGeoJson(function(error, geojson) {
      if (!error) {
        var geoData = topojson.feature(
          geojson,
          getIn(geojson, columnGeoTopojson)
        ).features;

        var paths = map.selectAll("path")
          .data(geoData, function(d) {
            return getIn(d, columnGeoCodeAccessor);
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
          .duration(500)
          .attr("fill-opacity", 1)
          .attr("fill", function(d) {
            var color = "#eee";
            var key   = getIn(d, columnGeoAccessor);
            var index = indexOfProp(data, "geo", key, { fuzzy: true })[0];

            if (index >= 0) { color = colorScale(data[index].value); }

            return color;
          });

        paths
          .exit()
          .transition()
          .duration(500)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .remove();


        paths
          .on("mouseover", function(d) {
            var key   = getIn(d, columnGeoAccessor);
            var index = indexOfProp(data, "geo", key, { fuzzy: true })[0];
            var value  = data[index].value;

            updateTriangle(svg, domain, colors, value);
          })
          .on("mouseout", function() {
            updateTriangle(svg);
          });
      }
    });
  },

  renderLegend: function(svg) {
    var width  = this.props.width;
    var height = this.props.height;
    var size   = 20;
    var margin = { bottom: 50, right: 30 };
    var colors = colorbrewer.PuBu[7]; // TODO: read this from layer info

    if (svg.select(".legend").empty()) {
      svg.append("g")
        .attr("class", "legend")
        .attr("transform", function() {
          var x = width - size - margin.right;
          var y = height - size * colors.length - margin.bottom;

          return "translate(" + x + "," + y + ")";
        });
    }

    var legend = svg.select(".legend");

    var rects = legend.selectAll("rect")
      .data(colors);

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
      .duration(500)
      .attr("y", function(_, i) { return size * (colors.length - 1 - i); })
      .attr("fill", function(d) { return d; });

    rects
      .exit()
      .transition()
      .duration(500)
      .attr("fill-opacity", 0)
      .remove();
  },

  renderLegendPointer: function(svg) {
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

  updateTriangle: function(svg, domain, colors, value) {
    var triangle = svg.select(".triangle");
    var text     = triangle.select("text");

    if (value) {
      var width    = this.props.width;
      var height   = this.props.height;
      var size     = 20;
      var margin   = { bottom: 50, right: 30 };

      var scale = d3.scale.linear()
        .domain(domain)
        .range([ colors.length * size, 0 ]);

      triangle
        .attr("transform", function() {
          var currentTransform = d3.select(this).attr("transform");

          if (!currentTransform) {
            var x = width - size - margin.right - 8;
            var y = height - size * colors.length - margin.bottom + scale(value);

            currentTransform = "translate(" + x + "," + y + ")";
          }

          return currentTransform;
        })
        .transition()
        .duration(500)
        .attr("fill-opacity", 1)
        .attr("transform", function() {
          var x = width - size - margin.right - 8;
          var y = height - size * colors.length - margin.bottom + scale(value);

          return "translate(" + x + "," + y + ")";
        });

      text.text(parseFloat(value).toFixed(2));
    }
    else {
      triangle
        .transition()
        .duration(500)
        .attr("fill-opacity", 0);
    }
  },

  renderVisualization: function() {
    var canRenderVisualization = [
      [ "layer", "geo", "column"      ],
      [ "layer", "geo", "type"        ],
      [ "layer", "vis", "column"      ],
      [ "layer", "vis", "mappingType" ],
      [ "layer", "vis", "rangeType"   ]
    ].every(function(keys) {
      return getIn(this.props, keys, false) !== false;
    }.bind(this));

    if (canRenderVisualization) {
      var svg = d3.select(React.findDOMNode(this));

      this.renderMap(svg);
      this.renderLegend(svg);
      this.renderLegendPointer(svg);
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
    OnResize,

    Reflux.connectFilter(DocumentStore, "files", function(data) {
      return getIn(data, "files", []);
    }),

    Reflux.connectFilter(DocumentStore, "layers", function(data) {
      return getIn(data, "layers", []);
    })
  ],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { layerIndex: 0 };
  },

  componentDidMount: function() {
    var params = this.context.router.getCurrentParams();
    DocumentStoreActions.load({ id: params.id });
  },

  onClickLayer: function(layerIndex) {
    this.setState({ layerIndex: layerIndex });
  },

  render: function() {
    var width  = this.state.window.width / 2;
    var height = this.state.window.height / 2;
    var layer  = getIn(this.state.layers, this.state.layerIndex);

    return React.DOM.div(
      { className: "visualization-wrapper" },
      Visualization({
        width:  width,
        height: height,
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
