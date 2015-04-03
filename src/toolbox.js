var React       = require("react");
var CreateClass = require("./addons/create-class");

var Tabs        = React.createFactory(require("./tabs"));

var ToolboxTab = CreateClass({
  getInitialState: function() {
    return {
      selectedFileIndex: null
    };
  },

  onChangeFile: function(event) {
    this.setState({ selectedFileIndex: event.target.value });
  },

  renderColumnSelection: function(columns) {
    return React.DOM.div(
      null,
      JSON.stringify(columns, null, 2)
    );
  },

  render: function() {
    var selectedFileIndex = this.state.selectedFileIndex;
    var columns           = this.props.columns;
    var selectedColumn    = this.props.columns[this.state.selectedFileIndex];
    console.log(columns[selectedFileIndex]);

    return React.DOM.div(
      { className: "toolbox-tab" },
      React.DOM.div(
        { className: "form-group" },
        React.DOM.label(null, "Arkusz"),
        React.DOM.select(
          {
            className: "form-control",
            value: selectedFileIndex,
            onChange: this.onChangeFile
          },
          columns.map(function(column, index) {
            return React.DOM.option({ key: index, value: index }, column.file);
          })
        )
      ),
      selectedColumn ? this.renderColumnSelection(selectedColumn) : null
    );
  }
});

var Toolbox = React.createClass({
  columnData: function(files) {
    return files.reduce(function(memo, file) {
      return memo.concat([{
        file:    file.name,
        columns: Object.keys(file.data[0])
      }]);
    }, []);
  },

  render: function() {
    var columns = this.columnData(this.props.files || []);

    return React.DOM.div(
      { className: "toolbox" },
      Tabs({
        tabs:        this.props.layers || [],
        titleGetter: function(tab) { return tab.name; },
        handler:     function(tab) {
          return ToolboxTab({ layer: tab, columns: columns });
        }
      })
    );
  }
});

module.exports = Toolbox;
