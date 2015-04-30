var MD5 = require("MD5");
var d3  = require("d3");
var dsv = d3.dsv(";");

var TestData = {
  documents: [
    { name: "test 1", id: "did0001" },
    { name: "test 2", id: "did0002" }
  ],

  document: {
    name:  "test document",
    id:    "did0001",
    layers: [
      {
        id:       "lid0001",
        name:     "Kaczyński",
        fileId:   "fid0002",
        geo:      {
          column: "Województwo",
          type:   "province"
        },
        vis:      {
          column:       "KACZYŃSKI Jarosław Aleksander",
          mappingType:  "avg",
          rangeType:    "percentage",
          colorNum:     7,
          colorPalette: "Blues"
        }
      },
      {
        id:       "lid0002",
        name:     "Komorowski",
        fileId:   "fid0001",
        geo:      {
          column: "Województwo",
          type:   "province"
        },
        vis:      {
          column:       "KOMOROWSKI Bronisław Maria",
          mappingType:  "avg",
          rangeType:    "percentage",
          colorNum:     "7",
          colorPalette: "Blues"
        }
      }
    ],
    files: [
      { name: "file 1", id: "fid0001", data: [] },
      { name: "file 2", id: "fid0002", data: [] },
      { name: "file 3", id: "fid0003", data: [] }
    ]
  },

  newDocument: {
    name:   "new document",
    id:     "newdid0001",
    layers: [],
    files:  []
  }
};

module.exports = {
  getDocuments: function(callback) {
    callback(TestData.documents);
  },

  getDocument: function(id, callback) {
    if (id === "did0001" || id === "did0002") {
      dsv("data/sample-data-1.csv", function(error, data) {
        console.log("API getDocument", id, error);

        TestData.document.files.forEach(function(file) {
          file.data = data;
        });

        callback(TestData.document);
      });
    }
    else {
      callback(TestData.newDocument);
    }
  },

  // TODO: when renaming document from list only name goes in here
  // this could possibly destroy existing document?
  updateDocument: function(document, callback) {
    console.log("API updateDocument", document);
    if (callback) { callback(); }
  },

  createDocument: function(document, callback) {
    console.log("API createDocument", document);
    if (callback) {
      callback({
        name: document,
        id:   MD5((new Date()).getTime())
      });
    }
  },

  removeDocument: function(id, callback) {
    console.log("API removeDocument", id);
    callback();
  }
};
