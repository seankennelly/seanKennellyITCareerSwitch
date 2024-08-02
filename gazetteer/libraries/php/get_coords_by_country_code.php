<?php
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);

  header('Content-Type: application/json');

  if (isset($_GET['countryCode'])) {
      $country_code = $_GET['countryCode'];
      
      $json_file_path = '../../data/countryBorders.geo.json';
      if (!file_exists($json_file_path) || !is_readable($json_file_path)) {
          echo json_encode(["error" => "JSON file not found or not readable."]);
          exit;
      }

      $json_data = file_get_contents($json_file_path);
      if ($json_data === false) {
          echo json_encode(["error" => "Error reading JSON file."]);
          exit;
      }

      $data = json_decode($json_data, true);
      if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
          echo json_encode(["error" => "Error decoding JSON data: " . json_last_error_msg()]);
          exit;
      }

      if (!isset($data['features']) || !is_array($data['features'])) {
          echo json_encode(["error" => "Invalid JSON structure: 'features' not found or not an array."]);
          exit;
      }

      $result = array_filter($data['features'], function($feature) use ($country_code) {
          return isset($feature['properties']['iso_a2']) && $feature['properties']['iso_a2'] === $country_code;
      });

      if (!empty($result)) {
          $result = array_values($result); // Reset array keys
          echo json_encode($result[0]['geometry']['coordinates']);
      } else {
          echo json_encode(["error" => "Country code not found."]);
      }
  } else {
      echo json_encode(["error" => "No country code provided."]);
  }