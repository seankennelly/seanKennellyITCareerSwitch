<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $geonames_api_key = $config['geonames_api_key'];

  $north = $_GET['north'];
  $south = $_GET['south'];
  $east = $_GET['east'];
  $west = $_GET['west'];
  $country_code = $_GET['countryCode'];
  $geonames_first_url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&username=$geonames_api_key";
  $geonames_second_url = "http://api.geonames.org/searchJSON?formatted=true&country=$country_code&q=city&username=$geonames_api_key";

  $geonames_data_one = fetch_data($geonames_first_url);
  $geonames_data_two = fetch_data($geonames_second_url);
  $geonames_data_one = json_decode($geonames_data_one, true);
  $geonames_data_two = json_decode($geonames_data_two, true);

  $combinedData = [
    'citiesData' => $geonames_data_one,
    'secondaryData' => $geonames_data_two,
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);

?>