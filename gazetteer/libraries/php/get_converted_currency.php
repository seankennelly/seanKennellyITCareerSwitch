<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $exchangerate_api_key = $config['exchangerate_api_key'];

  $user_location_code = $_GET['userLocationCurrencyCode'];
  $url = "https://v6.exchangerate-api.com/v6/$exchangerate_api_key/latest/$user_location_code";
  $data = fetch_data($url);

  print_r($data);
?>