#!/bin/bash

. bin/config.inc

DATA_DIR=$1

echo "IMPORT CLIENTS";
php app/console safo-datas:import:client $DATA_DIR/BOKCLIP.csv -v
echo "IMPORT ARTICLES";
php app/console safo-datas:import:article $DATA_DIR/BOKARTP.csv -v
echo "IMPORT TARIFS";
php app/console safo-datas:import:tarifs $DATA_DIR/BOKTARP.csv -v
echo "IMPORT STOCKS";
php app/console safo-datas:import:stocks $DATA_DIR/BOKSTKP.csv -v
echo "IMPORT PROMOS";
php app/console safo-datas:import:promos $DATA_DIR/BOKPROP.csv -v
echo "IMPORT ASSORTIMENTS";
php app/console safo-datas:import:assortiments $DATA_DIR/BOKASSP.csv -v
