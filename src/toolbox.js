var React       = require("react");
var classNames  = require("classnames");
var CreateClass = require("./addons/create-class");

var Tabs        = React.createFactory(require("./tabs"));

var SelectionView = CreateClass({
  getDefaultProps: function() {
    return {
      getter: function(d) { return d; }
    };
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
        React.DOM.option({ disabled: true, hidden: true, value: 0 }),
        this.props.data.map(function(d, index) {
          return React.DOM.option({ key: index, value: index + 1 }, this.props.getter(d));
        }.bind(this))
      )
    );
  }
});

var ToolboxVisData = CreateClass({
  getInitialState: function() {
    return {
      selectedColumnIndex: null
    }
  },

  parentOnSelectionChange: function() {
    this.props.onSelectionChange({
      selectedColumnIndex: this.state.selectedColumnIndex
    });
  },

  onChangeColumn: function(e) {
    this.setState({ selectedColumnIndex: parseInt(e.target.value, 10) }, this.parentOnSelectionChange);
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
      selectedTypeIndex:   null,
      typeData:            [ "województwa", "powiaty", "gminy", "miasta" ]
    };
  },

  parentOnSelectionChange: function() {
    if (this.state.selectedColumnIndex !== null && this.state.selectedTypeIndex !== null) {
      this.props.onSelectionChange({
        selectedColumnIndex: this.state.selectedColumnIndex,
        selectedTypeIndex:   this.state.selectedTypeIndex,
        typeName:            this.state.typeData[this.state.selectedTypeIndex]
      });
    }
  },

  onChangeColumn: function(e) {
    this.setState({ selectedColumnIndex: parseInt(e.target.value, 10) }, this.parentOnSelectionChange);
  },

  onChangeType: function(e) {
    this.setState({ selectedTypeIndex: parseInt(e.target.value, 10) }, this.parentOnSelectionChange);
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
          data:          this.state.typeData
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
    this.setState({ selectedFileIndex: parseInt(event.target.value, 10)}, this.parentOnFileChoose);
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

  onFileChoose: function(e) {
    this.setState({ selectedFileIndex: e.index });
  },

  onSelectionChangeGeoData: function(e) {
    this.setState({
      selectedGeoColumnIndex: e.selectedColumnIndex,
      selectedGeoTypeIndex: e.selectedTypeIndex
    });
  },

  onSelectionChangeVis: function(e) {
    this.setState({
      selectedVisColumnIndex: e.selectedColumnIndex,
      selectedVisTypeIndex: e.selectedTypeIndex
    });
  },

  render: function() {
    return React.DOM.div(
      { className: "toolbox-tab" },
      ToolboxFileChoose({ files: this.props.columns, onFileChoose: this.onFileChoose }),
      this.state.selectedFileIndex !== null ? ToolboxGeoData({
        columns: this.props.columns[this.state.selectedFileIndex].columns,
        onSelectionChange: this.onSelectionChangeGeoData
      }) : null,
      this.state.selectedFileIndex !== null ? ToolboxVisData({
        columns: this.props.columns[this.state.selectedFileIndex].columns,
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
