<?php
  $lat = $_GET['lat'];
  $lng = $_GET['lng'];

  // For testing:
  // $lat = 54.7;
  // $lng = 3.27;

  $openMeteoUrl = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lng&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

  $openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lng&appid=5896de22a042e872993b78db37ab2399";

  function callApi($url) {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      $response = curl_exec($ch);
      if (curl_errno($ch)) {
          echo 'Error:' . curl_error($ch);
      }
      curl_close($ch);
      return json_decode($response, true);
  }

  $openMeteoData = callApi($openMeteoUrl);
  $openWeatherData = callApi($openWeatherUrl);
  // Combine the data from both APIs
  $combinedData = [
      'openMeteoData' => $openMeteoData,
      'openWeatherData' => $openWeatherData
  ];

  header('Content-Type: application/json');
  echo json_encode($combinedData);
?>
