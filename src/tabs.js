var React      = require("react");
var classNames = require("classnames");

var Tabs = React.createClass({
  getDefaultProps: function() {
    return {
      titleGetter: function(child) { return child.name; }
    };
  },

  getInitialState: function() {
    return { activeTab: 0 };
  },

  onClickTab: function(index) {
    this.setState({ activeTab: index });
  },

  render: function() {
    var activeTab   = this.state.activeTab;
    var titleGetter = this.props.titleGetter;
    var onClickTab  = this.onClickTab;

    return React.DOM.div(
      { className: "tabs", role: "tabpanel" },
      React.DOM.ul(
        { className: "nav nav-tabs", role: "tablist" },
        React.Children.map(this.props.children, function(child, index) {
          return React.DOM.li(
            {
              className: classNames(
                { "active": index === activeTab },
                child.props.className
              ),
              role:      "presentation",
              key:       index
            },
            React.DOM.div(
              { onClick: onClickTab.bind(null, index) },
              titleGetter(child.props)
            )
          );
        })
      ),
      React.DOM.div({ className: "tab" }, this.props.children[activeTab])
    );
  }
});

module.exports = Tabs;
