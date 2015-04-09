var React       = require("react");
var CreateClass = require("./addons/create-class");

var Tabs        = React.createFactory(require("./tabs"));

var ToolboxColumnChoose = CreateClass({
  getInitialState: function() {
    return {
      selectedFileIndex:   null,
      selectedColumnIndex: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.columns.length !== this.props.columns.length) {
      this.setState({ selectedFileIndex: 0, selectedColumnIndex: 0 }, this.updateParent);
    }
  },

  updateParent: function() {
    var selectedFileIndex = this.state.selectedFileIndex;
    var selectedColumnIndex = this.state.selectedColumnIndex;

    this.props.onChangeColumn({
      selectedFileIndex:   selectedFileIndex,
      selectedColumnIndex: selectedColumnIndex,
      name:                this.props.columns[selectedFileIndex].columns[selectedColumnIndex]
    });
  },

  onChangeFile: function(event) {
    this.setState({ selectedFileIndex: parseInt(event.target.value, 10) }, this.updateParent);
  },

  onChangeColumn: function(event) {
    this.setState({ selectedColumnIndex: parseInt(event.target.value, 10) }, this.updateParent);
  },

  renderSelection: function(options) {
    return React.DOM.div(
      { className: "form-group col-sm-6" },
      React.DOM.label({ className: "col-sm-3" }, options.name),
      React.DOM.select(
        {
          className: "form-control col-sm-9",
          value:     options.selectedIndex,
          onChange:  options.onChange
        },
        options.data.map(function(d, index) {
          return React.DOM.option({ key: index, value: index }, options.getter(d));
        })
      )
    );
  },

  renderFiles: function() {
    return this.renderSelection({
      name:          "Arkusz:",
      selectedIndex: this.state.selectedFileIndex,
      onChange:      this.onChangeFile,
      data:          this.props.columns,
      getter:        function(d) { return d.file; }
    });
  },

  renderColumns: function() {
    return this.renderSelection({
      name:          "Kolumna:",
      selectedIndex: this.state.selectedColumnIndex,
      onChange:      this.onChangeColumn,
      data:          this.props.columns[this.state.selectedFileIndex].columns,
      getter:        function(d) { return d; }
    });
  },

  render: function() {
    return React.DOM.div(
      { className: "toolbox-tab form-inline" },
      this.renderFiles(),
      this.state.selectedFileIndex !== null ? this.renderColumns() : null
    );
  }
});

var ToolboxTab = CreateClass({
  onChangeColumn: function(e) {
    console.log(e);
  },

  render: function() {
    return React.DOM.div(
      { className: "toolbox-tab" },
      ToolboxColumnChoose({ columns: this.props.columns, onChangeColumn: this.onChangeColumn })
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
