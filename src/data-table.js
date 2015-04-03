var React = require("react");
var OnResize = require("react-window-mixins").OnResize;

var DataTable = React.createClass({
  mixins: [ OnResize ],

  renderHeader: function(header) {
    return React.DOM.thead(
      null,
      React.DOM.tr(
        null,
        React.DOM.th(null, "#"),
        header.map(function(text, index) {
          return React.DOM.th({ key: index }, text);
        })
      )
    );
  },

  renderRows: function(data) {
    console.log(data);

    return React.DOM.tbody(
      null,
      data.map(function(data, index) {
        return React.DOM.tr(
          { key: index },
          React.DOM.th(null, index),
          Object.keys(data).map(function(key) {
            return React.DOM.th({ key: key }, data[key]);
          })
        );
      })
    );
  },

  render: function() {
    var data   = this.props.data || [];
    var header = Object.keys(data[0] || {});
    var height = this.state.window.height - 140;

    return React.DOM.div(
      { className: "data-table table-responsive", style: { maxHeight: height } },
      React.DOM.table(
        { className: "table table-bordered" },
        this.renderHeader(header),
        this.renderRows(data.slice(1, data.length))
      )
    );
  }
});

module.exports = DataTable;
