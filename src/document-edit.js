var extend                 = require("extend");
var React                  = require("react");
var Emitter                = require("events").EventEmitter;
var CreateClass            = require("./addons/create-class");

var DataTable              = React.createFactory(require("./data-table"));
var Tabs                   = React.createFactory(require("./tabs"));
var Toolbox                = React.createFactory(require("./toolbox"));
var VisualizationGenerator = React.createFactory(require("./visualization-generator"));

var LeftView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "left" },
      VisualizationGenerator(this.props),
      Toolbox(this.props)
    );
  }
});

var RightView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "right" },
      React.DOM.div(
        { className: "content" },
        Tabs({
          tabs:        this.props.files || [],
          titleGetter: function(tab) { return tab.name; },
          handler:     function(tab) { return DataTable(tab); }
        })
      )
    );
  }
});

var DocumentEdit = CreateClass({
  getInitialState: function() {
    return {
      emitter: new Emitter()
    };
  },

  render: function() {
    var viewData = extend(
      true,
      this.props.data,
      { emitter: this.state.emitter }
    );

    return React.DOM.div(
      { className: "document-edit" },
      LeftView(viewData),
      RightView(viewData)
    );
  }
});

var DocumentEditWrapper = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { data: [] };
  },

  componentDidMount: function() {
    this.getData();
  },

  getData: function() {
    var params = this.context.router.getCurrentParams();

    this.props.api.getDocument(params.id, function(data) {
      this.setState({ data: data });
    }.bind(this));
  },

  render: function() {
    return DocumentEdit({ data: this.state.data, getData: this.getData });
  }
});

module.exports = DocumentEditWrapper;
