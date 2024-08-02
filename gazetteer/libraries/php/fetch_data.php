<?php
  function fetch_data($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $data = curl_exec($ch);
    if ($data === FALSE) {
        echo "cURL Error: " . curl_error($ch);
    }
    curl_close($ch);
    return $data;
  }
?>
