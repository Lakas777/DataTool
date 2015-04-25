var Reflux = require("reflux");
var Api    = require("./api");

// Documents list

var DocumentsStoreActions = Reflux.createActions([
  "load",
  "create"
]);

var DocumentsStore = Reflux.createStore({
  listenables: [ DocumentsStoreActions ],

  getInitialState: function() {
    this.documents = [];
    return this.documents;
  },

  onLoad: function() {
    Api.getDocuments(function(documents) {
      // TODO: JSON.parse() if needed
      this.documents = documents;
      this.trigger(this.documents);
    }.bind(this));
  },

  onCreate: function(document) {
    Api.createDocument(document, function(document) {
      this.documents.push(document);
      this.trigger(this.documents);
    }.bind(this));
  }
});

// Single document

var DocumentStoreActions = Reflux.createActions([
  "layerUpdate",
  "layerRemove"
]);

var DocumentStore = Reflux.createStore({
  listenables: [ DocumentStoreActions ],

  onLayerUpdate: function(layerId) {
    console.log("on layer update", layerId);
  },

  onLayerRemove: function(layerId) {
    console.log("on layer remove", layerId);
  },

  getInitialState: function() {
    console.log("return initial state");
    return [];
  }
});

module.exports = {
  DocumentStore:         DocumentStore,
  DocumentStoreActions:  DocumentStoreActions,
  DocumentsStore:        DocumentsStore,
  DocumentsStoreActions: DocumentsStoreActions
};
