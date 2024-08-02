<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $geonames_api_key = $config['geonames_api_key'];
  $opencage_api_key = $config['opencage_api_key'];
  $country_code = $_GET['countryCode'];
  $open_cage_url = "https://api.opencagedata.com/geocode/v1/json?q=countrycode=$country_code&key=$opencage_api_key";
  $geo_names_url = "http://api.geonames.org/countryInfoJSON?country=$country_code&username=$geonames_api_key";

  $open_cage_data = fetch_data($open_cage_url);
  $geoNames_data = fetch_data($geo_names_url);
  $open_cage_data = json_decode($open_cage_data, true);
  $geoNames_data = json_decode($geoNames_data, true);

  $combinedData = [
      'openCageData' => $open_cage_data,
      'geoNamesData' => $geoNames_data
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);