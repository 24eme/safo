#!/bin/bash

. bin/config.inc

EAN=$1
WIDTH=$2
HEIGHT=$3

HELP="Utilisation: get_images EAN LARGEUR LONGUEUR"

if ! test "$EAN"; then
    echo "Le code EAN est requis"
    echo $HELP
    exit;
fi

if ! test "$WIDTH"; then
    echo "La largeur est requise"
    echo $HELP
    exit;
fi

if ! test "$HEIGHT"; then
    echo "La longueur est requise"
    echo $HELP
    exit;
fi

curl -s $URLIMAGE/$WIDTH/$HEIGHT/$EAN.jpg > /tmp/$EAN.jpg

IS_JPG=$(file -i /tmp/$EAN.jpg | grep "image/jpeg;" | wc -l)

if test $IS_JPG == "0"; then
    echo "ERROR IMAGE $EAN NOT FOUND" >&2
    exit
fi

cat /tmp/$EAN.jpg
rm /tmp/$EAN.jpg > /dev/null 2>&1
