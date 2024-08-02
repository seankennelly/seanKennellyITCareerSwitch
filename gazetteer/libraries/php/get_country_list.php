<?php
  header('Content-Type: application/json');
  $data = file_get_contents('../../data/countryBorders.geo.json');
  echo $data;