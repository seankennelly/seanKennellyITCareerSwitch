<?php

  $country_code = $_GET['countryCode'];

  $data = file_get_contents("http://api.geonames.org/searchJSON?formatted=true&country=$country_code&q=airport&username=seankennelly");

  print_r($data);

?>