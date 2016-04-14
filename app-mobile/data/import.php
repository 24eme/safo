<?php
$file = $argv[1];

$products = array();
foreach (file($file) as $line) {
    $data = str_getcsv($line, "\t");
    if(!$data[0]) {
        continue;
    }
    if(!$data[5]) {
        continue;
    }

    $id = $data[0];
    $name = trim($data[5]);
    $marques = explode(",", $data[10]);
    $categories = explode(",", $data[12]);

    if(!isset($marques[0]) || !trim($marques[0])) {
        continue;
    }

    if(!isset($categories[0]) || !trim($categories[0])) {
        continue;
    }

    if(strlen($categories[0]) < 3) {
        continue;
    }

    if(strlen($marques[0]) < 3) {
        continue;
    }

    $product = array(
        "id" => trim($data[0]),
        "libelle" => $name,
        "marque" => trim($marques[0]),
        "categorie" => trim($categories[0]),
        "assortiment" => round(rand(0,70) / 100),
        "promotion" => round(rand(0,60) / 100),
        "nouveaute" => round(rand(0,60) / 100),
    );

    $products[] = $product;
}


shuffle($products);

$products_final = array();

$i=0;
foreach($products as $product) {
    if($i > 1000) {
        break;
    }
    $products_final[] = $product;
    $i++;
}

echo json_encode($products_final);