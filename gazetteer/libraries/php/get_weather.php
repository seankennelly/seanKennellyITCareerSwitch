<?php
  include 'fetch_data.php';
  $config = require 'config.php';
  $openweather_api_key = $config['openweather_api_key'];
  $lat = $_GET['lat'];
  $lng = $_GET['lng'];


  $open_weather_current_url = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lng&units=metric&appid=$openweather_api_key";
  $open_weather_forecast_url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lng&units=metric&appid=$openweather_api_key";

  $open_weather_current_data = fetch_data($open_weather_current_url);
  $open_weather_forecast_data = fetch_data($open_weather_forecast_url);

  $open_weather_current_data = json_decode($open_weather_current_data, true);
  $open_weather_forecast_data = json_decode($open_weather_forecast_data, true);

  // Combine the data from both APIs
  $combinedData = [
      'openWeatherCurrentData' => $open_weather_current_data,
      'openWeatherForecastData' => $open_weather_forecast_data,
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);