var extend            = require("extend");
var hyperquest        = require("hyperquest");
var objectWithoutKeys = require("./addons/object-without-keys");

var domainURL         = require("./config").domainURL;

// var d3         = require("d3");
// var dsv        = d3.dsv(";");
// var TestData = {
//   documents: [
//     { name: "test 1", id: "did0001" },
//     { name: "test 2", id: "did0002" }
//   ],
//
//   document: {
//     name:  "test document",
//     id:    "did0001",
//     layers: [
//       {
//         id:       "lid0001",
//         name:     "Kaczyński",
//         fileId:   "fid0002",
//         geo:      {
//           column: "Województwo",
//           type:   "province"
//         },
//         vis:      {
//           column:       "KACZYŃSKI Jarosław Aleksander",
//           mappingType:  "avg",
//           rangeType:    "percentage",
//           colorNum:     7,
//           colorPalette: "Blues"
//         }
//       },
//       {
//         id:       "lid0002",
//         name:     "Komorowski",
//         fileId:   "fid0001",
//         geo:      {
//           column: "Województwo",
//           type:   "province"
//         },
//         vis:      {
//           column:       "KOMOROWSKI Bronisław Maria",
//           mappingType:  "avg",
//           rangeType:    "percentage",
//           colorNum:     "7",
//           colorPalette: "Blues"
//         }
//       }
//     ],
//     files: [
//       { name: "file 1", id: "fid0001", data: [] },
//       { name: "file 2", id: "fid0002", data: [] },
//       { name: "file 3", id: "fid0003", data: [] }
//     ]
//   },
//
//   newDocument: {
//     name:   "new document",
//     id:     "newdid0001",
//     layers: [],
//     files:  []
//   }
// };

var parse = function(callback, data) {
  if (callback) {
    data = (typeof data === "string") ? JSON.parse(data) : null;
    callback(data);
  }
};

module.exports = {
  getDocuments: function(callback) {
    hyperquest.get(domainURL + "/data_documents.json")
      .on("data", parse.bind(null, function(data) {
        var outData = data.map(function(d) {
          var inside = JSON.parse(d.data);
          return extend(true, { id: d.id.$oid }, inside);
        });

        callback(outData);
      }));
  },

  getDocument: function(id, callback) {
    hyperquest.get(domainURL + "/data_documents/" + id + ".json")
      .on("data", parse.bind(null, function(data) {
        var inside  = JSON.parse(data.data);
        var outData = extend(true, { id: data.id.$oid }, inside);

        callback(outData);
      }));
  },

  updateDocument: function(document, callback) {
    var options = { headers: { "Content-Type": "application/json" } };
    var putBody = JSON.stringify(objectWithoutKeys(document, [ "id" ]));

    hyperquest.put(domainURL + "/data_documents/" + document.id + ".json", options)
      .on("response", function() { if (callback) { callback(); } })
      .end(putBody);
  },

  createDocument: function(document, callback) {
    var params = "data_document[data]=" + JSON.stringify(document);

    hyperquest.post(domainURL + "/data_documents.json?" + params)
      .on("response", callback)
      .end();
  },

  removeDocument: function(id, callback) {
    hyperquest.delete(domainURL + "/data_documents/" + id + ".json")
      .on("response", callback);
  }
};
