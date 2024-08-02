<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $geonames_api_key = $config['geonames_api_key'];
  $lat = $_GET['lat'];
  $lng = $_GET['lng'] ;
  $url = "http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=$geonames_api_key";

  $data = fetch_data($url);
  print_r($data);
?>
