<?php
$country_code = $_GET['countryCode'];

$open_cage_url = "https://api.opencagedata.com/geocode/v1/json?q=$country_code&key=45a059ef458546b28ac72ee136333f9c";

$geo_names_url = "http://api.geonames.org/countryInfoJSON?country=$country_code&username=seankennelly";

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
};

$open_cage_data = callApi($open_cage_url);
$geoNames_data = callApi($geo_names_url);

$combinedData = [
    'openCageData' => $open_cage_data,
    'geoNamesData' => $geoNames_data
];

header('Content-Type: application/json');
echo json_encode($combinedData);
?>