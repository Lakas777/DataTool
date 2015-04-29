var colorbrewer = require("colorbrewer");

module.exports = {
  websiteUrl: process.env.DOMAIN,

  visualization: {
    animationDuration: 500,
    legendRectSize:    20,
    legendMargin:      { bottom: 30, right: 30 }
  },

  delimiters: [ ",", ";", ":", "|", "<tab>" ],

  colors: {
    nums:     [ 3, 5, 7 ],
    palettes: Object.keys(colorbrewer)
  },

  mappingTypes: [
    { name: "średnia",  key: "avg" },
    { name: "maksimum", key: "max" },
    { name: "minimum",  key: "min" },
    { name: "suma",     key: "sum" }
  ],

  rangeTypes: [
    { name: "0.0 - 1.0", key: "normalized" },
    { name: "0% - 100%", key: "percentage" },
    { name: "min - max", key: "minmax"     }
  ],

  dataTypes: [
    {
      name:         "województwa",
      key:          "province",
      accessor:     "properties.jpt_nazwa_",
      codeAccessor: "properties.jpt_kod_je",
      topojson:     "objects.province",
      url:          "data/province.geojson"
    },
    {
      name:         "powiaty",
      key:          "district",
      accessor:     "properties.jpt_nazwa_",
      codeAccessor: "properties.jpt_kod_je",
      topojson:     "objects.district",
      url:          "data/district.geojson"
    },
    {
      name:         "gminy",
      key:          "municipalities",
      accessor:     "properties.jpt_nazwa_",
      codeAccessor: "properties.jpt_kod_je",
      topojson:     "objects.municipalities",
      url:          "data/municipalities.geojson"
    }
    // TODO: leave cities for later
    // {
    //   name:         "miasta",
    //   key:          "cities",
    //   accessor:     "",
    //   url:          "data/cities.json"
    // }
  ]
};
