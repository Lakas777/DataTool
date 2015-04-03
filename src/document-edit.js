var React       = require("react");
var classNames  = require("classnames");
var CreateClass = require("./addons/create-class");

var DataTable   = React.createFactory(require("./data-table"));

var TabView = CreateClass({
  getInitialState: function() {
    return { activeTab: 0 };
  },

  render: function() {
    var activeTab = this.state.activeTab;
    var tabs      = this.props.tabs;
    var Handler   = this.props.handler;

    return React.DOM.div(
      { className: "tabs", role: "tabpanel" },
      React.DOM.ul(
        { className: "nav nav-tabs", role: "tablist" },
        tabs.map(function(tab, index) {
          return React.DOM.li(
            {
              className: classNames({ "active": index === activeTab }),
              role: "presentation",
              key: tab.name
            },
            React.DOM.a({ href: "" }, tab.name)
          );
        })
      ),
      React.DOM.div(
        { className: "tab" },
        Handler(tabs[activeTab])
      )
    );
  }
});

var LeftView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "left" },
      "PREVIEW"
    );
  }
});

var RightView = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "right" },
      React.DOM.div(
        { className: "content" },
        TabView({
          tabs:    this.props.files || [],
          handler: DataTable
        })
      )
    );
  }
});

var DocumentEdit = CreateClass({
  render: function() {
    return React.DOM.div(
      { className: "document-edit" },
      LeftView(this.props.data),
      RightView(this.props.data)
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
