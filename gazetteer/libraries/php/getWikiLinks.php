<?php
  $country_name = $_GET['countryName'];

  $data = file_get_contents("https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch=" . urlencode($country_name));

  $decoded_data = json_decode($data, true); 

  echo json_encode($decoded_data);
?>
