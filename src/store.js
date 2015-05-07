var Reflux      = require("reflux");
var Api         = require("./api");

var extend      = require("extend");
var getIn       = require("insides").getIn;
var indexOfProp = require("./addons/index-of-prop");

// Documents list

var DocumentsStoreActions = Reflux.createActions([
  "load",
  "create",
  "update",
  "remove"
]);

var DocumentsStore = Reflux.createStore({
  listenables: [ DocumentsStoreActions ],

  getInitialState: function() {
    this.documents = [];
    return this.documents;
  },

  onLoad: function() {
    Api.getDocuments(function(documents) {
      this.documents = documents;
      this.trigger(this.documents);
    }.bind(this));
  },

  onCreate: function(document) {
    Api.createDocument(document, function() {
      this.onLoad();
    }.bind(this));
  },

  onUpdate: function(updatedDocument) {
    var index    = indexOfProp(this.documents, "id", updatedDocument.id);
    var document = extend(true, {}, this.documents[index], updatedDocument);

    Api.updateDocument(document, function() {
      this.documents[index] = document;
      this.trigger(this.documents);
    }.bind(this));
  },

  onRemove: function(document) {
    var index = indexOfProp(this.documents, "id", document.id);

    Api.removeDocument(this.documents[index].id, function() {
      this.documents.splice(index, 1);
      this.trigger(this.documents);
    }.bind(this));
  }
});

// Single document

var extendEmptyDocument = function(data) {
  var EmptyDocument = {
    name:   undefined,
    id:     undefined,
    layers: [],
    files:  []
  };

  return extend(true, {}, EmptyDocument, data);
};

var extendEmtpyLayer = function(data) {
  var EmptyLayer = {
    id:            undefined,
    fileId:        undefined,
    name:          undefined,
    geo: {
      column:      undefined,
      type:        undefined
    },
    vis: {
      column:      undefined,
      mappingType: undefined,
      rangeType:   undefined
    }
  };

  return extend(true, {}, EmptyLayer, data);
};

var DocumentStoreActions = Reflux.createActions([
  "load",

  "fileCreate",
  "fileRemove",

  "layerCreate",
  "layerUpdate",
  "layerRemove"
]);

var DocumentStore = Reflux.createStore({
  listenables: [ DocumentStoreActions ],

  getInitialState: function() {
    this.document = extendEmptyDocument();
    return this.document;
  },

  onLoad: function(args) {
    Api.getDocument(args.id, function(data) {
      this.document = extend(true, this.document, data);
      this.trigger(this.document);
    }.bind(this));
  },

  onFileCreate: function(data) {
    var document = this.document;

    if (document.files instanceof Array) {
      document.files.push(data);
    }
    else {
      document.files = [ data ];
    }

    Api.updateDocument(document);
    this.trigger(document);
  },

  onFileRemove: function(args) {
    var fileId   = args.id;
    var document = this.document;

    document.files = document.files.filter(function(file) {
      return file.id !== fileId;
    });

    document.layers = document.layers.filter(function(layer) {
      return layer.fileId !== fileId;
    });

    Api.updateDocument(document);
    this.trigger(document);
  },

  onLayerCreate: function(data) {
    var document = this.document;

    document.layers = document.layers.concat([ extendEmtpyLayer(data) ]);

    Api.updateDocument(document);
    this.trigger(document);
  },

  onLayerUpdate: function(data) {
    var document = this.document;
    var index    = indexOfProp(document.layers, "id", data.id);

    if (index >= 0) {
      // changing fileId in layer should reset this layer to default values
      if (data.fileId !== undefined && data.fileId !== document.layers[index].fileId) {
        document.layers[index] = extendEmtpyLayer({
          fileId: data.fileId,
          id:     document.layers[index].id,
          name:   document.layers[index].name
        });
      }
      else {
        // otherwise just update the data in layer
        document.layers[index] = extend(true, {}, document.layers[index], data);
      }

      Api.updateDocument(document);
      this.trigger(document);
    }
  },

  onLayerRemove: function(args) {
    var layerId  = args.id;
    var document = this.document;

    document.layers = document.layers.filter(function(layer) {
      return layer.id !== layerId;
    });

    Api.updateDocument(document);
    this.trigger(document);
  }
});

module.exports = {
  DocumentStore:         DocumentStore,
  DocumentStoreActions:  DocumentStoreActions,
  DocumentsStore:        DocumentsStore,
  DocumentsStoreActions: DocumentsStoreActions
};
