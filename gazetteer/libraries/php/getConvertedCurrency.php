<?php
$user_location_code = $_GET['userLocationCurrencyCode'];

$url = "https://v6.exchangerate-api.com/v6/dd2998bb505ac4bfd9a6ec30/latest/$user_location_code";

// Function to call an API and return the response
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

$currencyData = callApi($url);

// Return the combined data as JSON
header('Content-Type: application/json');
echo json_encode($currencyData);
?>