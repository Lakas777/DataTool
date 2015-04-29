var fs       = require("fs");
var del      = require("del");
var mkdirp   = require("mkdirp");
var mv       = require("mv");
var request  = require("request");
var spawn    = require("child_process").spawn;
var unzip    = require("unzip");

var links = [
  { url: "http://www.gis-support.pl/downloads/panstwo.zip",     simplify: "1e-1",  name: "country"        },
  { url: "http://www.gis-support.pl/downloads/wojewodztwa.zip", simplify: "1e-1",  name: "province"       },
  { url: "http://www.gis-support.pl/downloads/powiaty.zip",     simplify: "1e-2",  name: "district"       },
  { url: "http://www.gis-support.pl/downloads/gminy.zip",       simplify: "1e-10", name: "municipalities" }
];

var convertToGeoJSON = function(name, dir, callback) {
  var geoJsonName = dir + "/" + name + ".geojson";

  del(
    geoJsonName,
    function() {
      spawn("ogr2ogr", [
        "-f", "GeoJSON",
        "-s_srs", "EPSG:2180",
        "-t_srs", "WGS84",
        // "-lco", "COORDINATE_PRECISION=3",
        geoJsonName,
        dir + "/" + name + ".shp"
      ]).on("exit", callback);
    }
  );
};

var moveAndClean = function(name, outName, dir, callback) {
  mv(
    dir + name + "/" + name + ".geojson",
    dir + outName + ".geojson",
    callback
  );
};

var simplifyGeoJSON = function(file, simplification, callback) {
  var spawned = spawn("./node_modules/.bin/topojson", [
    file,
    "-o", file,
    "-p",
    "-q", "1e5",
    "--simplify-proportion", simplification
  ]).on("exit", callback);

  spawned.stdout.on("data", function(data) {
    console.log(data.toString());
  });

  spawned.stderr.on("data", function(data) {
    console.log(data.toString());
  });
};

var downloadIfNeeded = function(name, url, callback) {
  fs.exists("./data/" + name, function(exists) {
    if (exists) {
      callback();
    }
    else {
      request(url)
        .pipe(unzip.Extract({ path: "./data/" }))
        .on("end", callback);
    }
  });
};

mkdirp("./data/", function() {
  links.forEach(function(link) {
    var simplification = link.simplify;
    var outName        = link.name;
    var url            = link.url;
    var name           = url.split("/").pop().replace(".zip", "");

    downloadIfNeeded(name, url, function() {
      convertToGeoJSON(name, "./data/" + name, function() {
        moveAndClean(name, outName, "./data/", function() {
          simplifyGeoJSON(__dirname + "/data/" + outName + ".geojson", simplification, function() {
            console.log("[ done ] " + name);
          });
        });
      });
    });
  });
});

