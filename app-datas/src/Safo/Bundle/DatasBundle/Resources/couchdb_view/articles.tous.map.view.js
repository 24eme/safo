function(doc) {
 
    if (doc.classe != "Article") {
        
        return;
    }

    emit([doc.ean13, doc.libelle], 1)
}