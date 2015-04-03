var React = require("react");

var DocumentCreate = React.createClass({
  render: function() {
    return React.DOM.div(
      { className: "document" },
      "create new document - add name to db, and send to /document/:id"
    );
  }
});

module.exports = DocumentCreate;
