<?php

namespace Safo\Bundle\DatasBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Safo\Bundle\DatasBundle\CouchDocument\Enseigne;
use Safo\Bundle\DatasBundle\CouchDocument\Categorie;
use Safo\Bundle\DatasBundle\CouchDocument\Client;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
    	$documentClient = $this->container->get('doctrine_couchdb.client.default_connection');
        $documentManager = $this->container->get('doctrine_couchdb.odm.default_document_manager');
        
    	$enseigne = new Enseigne();
		$enseigne->setId('ENS0001');
		$enseigne->libelle = 'Enseigne 1';
		
    	$categorie = new Categorie();
		$categorie->setId('CAT0001');
		$categorie->libelle = 'Categorie 1';
		
		$client = new Client();
		$client->setId('CLI0001');
		$client->libelle = 'Client 1';
		$client->ville = 'ERMONT';
		$client->code_postal = 95120;
		$client->tarif_id = 'TAR0001';
		$client->assortiment_id = 'ASS0001';
		$client->enseigne = $enseigne;
		$client->categorie = $categorie;
		$client->date_modification = new \DateTime();
		
		if ($c = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Client', 'CLI0001')) {
			$documentManager->remove($c);
			$documentManager->flush();
		}
		$documentManager->persist($enseigne);
		$documentManager->persist($categorie);
		$documentManager->persist($client);
		$documentManager->flush();
		
        return $this->render('SafoDatasBundle:Default:index.html.twig', array('name' => $name));
    }
}
