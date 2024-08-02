<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $gnews_api_key = $config['gnews_api_key'];
  $country_code = $_GET['countryCode'];
  
  $url = "https://gnews.io/api/v4/top-headlines?category=general&country=$country_code&max=10&apikey=$gnews_api_key";

  $data = fetch_data($url);
  print_r($data);