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

// --------------------
// GLOBAL DECLARATIONS
// --------------------
let map;
let countryCode;
let countryCoords;
let countryName;
let polyline;

// Tile Layers
const tileLayers = [
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }),
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }),
];

let basemaps = {
  Streets: tileLayers[0],
  Satellite: tileLayers[1],
};

// Buttons
let infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});
let currencyBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

var helloPopup = L.popup().setContent("Hello World!");

// ---------------
// EVENT HANDLERS
// ---------------

// PAGE INITIALISATION
$(document).ready(function () {
  populateDropdownList();
  getUserLocation()
    .then((countryCode) => {
      return getCoordsByCountryCode(countryCode);
    })
    .then((coords) => {
      countryCoords = coords;
      addBorder(countryCoords);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

    $("#countrySelect").on("change", function () {
    const selectedCountryCode = $(this).val();
    handleCountryChange(selectedCountryCode);
  });

  // End initialisation
});

// ----------------------
// FUNCTION DECLARATIONS
// ----------------------
const populateDropdownList = (selectedCountryCode = null) => {
  $.ajax({
    url: "libraries/php/getCountryList.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      console.log("Dropdown populated successfully");
      let list = $("#countrySelect");
      list.empty(); // Clear any existing options
      let sortedCountries = sortCountryName(data.features);
      $.each(sortedCountries, function (index, feature) {
        const countryName = feature.properties.name;
        const countryCode = feature.properties.iso_a2; // Assuming iso_a2 holds the country code
        list.append(`<option value="${countryCode}">${countryName}</option>`);
      });
      if (selectedCountryCode) {
        list.val(selectedCountryCode).trigger("change");
      }
    },
    error: function () {
      alert("Failed to fetch data");
    },
  });
};

// Function returns a Promise as it passes data to getCoordsByCountryCode.
// This was causing an error as they ran in the wrong order.
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const { latitude, longitude } = position.coords;

          $.ajax({
            url: "libraries/php/getCountryFromCoords.php?lat=" + latitude + "&lng=" + longitude + "&username=seankennelly",
            type: "GET",
            success: function (data) {
              console.log(data);
              data = JSON.parse(data);
              const countryName = data.countryName;
              const countryCode = data.countryCode;
              console.log("1: " + countryCode);
              // Updates country dropdown list with selected country code
              populateDropdownList(countryCode);
              // Resolve the Promise with the countryCode
              resolve(countryCode);
            },
          });
          // Sets map to user coordinates
          setMapLocation(latitude, longitude);
        },
        (error) => {
          reject(error); // Reject the Promise with an error
        }
      );
    } else {
      // Reject the Promise if geolocation is not supported
      reject(new Error("Geolocation not supported"));
    }
  });
};

// This may be for initalisation only! Afterwards map will be set with map.fitBounds with border
const setMapLocation = (latitude, longitude) => {
  map = L.map("map", {
    layers: [tileLayers[0]],
  }).setView([latitude, longitude], 6);
  // setView still used, as it means map is loaded before user location processed
  layerControl = L.control.layers(basemaps).addTo(map);
  infoBtn.addTo(map);
  currencyBtn.addTo(map);

  L.easyButton("fa-globe", function (btn, map) {
    helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo(map);
};

const addBorder = (coordArray) => {
  // Remove the existing polyline if it exists
  if (polyline) {
    map.removeLayer(polyline);
  }
  // Add the new polyline
  polyline = L.polyline(coordArray, { color: "red" }).addTo(map);
  map.fitBounds(polyline.getBounds());
};

const handleCountryChange = (countryCode) => {
  getCoordsByCountryCode(countryCode)
    .then((coords) => {
      addBorder(coords);
    })
    .catch((error) => {
      console.error("Error fetching coordinates:", error);
    });
};

const displayCountryInfo = () => {

};

// -----------------
// HELPER FUNCTIONS
// -----------------

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

const getCoordsByCountryCode = (countryCode) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "libraries/php/getCoordsByCountryCode.php",
      type: "GET",
      data: { country_code: countryCode },
      dataType: "json",
      success: function (response) {
        if (response.error) {
          console.log(response.error);
          reject(response.error);
        } else {
          console.log("Coordinates for " + countryCode + ":", response);
          resolve(switchLatLng(response));
        }
      },
      error: function (error) {
        console.error("Error fetching the data:", error);
        reject(error);
      },
    });
  });
};

// Switch Latitude & Longitude into correct format
const switchLatLng = (coordinates) => {
  // Validate that the input is nested arrays
  if (!Array.isArray(coordinates) || coordinates.some((polygon) => !Array.isArray(polygon))) {
    throw new Error("Invalid input: expected an array of arrays.");
  }
  return coordinates.map((polygon) => {
    // Check if the polygon itself is a single array of coordinates
    if (polygon.length > 0 && !Array.isArray(polygon[0][0])) {
      // Treat the polygon as a single array of coordinates
      return polygon.map((coord) => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          throw new Error("Invalid input: expected arrays of latitude and longitude.");
        }
        console.log("Switched!");
        return [coord[1], coord[0]]; // Switch latitude and longitude
      });
    } else {
      // Treat the polygon as an array of arrays of coordinates
      return polygon.map((ring) => {
        if (!Array.isArray(ring) || !ring.every((coord) => Array.isArray(coord) && coord.length === 2)) {
          throw new Error("Invalid input: expected arrays of latitude and longitude.");
        }
        console.log("Switched!");
        return ring.map((coord) => [coord[1], coord[0]]); // Switch latitude and longitude
      });
    }
  });
};
