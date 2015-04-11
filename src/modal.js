var React = require("react");

var Modal = React.createClass({
  onClickClose: function() {
    if (this.props.onClickClose) {
      this.props.onClickClose();
    }
  },

  render: function() {
    var chainDivs = function(classes, children) {
      return classes.reverse().reduce(function(memo, className) {
        memo = React.DOM.div({ className: className }, memo);
        return memo;
      }, children);
    };

    var modal = chainDivs(
      [ "modal show backdrop", "modal-dialog", "modal-content" ],
      [
        React.DOM.div(
          { key: "header", className: "modal-header" },
          React.DOM.button({ className: "close", onClick: this.onClickClose }, React.DOM.span(null, "×")),
          React.DOM.h4({ className: "modal-title" }, this.props.title || "")
        ),
        this.props.body   ? React.DOM.div({ key: "body",   className: "modal-body" },   this.props.body)   : null,
        this.props.footer ? React.DOM.div({ key: "footer", className: "modal-footer" }, this.props.footer) : null
      ]
    );

    return React.DOM.div({ key: "modal" }, modal);
  }
});

module.exports = Modal;
