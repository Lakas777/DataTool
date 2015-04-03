var d3  = require("d3");
var dsv = d3.dsv(";");

var TestData = {
  documents: [
    { name: "test 1", id: "0001" },
    { name: "test 2", id: "0002" }
  ],

  document: {
    name:  "test document",
    files: [
      { name: "file 1", data: [] },
      { name: "file 2", data: [] },
      { name: "file 3", data: [] }
    ]
  }
};

module.exports = {
  getDocuments: function(callback) {
    callback(TestData.documents);
  },

  getDocument: function(id, callback) {
    dsv("data/sample-data-1.csv", function(error, data) {
      console.log("get", id, error);

      TestData.document.files.forEach(function(file) {
        file.data = data;
      });

      callback(TestData.document);
    });
  }
};
