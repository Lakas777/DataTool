module.exports = {
  dataTypes: [
    {
      name:     "województwa",
      key:      "province",
      accessor: "properties.jpt_nazwa_",
      url:      "data/province.geojson"
    },
    {
      name:     "powiaty",
      key:      "district",
      accessor: "properties.jpt_nazwa_",
      url:      "data/district.geojson"
    },
    {
      name:     "gminy",
      key:      "municipalities",
      accessor: "properties.jpt_nazwa_",
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
