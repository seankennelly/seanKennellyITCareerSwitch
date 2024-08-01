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
let userLocationCountryCode;
let userLocationCurrencyCode;
let countryCurrencyCode;
let conversionRates = {};
let countryLatitude;
let countryLongitude;
let countryBorders = [];
let airportsLayer;
let landmarksLayer;
let secondaryData;

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
let infoBtn = L.easyButton(
  "fa-info fa-xl",
  function (btn, map) {
    $("#infoModal").modal("show");
  },
  "Country Information"
);
let currencyBtn = L.easyButton(
  "fa-dollar-sign fa-xl",
  function (btn, map) {
    $("#currency-modal").modal("show");
  },
  "Currency Information"
);
let wikiBtn = L.easyButton(
  "fa-wikipedia-w fa-brands fa-xl",
  function (btn, map) {
    $("#wiki-modal").modal("show");
  },
  "Related Wikipedia Articles"
);
let weatherBtn = L.easyButton(
  "fa-sun fa-xl",
  function (btn, map) {
    $("#weather-modal").modal("show");
  },
  "Weather"
);
// let newsBtn = L.easyButton("fa-newspaper fa-xl", function (btn, map) {
//   $("#exampleModal").modal("show");
// });

// ---------------
// EVENT HANDLERS
// ---------------

// PAGE INITIALISATION
$(document).ready(function () {
  populateDropdownList();
  getUserLocation()
    .then((countryCode) => {
      return getCoordsByCountryCode(countryCode).then((coords) => {
        countryCoords = coords;
        addBorder(countryCoords);
        return countryCode;
      });
    })
    .then((countryCode) => {
      console.log("Getting country info...");
      return getCountryInfo(countryCode);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  $("#countrySelect").on("change", function () {
    const selectedCountryCode = $(this).val();
    handleCountryChange(selectedCountryCode);
  });

  $("#user-currency-amount").on("input", convertCurrency);

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
        const countryNamesList = feature.properties.name;
        const countryCode = feature.properties.iso_a2;
        list.append(`<option value="${countryCode}">${countryNamesList}</option>`);
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
            url: "libraries/php/getCountryFromCoords.php?lat=" + latitude + "&lng=" + longitude,
            type: "GET",
            success: function (data) {
              data = JSON.parse(data);
              const countryCode = data.countryCode;
              userLocationCountryCode = countryCode;
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

// const goHome = () => {
//   console.log("GOING HOME");
// }

// This may be for initalisation only! Afterwards map will be set with map.fitBounds with border
const setMapLocation = (latitude, longitude) => {
  map = L.map("map", {
    layers: [tileLayers[0]],
  }).setView([latitude, longitude], 6);
  // setView still used, as it means map is loaded before user location processed
  layerControl = L.control.layers(basemaps).addTo(map);

  // Buttons added to map
  // Info buttons
  let infoBar = L.easyBar([infoBtn, currencyBtn, wikiBtn, weatherBtn]);
  infoBar.addTo(map);
  // Show/Hide Buttons
  let hospitalBtn = L.easyButton(
    "fa-house-medical fa-xl",
    function (btn, map) {
      if (map.hasLayer(hospitalsLayer)) {
        map.removeLayer(hospitalsLayer);
      } else {
        map.addLayer(hospitalsLayer);
      }
    },
    "Show Hospitals"
  );
  let landmarkBtn = L.easyButton(
    "fa-landmark fa-xl",
    function (btn, map) {
      if (map.hasLayer(landmarksLayer)) {
        map.removeLayer(landmarksLayer);
      } else {
        map.addLayer(landmarksLayer);
      }
    },
    "Show Landmarks"
  );
  let airportBtn = L.easyButton(
    "fa-plane fa-xl",
    function (btn, map) {
      if (map.hasLayer(airportsLayer)) {
        map.removeLayer(airportsLayer);
      } else {
        map.addLayer(airportsLayer);
      }
    },
    "Show Airports"
  );

  let showHideBar = L.easyBar([landmarkBtn, hospitalBtn, airportBtn]);
  showHideBar.addTo(map);

  L.easyButton(
    "fa-house fa-xl",
    function (btn, map) {
      handleCountryChange(userLocationCountryCode);
      populateDropdownList(userLocationCountryCode);
    },
    "Go Home"
  ).addTo(map);
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

const addBorder = (coordArray) => {
  // Remove the existing polyline if it exists
  if (polyline) {
    map.removeLayer(polyline);
  }
  // Add the new polyline
  polyline = L.polyline(coordArray, { color: "red" }).addTo(map);
  map.fitBounds(polyline.getBounds());
};

// GET COUNTRY INFO
const getCountryInfo = (countryCode) => {
  $.ajax({
    url: "libraries/php/getCountryInfo.php?countryCode=" + countryCode,
    type: "GET",
    success: function (data) {
      let openCageData = data.openCageData;
      let geoNamesData = data.geoNamesData;
      countryName = geoNamesData.geonames[0].countryName;
      console.log("Country name is: ", countryName);
      // Data for country borders and markers
      // Resets country borders each time function is called
      countryBorders = [];
      countryBorders.push(geoNamesData.geonames[0].north);
      countryBorders.push(geoNamesData.geonames[0].south);
      countryBorders.push(geoNamesData.geonames[0].east);
      countryBorders.push(geoNamesData.geonames[0].west);
      getCountryFeatures(countryBorders, countryCode);
      // Fetch wiki links
      getWikiLinks(countryName);
      // Update Modals
      // Data from GeoNames
      if (geoNamesData.geonames.length > 0) {
        // Update info modal
        $("#capital-city").text(geoNamesData.geonames[0].capital);
        $("#population").text(geoNamesData.geonames[0].population);
        $("#area").text(geoNamesData.geonames[0].areaInSqKm);
        // Update information for currency converter
        if (!userLocationCurrencyCode) {
          userLocationCurrencyCode = geoNamesData.geonames[0].currencyCode;
          $("#user-currency-code").text(userLocationCurrencyCode);
        }
        countryCurrencyCode = geoNamesData.geonames[0].currencyCode;
        $("#selected-country-currency-code").text(countryCurrencyCode);
        getConvertedCurrency(userLocationCurrencyCode);
      } else {
        console.log("GeoNames country information not found.");
        alert("Country info not found");
      }
      // Data from OpenCage
      if (openCageData.results.length > 0) {
        // Update info modal
        // Format some data
        const telephoneCode = "+" + openCageData.results[0].annotations.callingcode;
        const drivingSide = capitaliseWord(openCageData.results[0].annotations.roadinfo.drive_on);
        $("#flag").text(openCageData.results[0].annotations.flag);
        $("#timezone").text(openCageData.results[0].annotations.timezone.name);
        $("#telephone-code").text(telephoneCode);
        $("#driving-side").text(drivingSide);
        $("#speed-unit").text(openCageData.results[0].annotations.roadinfo.speed_in);
        // Update currency modal
        $("#currency-name").text(openCageData.results[0].annotations.currency.name);
        $("#currency-symbol").text(openCageData.results[0].annotations.currency.symbol);
        $("#currency-code").text(openCageData.results[0].annotations.currency.iso_code);
        // Data for Weather modal
        countryLatitude = openCageData.results[0].annotations.DMS.lat;
        countryLongitude = openCageData.results[0].annotations.DMS.lng;
        getWeather(countryLatitude, countryLongitude);
      } else {
        console.log("OpenCage country information not found.");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const getConvertedCurrency = (userLocationCurrencyCode) => {
  $.ajax({
    url: "libraries/php/getConvertedCurrency.php?userLocationCurrencyCode=" + userLocationCurrencyCode,
    type: "GET",
    dataType: "json",
    success: function (data) {
      conversionRates = data.conversion_rates;
      convertCurrency();
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const convertCurrency = () => {
  const amount = parseFloat($("#user-currency-amount").val());
  const convertedAmount = amount * conversionRates[countryCurrencyCode];
  $("#conversion-result").val(convertedAmount);
};

const handleCountryChange = (countryCode) => {
  getCoordsByCountryCode(countryCode)
    .then((coords) => {
      addBorder(coords);
      return countryCode;
    })
    .then((countryCode) => {
      getCountryInfo(countryCode);
      getAirports(countryCode);
      getHospitals(countryCode);
    })
    .catch((error) => {
      console.error("Error fetching coordinates:", error);
    });
};

const getWikiLinks = (countryName) => {
  $.ajax({
    url: "libraries/php/getWikiLinks.php?countryName=" + countryName,
    type: "GET",
    dataType: "json",
    success: function (data) {
      const wikiLinksList = $("#wiki-links-list");
      wikiLinksList.empty();

      if (data.query && data.query.pages) {
        $.each(data.query.pages, function (index, page) {
          const title = page.title;
          const url = "https://en.wikipedia.org/wiki/" + encodeURIComponent(title);
          const listItem = $("<li class='list-group-item'>");
          const anchorProperty = $("<a>").attr("href", url).attr("target", "_blank").attr("rel", "noopener").text(title);
          const target = "target='_blank' rel='noopener'";
          listItem.append(anchorProperty);
          wikiLinksList.append(listItem);
        });
      } else {
        wikiLinksList.append("<li>No results found</li>");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const getWeather = (countryLatitude, countryLongitude) => {
  countryLatitude = convertDMS(countryLatitude);
  countryLongitude = convertDMS(countryLongitude);
  $.ajax({
    url: "libraries/php/getWeather.php?lat=" + countryLatitude + "&lng=" + countryLongitude,
    type: "GET",
    dataType: "json",
    success: function (data) {
      let openMeteoData = data.openMeteoData;
      let openWeatherData = data.openWeatherData;
      // Open Meteo Data
      if (openMeteoData) {
        // Format data
        const temperature = openMeteoData.current.temperature_2m + " °C";
        $("#temperature").text(temperature);
      } else {
        console.log("Weather information not found.");
        alert("Weather info not found");
      }
      // Open Weather Data
      if (openWeatherData) {
        // Format data
        weatherDescription = capitaliseWord(openWeatherData.weather[0].description);
        $("#weather-type").text(weatherDescription);
        let windSpeed;
        if (openWeatherData.wind.speed) {
          windSpeed = openWeatherData.wind.speed + " km/h";
        } else {
          windSpeed = "No data to show";
        }
        $("#wind-speed").text(windSpeed);
        let windGust;
        if (openWeatherData.wind.gust) {
          windGust = openWeatherData.wind.gust + " km/h";
        } else {
          windGust = "No data to show";
        }
        $("#wind-gust").text(windGust);
        const humidity = openWeatherData.main.humidity + "%";
        $("#humidity").text(humidity);
      } else {
        console.log("Weather information not found.");
        alert("Weather info not found");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const getCountryFeatures = (countryBorders, countryCode) => {
  let north = countryBorders[0];
  let south = countryBorders[1];
  let east = countryBorders[2];
  let west = countryBorders[3];
  $.ajax({
    url: "libraries/php/getCountryFeatures.php?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&countryCode=" + countryCode,
    type: "GET",
    dataType: "json",
    success: function (data) {
      let citiesData = data.citiesData.geonames;
      secondaryData = data.secondaryData.geonames;

      if (secondaryData) {
        // Splitting Data in secondaryData. This splits data into arrays based on feature type (city, landmark etc)
        const separatedFeatures = {};
        secondaryData.forEach((city) => {
          const fcl = city.fcl;
          if (!separatedFeatures[fcl]) {
            separatedFeatures[fcl] = [];
          }
          separatedFeatures[fcl].push(city);
        });
        const separatedFeaturesData = Object.values(separatedFeatures);
        // End data split

        // Combined cities data from both both data sets
        separatedFeaturesData[0].forEach((feature) => {
          const cityExists = citiesData.some((city) => city.name === feature.name);
          if (!cityExists) {
            citiesData.push(feature);
          }
        });

        let citiesArray = citiesData.map((city) => {
          const cityObject = {
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            population: city.population,
          };
          if (city.wikipedia) {
            cityObject.wiki = "https://" + city.wikipedia;
          }
          return cityObject;
        });

        // Create and add markers
        const cityMarker = L.ExtraMarkers.icon({
          icon: "fa-city",
          markerColor: "blue",
          shape: "circle",
          prefix: "fa",
        });
        let citiesLayer = L.markerClusterGroup();
        citiesArray.forEach((city) => {
          let marker = L.marker([city.lat, city.lng], { icon: cityMarker });
          let popupContent = `<b>${city.name}</b><p>Population: ${city.population}</p>`;
          if (city.wiki) {
            popupContent += `<p><a href='${city.wiki}' target='_blank' rel='noopener'>Wikipedia</a></p>`;
          }
          marker.bindPopup(popupContent);
          citiesLayer.addLayer(marker);
        });
        citiesLayer.addTo(map);

        // Passes data to next function
        // This is to ensure separation of concerns and keep functions readable
        getLandmarks(separatedFeaturesData);
      } else {
        console.log("City information not found.");
        alert("City info not found");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const getLandmarks = (data) => {
  // Only process data if there is more than one array, as the first array was already handled in getCountryFeatures()
  let miscLandmarksData = [];
  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      miscLandmarksData.push(...data[i]);
    }
  } else {
    miscLandmarksData = [...data[0]];
  }

  let combinedLandmarksArray = [];
  // Filters out airports ( junk data as better data is used for getAiports() )
  // Filters out administrative authorities ( junk data as these match cities handled in getCountryFeatures() )
  miscLandmarksData.forEach((landmark) => {
    if (landmark.fcodeName !== "airport" && landmark.fcl !== "A") {
      combinedLandmarksArray.push(landmark);
    }
  });

  let landmarksArray = combinedLandmarksArray.map((landmark) => {
    const landmarkObject = {
      name: landmark.toponymName,
      lat: landmark.lat,
      lng: landmark.lng,
      description: capitaliseWord(landmark.fcodeName),
    };
    return landmarkObject;
  });

  const landmarkMarker = L.ExtraMarkers.icon({
    icon: "fa-landmark",
    markerColor: "yellow",
    shape: "square",
    prefix: "fa",
  });

  landmarksLayer = L.markerClusterGroup();
  landmarksArray.forEach((landmark) => {
    let marker = L.marker([landmark.lat, landmark.lng], { icon: landmarkMarker });
    marker.bindPopup(`<b>${landmark.name}</b><p>${landmark.description}</p>`);
    landmarksLayer.addLayer(marker);
  });
};

const getAirports = (countryCode) => {
  $.ajax({
    url: "libraries/php/getAirports.php?countryCode=" + countryCode,
    type: "GET",
    dataType: "json",
    success: function (data) {
      if (data) {
        const airportData = data.geonames;
        let airportsArray = airportData.map((airport) => ({
          name: airport.name,
          lat: airport.lat,
          lng: airport.lng,
        }));

        const airportMarker = L.ExtraMarkers.icon({
          icon: "fa-plane",
          markerColor: "green",
          shape: "square",
          prefix: "fa",
        });

        // Layer
        airportsLayer = L.markerClusterGroup();
        airportsArray.forEach((airport) => {
          let marker = L.marker([airport.lat, airport.lng], { icon: airportMarker });
          marker.bindPopup(`<b>${airport.name}</b>`);
          airportsLayer.addLayer(marker);
        });
      } else {
        console.log("Airport information not found.");
        alert("Airport info not found");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
};

const getHospitals = (countryCode) => {
  $.ajax({
    url: "libraries/php/getHospitals.php?countryCode=" + countryCode,
    type: "GET",
    dataType: "json",
    success: function (data) {
      if (data) {
        const hospitalData = data.geonames;
        let hospitalsArray = hospitalData.map((hospital) => ({
          name: hospital.name,
          lat: hospital.lat,
          lng: hospital.lng,
        }));

        const hospitalMarker = L.ExtraMarkers.icon({
          icon: "fa-house-medical",
          markerColor: "red",
          shape: "square",
          prefix: "fa",
        });

        // Layer
        hospitalsLayer = L.markerClusterGroup();
        hospitalsArray.forEach((hospital) => {
          let marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalMarker });
          marker.bindPopup(`<b>${hospital.name}</b>`);
          hospitalsLayer.addLayer(marker);
        });
      } else {
        console.log("Hospital information not found.");
        alert("Hospital info not found");
      }
    },
    error: function (error) {
      console.error("Error fetching data:", error);
    },
  });
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

const capitaliseWord = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
        return [coord[1], coord[0]]; // Switch latitude and longitude
      });
    } else {
      // Treat the polygon as an array of arrays of coordinates
      return polygon.map((ring) => {
        if (!Array.isArray(ring) || !ring.every((coord) => Array.isArray(coord) && coord.length === 2)) {
          throw new Error("Invalid input: expected arrays of latitude and longitude.");
        }
        return ring.map((coord) => [coord[1], coord[0]]); // Switch latitude and longitude
      });
    }
  });
};

// Converts OpenCage coordinates from DMS to Lat/Lng
function convertDMS(dms) {
  if (typeof dms !== "string") {
    throw new Error("Input must be a string");
  }
  const parts = dms.match(/(\d+)°\s(\d+)'\s([\d.]+)''\s([NSEW])/);
  if (!parts) {
    throw new Error(`Invalid DMS format: ${dms}`);
  }
  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);
  const direction = parts[4];
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }
  return decimal;
}
