var React      = require("react");
var classNames = require("classnames");

var Tabs = React.createClass({
  getInitialState: function() {
    return { activeTab: 0 };
  },

  onClickTab: function(index) {
    this.setState({ activeTab: index });
  },

  render: function() {
    var activeTab   = this.state.activeTab;

    var onClickTab  = this.onClickTab;
    var tabs        = this.props.tabs;
    var titleGetter = this.props.titleGetter;
    var handler     = this.props.handler;

    return React.DOM.div(
      { className: "tabs", role: "tabpanel" },
      React.DOM.ul(
        { className: "nav nav-tabs", role: "tablist" },
        tabs.map(function(tab, index) {
          return React.DOM.li(
            {
              className: classNames({ "active": index === activeTab }),
              role:      "presentation",
              key:       index
            },
            React.DOM.div({ onClick: onClickTab.bind(null, index) }, titleGetter(tab))
          );
        })
      ),
      React.DOM.div(
        { className: "tab" },
        handler(tabs[activeTab])
      )
    );
  }
});

module.exports = Tabs;
