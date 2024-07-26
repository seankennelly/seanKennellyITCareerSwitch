// PRELOADER
$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});
// END PRELOADER

// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------
let map;

// tile layers

let streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
});

let satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
});

let basemaps = {
  Streets: streets,
  Satellite: satellite,
};

// buttons
let infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// PAGE INITIALISATION
$(document).ready(function () {
  populateDropdownList();
  getUserLocation();
  get_country_border("GB");
  // mapToLocation(50, 9);
  
});

const addBorder = () => {
  // let polygon = L.polygon([
  //   [-3.00500484863528, 58.6350001084663],
  //   [-4.07382849772802, 57.5530248073553],
  //   [-3.05500179687766, 57.690019029361],
  //   [-1.95928056477692, 57.6847997096995],
  //   [-2.2199881656893, 56.8700174017535],
  //   [-3.11900305827112, 55.9737930365155],
  //   [-2.08500932454302, 55.9099984808513],
  //   [-2.00567567967386, 55.8049028503502],
  //   [-1.11499101399221, 54.6249864772654],
  //   [-0.4304849918542, 54.4643761257022],
  //   [0.184981316742039, 53.325014146531],
  //   [0.469976840831777, 52.929999498092],
  //   [1.68153079591474, 52.739520168664],
  //   [1.55998782716438, 52.099998480836],
  //   [1.05056155763091, 51.8067605657957],
  //   [1.4498653499503, 51.289427802122],
  //   [0.550333693045502, 50.7657388372759],
  //   [-0.78751746255864, 50.7749889186562],
  //   [-2.48999752441438, 50.5000186224312],
  //   [-2.95627397298404, 50.696879991247],
  //   [-3.61744808594233, 50.2283556178727],
  //   [-4.54250790039924, 50.3418370631857],
  //   [-5.24502315919114, 49.9599999049811],
  //   [-5.7765669417453, 50.1596776393568],
  //   [-4.30998979330184, 51.2100011256892],
  //   [-3.41485063314212, 51.4260086126693],
  //   [-3.42271946710832, 51.4268481674061],
  //   [-4.98436723471087, 51.593466091511],
  //   [-5.26729570150889, 51.9914004583746],
  //   [-4.22234656413485, 52.3013556992614],
  //   [-4.77001339356411, 52.8400049912556],
  //   [-4.57999915202692, 53.4950037705552],
  //   [-3.09383067378866, 53.4045474006697],
  //   [-3.09207963704711, 53.4044408229635],
  //   [-2.94500851074434, 53.9849997015467],
  //   [-3.61470082543303, 54.6009367732926],
  //   [-3.63000545898933, 54.615012925833],
  //   [-4.844169073903, 54.7909711777868],
  //   [-5.08252661784923, 55.0616006536994],
  //   [-4.71911210775664, 55.5084726019435],
  //   [-5.04798092286211, 55.7839855007075],
  //   [-5.58639767091114, 55.3111461452368],
  //   [-5.64499874513018, 56.2750149603448],
  //   [-6.14998084148635, 56.7850096706335],
  //   [-5.78682471355529, 57.8188483750647],
  //   [-5.00999874512758, 58.6300133327501],
  //   [-4.21149451335356, 58.5508450384792],
  //   [-3.00500484863528, 58.6350001084663],
  // ]).addTo(map);
  var latlngs = [
    [
      [
        [
          [-5.6619486149219, 54.5546031764839],
          [-6.19788489422098, 53.8675650091633],
          [-6.953730231138, 54.0737022975756],
          [-7.57216793459108, 54.059956366586],
          [-7.36603064617879, 54.5958409694527],
          [-7.57216793459108, 55.1316222194549],
          [-6.73384701173615, 55.1728600124238],
          [-5.6619486149219, 54.5546031764839],
        ],
      ],
      [
        [
          [-3.00500484863528, 58.6350001084663],
          [-4.07382849772802, 57.5530248073553],
          [-3.05500179687766, 57.690019029361],
          [-1.95928056477692, 57.6847997096995],
          [-2.2199881656893, 56.8700174017535],
          [-3.11900305827112, 55.9737930365155],
          [-2.08500932454302, 55.9099984808513],
          [-2.00567567967386, 55.8049028503502],
          [-1.11499101399221, 54.6249864772654],
          [-0.4304849918542, 54.4643761257022],
          [0.184981316742039, 53.325014146531],
          [0.469976840831777, 52.929999498092],
          [1.68153079591474, 52.739520168664],
          [1.55998782716438, 52.099998480836],
          [1.05056155763091, 51.8067605657957],
          [1.4498653499503, 51.289427802122],
          [0.550333693045502, 50.7657388372759],
          [-0.78751746255864, 50.7749889186562],
          [-2.48999752441438, 50.5000186224312],
          [-2.95627397298404, 50.696879991247],
          [-3.61744808594233, 50.2283556178727],
          [-4.54250790039924, 50.3418370631857],
          [-5.24502315919114, 49.9599999049811],
          [-5.7765669417453, 50.1596776393568],
          [-4.30998979330184, 51.2100011256892],
          [-3.41485063314212, 51.4260086126693],
          [-3.42271946710832, 51.4268481674061],
          [-4.98436723471087, 51.593466091511],
          [-5.26729570150889, 51.9914004583746],
          [-4.22234656413485, 52.3013556992614],
          [-4.77001339356411, 52.8400049912556],
          [-4.57999915202692, 53.4950037705552],
          [-3.09383067378866, 53.4045474006697],
          [-3.09207963704711, 53.4044408229635],
          [-2.94500851074434, 53.9849997015467],
          [-3.61470082543303, 54.6009367732926],
          [-3.63000545898933, 54.615012925833],
          [-4.844169073903, 54.7909711777868],
          [-5.08252661784923, 55.0616006536994],
          [-4.71911210775664, 55.5084726019435],
          [-5.04798092286211, 55.7839855007075],
          [-5.58639767091114, 55.3111461452368],
          [-5.64499874513018, 56.2750149603448],
          [-6.14998084148635, 56.7850096706335],
          [-5.78682471355529, 57.8188483750647],
          [-5.00999874512758, 58.6300133327501],
          [-4.21149451335356, 58.5508450384792],
          [-3.00500484863528, 58.6350001084663],
        ],
      ],
    ],
  ];

  var polyline = L.polyline(latlngs, { color: "red" }).addTo(map);

  // zoom the map to the polyline
  map.fitBounds(polyline.getBounds());
};

// Gets country name from dropdown list use
$("#countrySelect").on("change", function () {
  console.log("CLICK!");
  let countryName = $("#countrySelect option:selected").text();
  console.log(countryName);
});

// FUNCTION DECLARATIONS
const populateDropdownList = () => {
  $.ajax({
    url: "libraries/php/getCountryList.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      console.log("Country data successfully retrieved");
      let list = $("#countrySelect");
      let sortedCountries = sortCountryName(data.features);
      // Append the sorted names to the list
      $.each(sortedCountries, function (index, feature) {
        list.append("<option>" + feature.properties.name + "</option>");
      });
    },
    error: function () {
      alert("Failed to fetch data");
    },
  });
};

const setMapLocation = (latitude, longitude) => {
  map = L.map("map", {
    layers: [streets],
  }).setView([latitude, longitude], 6);
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon
  layerControl = L.control.layers(basemaps).addTo(map);
  infoBtn.addTo(map);
  // addBorder();
};

// const getCountryCoords = (countryName) => {
//   $.ajax({
//     url: "libraries/php/getCountryCoords.php"
//   })
// }

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const { latitude, longitude } = position.coords;
      // For testing different locations:
      // const latitude = 50;
      // const longitude = 9;

      $.ajax({
        url: "libraries/php/getCountryFromCoords.php?lat=" + latitude + "&lng=" + longitude + "&username=seankennelly",
        type: "GET",
        success: function (data) {
          console.log(data);
          data = JSON.parse(data);
          const countryName = data.countryName;
          console.log(countryName);
          // Updates country dropdown list
          $("#countrySelect").val(countryName).trigger("change");
        },
      });

      // Sets map to user coordinates
      setMapLocation(latitude, longitude);
    });
  } else {
    console.log("Can't get location");
  }
};

// Sort country names for dropdown list
const sortCountryName = (data) => {
  return data.sort(function (a, b) {
    let nameA = a.properties.name;
    let nameB = b.properties.name;
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
};