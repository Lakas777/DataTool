module.exports = {
  dataTypes: [
    {
      name:     "województwa",
      key:      "province",
      accessor: "properties.jpt_nazwa_",
      topojson: "objects.province",
      url:      "data/province.geojson"
    },
    {
      name:     "powiaty",
      key:      "district",
      accessor: "properties.jpt_nazwa_",
      topojson: "objects.district",
      url:      "data/district.geojson"
    },
    {
      name:     "gminy",
      key:      "municipalities",
      accessor: "properties.jpt_nazwa_",
      topojson: "objects.municipalities",
      url:      "data/municipalities.geojson"
    },
    {
      name:     "miasta",
      key:      "cities",
      accessor: "",
      url:      "data/cities.json"
    }
  ]
};
