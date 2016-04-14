EAN=$1
CHEMIN=$2

HELP="Utilisation: upload_images EAN CHEMIN"

if ! test "$EAN"; then
    echo "Le code EAN est requis"
    echo $HELP
    exit;
fi

if ! test "$CHEMIN"; then
    echo "Le chemin de stockage est requis"
    echo $HELP
    exit;
fi

bash bin/get_image.sh $EAN 100 100 > $CHEMIN/"$EAN"_petite.jpg
IS_JPG=$(file -i $CHEMIN/"$EAN"_petite.jpg | grep "image/jpeg;" | wc -l)
if test $IS_JPG == "0"; then
    rm -f $CHEMIN/"$EAN"_petite.jpg
fi

bash bin/get_image.sh $EAN 200 200 > $CHEMIN/"$EAN"_normale.jpg
IS_JPG=$(file -i $CHEMIN/"$EAN"_normale.jpg | grep "image/jpeg;" | wc -l)
if test $IS_JPG == "0"; then
    rm -f $CHEMIN/"$EAN"_normale.jpg
fi