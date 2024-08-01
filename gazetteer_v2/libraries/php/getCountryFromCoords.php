<?php
  $lat = $_GET['lat'];
  $lng = $_GET['lng'] ;
  $username = $_GET['username'];
  $data = file_get_contents("http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=seankennelly");
  print_r($data);
?>
