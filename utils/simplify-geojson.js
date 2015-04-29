var simplify   = require("simplify-geojson");
var fs         = require("fs");

var simplification = process.argv[2];
var inputPath      = process.argv[3];
var outputPath     = process.argv[4] || "./out.geojson";

fs.readFile(inputPath, { encoding: "utf8" }, function(error, contents) {
  if (!error) {
    contents = JSON.parse(contents);
    contents = contents.features.map(function(feature) {
      var simplified = simplify(feature, simplification);
      return simplified;
    });

    fs.writeFile(outputPath, JSON.stringify(contents));
  }
  else {
    console.error(error);
  }
});

