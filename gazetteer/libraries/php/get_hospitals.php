<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $geonames_api_key = $config['geonames_api_key'];
  $country_code = $_GET['countryCode'];

  $url = "http://api.geonames.org/searchJSON?formatted=true&country=$country_code&q=hospital&username=$geonames_api_key";

  $data = fetch_data($url);
  print_r($data);
?>