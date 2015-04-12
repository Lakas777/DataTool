Object.assign       = require("object-assign");

var React           = require("react");
var PureRenderMixin = require("react/addons").addons.PureRenderMixin;
var FixedDataTable  = require("fixed-data-table");
var OnResize        = require("react-window-mixins").OnResize;

var Table           = React.createFactory(FixedDataTable.Table);
var Column          = React.createFactory(FixedDataTable.Column);

var FileTable = React.createClass({
  mixins: [ OnResize, PureRenderMixin ],

  render: function() {
    var data   = this.props.data || [];
    var keys   = Object.keys(data[0] || {});
    var height = this.state.window.height - 133;
    var width  = this.state.window.width / 2 + 5;

    var columnWidths = keys.reduce(function(memo, key) {
      memo[key] = data.reduce(function(memo, data) {
        var columnWidth = data[key].length * 10;
        return columnWidth > memo ? columnWidth : memo;
      }, key.length * 10);

      return memo;
    }, {});

    var rowGetter = function(index) {
      return data[index];
    };

    return React.DOM.div(
      { className: "data-table" },
      Table(
        {
          headerHeight: 50,
          rowHeight:    50,
          rowGetter:    rowGetter,
          rowsCount:    data.length,
          width:        width - 40,
          maxHeight:    height
        },
        keys.map(function(key, index) {
          return Column({
            key:      index,
            label:    key,
            dataKey:  key,
            width:    columnWidths[key]
          });
        })
      )
    );
  }
});

module.exports = FileTable;
