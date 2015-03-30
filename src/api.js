var TestData = {
  files: [
    { name: "test 1", id: "0001" },
    { name: "test 2", id: "0002" }
  ],

  file: {
    name:      "test file",
    url:       "http://localhost:3000/data/sample.csv",
    delimiter: ";"
  }
};

module.exports = {
  getFiles: function(callback) {
    callback(TestData.files);
  },

  getFile: function(id, callback) {
    callback(TestData.file);
  }
};
