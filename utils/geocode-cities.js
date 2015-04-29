var async     = require("async");
var fs        = require("fs");
var geocoder  = require("simple-geocoder");

var queryGeocoder = function() {
  var savedData = JSON.parse(fs.readFileSync("./cities-data.json", { encoding: "utf8" }));

  console.log("loaded " + Object.keys(savedData).length + " cities from cache");

  fs.readFile("./cities.txt", { encoding: "utf8" }, function(error, data) {
    if (error) { return console.error(error); }

    data = data
      .replace(/\r/g, "")
      .split("\n");

    var errorCount = 0;

    async.map(
      data,

      function(city, callback) {
        if (savedData[city]) {
          callback(null, { city: city, locations: savedData[city] });
        }
        else {
          geocoder.geocode(city + " Poland", function(success, locations) {
            console.log("[ " + (success ? "success" : "error") + " ] geocoding " + city);

            if (success) {
              callback(null, { city: city, locations: locations });
            }
            else {
              errorCount++;
              callback(null, null);
            }
          });
        }
      },

      function(error, cities) {
        if (error) { return console.log(error); }

        cities = cities
          .filter(function(city) {
            return city !== null;
          })
          .reduce(function(memo, city) {
            memo[city.city] = city.locations;
            return memo;
          }, {});

        fs.writeFile("./cities-data.json", JSON.stringify(cities), function() {
          if (errorCount !== 0) {
            console.log("----------");
            console.log("RE-RUNNING");
            console.log("----------");
            queryGeocoder();
          }
        });
      }
    );
  });
};

queryGeocoder();
