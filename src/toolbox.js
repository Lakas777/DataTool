var React       = require("react");
var classNames  = require("classnames");
var CreateClass = require("./addons/create-class");
var Config      = require("./config");

var Tabs        = React.createFactory(require("./tabs"));

var SelectionView = CreateClass({
  getDefaultProps: function() {
    return {
      getter: function(d) { return d; }
    };
  },

  componentDidMount: function() {
    this.props.onChange({ target: { value: this.props.selectedIndex || 0 } });
  },

  render: function() {
    return React.DOM.div(
      { className: classNames("form-group", this.props.className) },
      React.DOM.label({ className: this.props.labelClassName }, this.props.name),
      React.DOM.select(
        {
          className: "form-control",
          value:     this.props.selectedIndex,
          onChange:  this.props.onChange
        },
        this.props.data.map(function(d, index) {
          return React.DOM.option({ key: index, value: index }, this.props.getter(d));
        }.bind(this))
      )
    );
  }
});

var ToolboxVisData = CreateClass({
  getInitialState: function() {
    return {
      selectedColumnIndex: null
    };
  },

  parentOnSelectionChange: function() {
    this.props.onSelectionChange({
      selectedColumnIndex: this.state.selectedColumnIndex
    });
  },

  onChangeColumn: function(event) {
    var index = event.target.value !== null ? +event.target.value : null;
    this.setState({ selectedColumnIndex: index }, this.parentOnSelectionChange);
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default " },
      React.DOM.div(
        { className: "panel-heading" },
        "Dane Wizualizacji"
      ),
      React.DOM.div(
        { className: "panel-body" },
        SelectionView({
          name:          "Kolumna:",
          className:     "col-sm-6",
          selectedIndex: this.state.selectedColumnIndex,
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        })
      )
    );
  }
});

var ToolboxGeoData = CreateClass({
  getInitialState: function() {
    return {
      selectedColumnIndex: null,
      selectedTypeIndex:   null
    };
  },

  parentOnSelectionChange: function() {
    if (this.state.selectedColumnIndex !== null && this.state.selectedTypeIndex !== null) {
      this.props.onSelectionChange({
        selectedColumnIndex: this.state.selectedColumnIndex,
        selectedTypeIndex:   this.state.selectedTypeIndex,
        dataType:            Config.dataTypes[this.state.selectedTypeIndex]
      });
    }
  },

  onChangeColumn: function(event) {
    var index = event.target.value !== null ? +event.target.value : null;
    this.setState({ selectedColumnIndex: index }, this.parentOnSelectionChange);
  },

  onChangeType: function(event) {
    var index = event.target.value !== null ? +event.target.value : null;
    this.setState({ selectedTypeIndex: index }, this.parentOnSelectionChange);
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default " },
      React.DOM.div(
        { className: "panel-heading" },
        "Dane Geograficzne"
      ),
      React.DOM.div(
        { className: "panel-body" },
        SelectionView({
          name:          "Kolumna:",
          className:     "col-sm-6",
          selectedIndex: this.state.selectedColumnIndex,
          onChange:      this.onChangeColumn,
          data:          this.props.columns
        }),
        SelectionView({
          name:          "Typ:",
          className:     "col-sm-6",
          selectedIndex: this.state.selectedTypeIndex,
          onChange:      this.onChangeType,
          getter:        function(d) { return d.name; },
          data:          Config.dataTypes
        })
      )
    );
  }
});

var ToolboxFileChoose = CreateClass({
  getInitialState: function() {
    return {
      selectedFileIndex: null
    };
  },

  parentOnFileChoose: function() {
    this.props.onFileChoose({
      index: this.state.selectedFileIndex,
      file:  this.props.files[this.state.selectedFileIndex]
    });
  },

  onChangeFile: function(event) {
    var index = event.target.value !== null ? +event.target.value : null;
    this.setState({ selectedFileIndex: index }, this.parentOnFileChoose);
  },

  render: function() {
    return React.DOM.div(
      { className: "panel panel-default toolbox-file-choose" },
      React.DOM.div(
        { className: "panel-body form-inline" },
        SelectionView({
          name:           "Arkusz:",
          className:      "col-sm-9",
          labelClassName: "col-sm-2",
          selectedIndex:  this.state.selectedFileIndex,
          onChange:       this.onChangeFile,
          data:           this.props.files,
          getter:         function(d) { return d.file; }
        })
      )
    );
  }
});

var ToolboxTab = CreateClass({
  getInitialState: function() {
    return {
      selectedFileIndex: null
    };
  },

  onFileChoose: function(event) {
    this.setState({ selectedFileIndex: event.index }, this.updateVisualization);
  },

  onSelectionChangeGeoData: function(event) {
    this.setState({
      selectedGeoColumnIndex: event.selectedColumnIndex,
      selectedGeoTypeIndex:   event.selectedTypeIndex
    }, this.updateVisualization);
  },

  onSelectionChangeVisData: function(event) {
    this.setState({
      selectedVisColumnIndex: event.selectedColumnIndex
    }, this.updateVisualization);
  },

  updateVisualization: function() {
    var hasAllFields = [
      "selectedFileIndex",
      "selectedGeoColumnIndex",
      "selectedGeoTypeIndex",
      "selectedVisColumnIndex"
    ].reduce(function(memo, key) {
      return memo && this.state[key] !== null && this.state[key] !== undefined;
    }.bind(this), true);

    if (hasAllFields) {
      this.props.emitter.emit("visualization:data", this.state);
    }
  },

  render: function() {
    var showDataPanels = [
      this.state.selectedFileIndex !== null,
      this.props.columns.length > 0
    ].reduce(function(memo, test) { return memo && test; }, true);

    return React.DOM.div(
      { className: "toolbox-tab" },
      ToolboxFileChoose({ files: this.props.columns, onFileChoose: this.onFileChoose }),
      showDataPanels ? ToolboxGeoData({
        columns:           this.props.columns[this.state.selectedFileIndex].columns,
        onSelectionChange: this.onSelectionChangeGeoData
      }) : null,
      showDataPanels ? ToolboxVisData({
        columns:           this.props.columns[this.state.selectedFileIndex].columns,
        onSelectionChange: this.onSelectionChangeVisData
      }) : null
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
    var emitter = this.props.emitter;
    var columns = this.columnData(this.props.files || []);

    return React.DOM.div(
      { className: "toolbox" },
      Tabs({
        tabs:        this.props.layers || [],
        titleGetter: function(tab) { return tab.name; },
        handler:     function(tab) {
          return ToolboxTab({
            layer:   tab,
            columns: columns,
            emitter: emitter
          });
        }
      })
    );
  }
});

module.exports = Toolbox;
