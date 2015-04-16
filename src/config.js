module.exports = {
  delimiters: [ ",", ";", ":", "|", "<tab>" ],
  dataTypes:  [
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
    },
    {
      name:         "miasta",
      key:          "cities",
      accessor:     "",
      url:          "data/cities.json"
    }
  ]
};
