#!/bin/bash

. bin/config.inc

UPLOAD_PATH=$1

curl -s $URLVIEWARTICLE | cut -d "," -f 2 | sed 's/"key":\[//' | grep -E "^[0-9]" | while read EAN  
do
    bash bin/upload_image.sh $EAN $1
done
