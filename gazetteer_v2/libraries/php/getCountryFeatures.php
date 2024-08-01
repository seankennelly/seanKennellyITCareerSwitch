<?php

  $north = $_GET['north'];
  $south = $_GET['south'];
  $east = $_GET['east'];
  $west = $_GET['west'];
  $country_code = $_GET['countryCode'];

  $geonames_first_url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&username=seankennelly";

  $geonames_second_url = "http://api.geonames.org/searchJSON?formatted=true&country=$country_code&q=city&username=seankennelly";

  function callApi($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);
    return json_decode($response, true);
  };

  $geonames_data_one = callApi($geonames_first_url);
  $geonames_data_two = callApi($geonames_second_url);

  $combinedData = [
    'citiesData' => $geonames_data_one,
    'secondaryData' => $geonames_data_two,
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);

?>