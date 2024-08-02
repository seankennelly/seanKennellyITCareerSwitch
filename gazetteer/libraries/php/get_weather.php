<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $openweather_api_key = $config['openweather_api_key'];
  $lat = $_GET['lat'];
  $lng = $_GET['lng'];

  $openMeteoUrl = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lng&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

  $openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lng&appid=$openweather_api_key";

  $openMeteoData = fetch_data($openMeteoUrl);
  $openWeatherData = fetch_data($openWeatherUrl);
  $openMeteoData = json_decode($openMeteoData, true);
  $openWeatherData = json_decode($openWeatherData, true);
  // Combine the data from both APIs
  $combinedData = [
      'openMeteoData' => $openMeteoData,
      'openWeatherData' => $openWeatherData
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);