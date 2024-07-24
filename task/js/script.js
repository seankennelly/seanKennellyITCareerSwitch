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

$(".btn-primary").click(function () {
  // Check which API button has been clicked and update variables accordingly
  const buttonId = this.id;
  const urlArray = [
    "php/getCountryInfo.php",
    "php/findNearestCountry.php",
    "php/timezoneInfo.php",
  ];
  const dataArray = [
    { country: $("#currencyCountry").val() },
    { lat: $("#latitudeCountry").val(), lng: $("#longitudeCountry").val() },
    { lat: $("#latitudeTimezone").val(), lng: $("#longitudeTimezone").val() },
  ];

  // Select API and URL passed to $ajax request
  let urlChoice;
  let dataChoice;
  switch (buttonId) {
    case "btn-currency":
      urlChoice = urlArray[0];
      dataChoice = dataArray[0];
      break;
    case "btn-nearest-country":
      urlChoice = urlArray[1];
      dataChoice = dataArray[1];
      break;
    case "btn-timezones":
      urlChoice = urlArray[2];
      dataChoice = dataArray[2];
  }
  // For debugging only - would be removed for production stage
  console.log("Clicked button ID:", buttonId);
  console.log("url choice is:", urlChoice);
  console.log("Data choice selected:", dataChoice);

  // API Call. Data & PHP URL are passed according to button clicked
  $.ajax({
    url: urlChoice,
    type: "POST",
    dataType: "json",
    data: dataChoice,
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.type === "getCountryInfo") {
        if (result.status.name == "ok") {
          $("#txtCountryCode").html(result["data"][0]["countryCode"]);
          $("#txtCurrency").html(result["data"][0]["currencyCode"]);
        }
      } else if (result.status.type === "findNearestCountry") {
        if (result.data.length === 0) {
          console.log("NO DATA");
          $("#txtCountryName").html(
            "Sorry, GeoNames doesn't have any matching data for those coordinates. Please try some more coordinates."
          );
        } else {
          if (result.status.name == "ok") {
            $("#txtCountryName").html(result["data"][0]["countryName"]);
          }
        }
      } else if (result.status.type === "timezoneInfo") {
        if (!result.data["sunrise"]) {
          console.log("NO DATA");
          $("#txtTimezoneId").html(
            "Sorry, GeoNames doesn't have any matching data for those coordinates. Please try some more coordinates."
          );
          $("#txtGMTOffset").html("NO TIMEZONE DATA");
          $("#txtSunrise").html("NO TIMEZONE DATA");
        } else {
          if (result.status.name == "ok") {
            $("#txtTimezoneId").html(result["data"]["timezoneId"]);
            $("#txtGMTOffset").html(result["data"]["gmtOffset"]);
            $("#txtSunrise").html(result["data"]["sunrise"]);
          }
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("AJAX Error: " + textStatus, errorThrown);
      $("#txtError").html(
        "An error occurred while processing your request. Please try again later."
      );
      $("#txtErrorDetails").html(
        "Status: " + textStatus + "<br>Error: " + errorThrown
      );
    },
  });
});