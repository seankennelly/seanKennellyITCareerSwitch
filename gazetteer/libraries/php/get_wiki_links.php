<?php
  include 'fetch_data.php';
  $country_name = $_GET['countryName'];

  $url = "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch=" . urlencode($country_name);

  $data = fetch_data($url);

  if ($data === false) {
    echo "Error fetching data from Wikipedia API.";
    exit;
  }
  $decoded_data = json_decode($data, true);
  echo json_encode($decoded_data);
?>