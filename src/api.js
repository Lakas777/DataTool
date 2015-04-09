var d3  = require("d3");
var dsv = d3.dsv(";");

var TestData = {
  documents: [
    { name: "test 1", id: "did0001" },
    { name: "test 2", id: "did0002" }
  ],

  document: {
    name:  "test document",
    layers: [
      {
        id:       "lid0001",
        name:     "layer 1",
        fileId:   "fid0002",
        geo:      {
          column: "Województwo",
          type:   "province"
        },
        vis:      {
          column: "% głosów ważnych"
        }
      }
    ],
    files: [
      { name: "file 1", id: "fid0001", data: [] },
      { name: "file 2", id: "fid0002", data: [] },
      { name: "file 3", id: "fid0003", data: [] }
    ]
  }
};

module.exports = {
  getDocuments: function(callback) {
    callback(TestData.documents);
  },

  getDocument: function(id, callback) {
    dsv("data/sample-data-1.csv", function(error, data) {
      console.log("API getDocument", id, error);

      TestData.document.files.forEach(function(file) {
        file.data = data;
      });

      callback(TestData.document);
    });
  },

  updateDocument: function(document, callback) {
    console.log("API updateDocument", document);
    if (callback) { callback(); }
  }
};
