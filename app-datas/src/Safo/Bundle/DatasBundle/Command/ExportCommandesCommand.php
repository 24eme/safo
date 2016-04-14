<?php

namespace Safo\Bundle\DatasBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;

use Doctrine\CouchDB\CouchDBClient;
use Doctrine\ODM\CouchDB\DocumentManager;



class ExportCommandesCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:export:commandes')
            ->setDescription('Export des commandes')
            ->addOption('target', null, InputOption::VALUE_REQUIRED, 'Chemine de destination du fichier CSV')
            ->setHelp(<<<EOF
Appel de la commande <info>%command.name%</info> :

<info>php %command.full_name%</info>

Argument obligatoire:

<info>php %command.full_name%</info> csv file
EOF
            );
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
    	$documentClient = CouchDBClient::create(array('dbname' => 'safo-orders'));
    	$documentManager = $this->getContainer()->get('doctrine_couchdb.odm.default_document_manager');
    	
    	$date = new \DateTime();
    	$fileName = $input->getOption('target').$date->format('YmdHis').'_commandes.csv';
    	$docs = $documentClient->allDocs();
    	
    	
    	$com = $documentClient->findDocument('COMMANDES');

        if($com->status == 404) {
            $com = array();
            $com['_id'] = 'COMMANDES';
            $com['envoyees'] = array();
            $com['type'] = 'Commandes';
        } else {
        	$com = $com->body;
        }
    	$squeeze = array_keys($com['envoyees']);
    	
    	$commandes = $docs->body['rows'];
    	$contentFile = '';
    	$commandesConfirmes = array();
	    	foreach ($commandes as $commande) {
	    		$commande = $commande['doc'];
	    		if ($commande['type'] == 'Commandes') {
	    			continue;
	    		}
	    		if (in_array($commande['_id'], $squeeze)) {
	    			if ($commande['_rev'] == $com['envoyees'][$commande['_id']]) {
	    				continue;
	    			}
	    		}
	    		$commandesConfirmes[] = $commande;
	    		if ($contentFile) {
	    			$contentFile .= "\r\n";
	    		}
	    		$contentFile .= $this->format($this->getVendeurInfos($commande), 80, " ");
	    		$contentFile .= "\r\n";
	    		$contentFile .= $this->format($this->getClientInfos($commande), 80, " ");
	    		$contentFile .= "\r\n";
	    		$contentFile .= $this->format($this->getArticlesInfos($commande), 80, " ");
	    		$contentFile .= "\r\n";
	    		$contentFile .= $this->format($this->getCommandeInfos($commande), 80, " ");
	    	}
	    	$contentFile .= "\r\n";
	    	if (count($commandesConfirmes) > 0) {
		    	if ($this->writeFile($fileName, $contentFile)) {
		    		$nbCommandes = 0;
		    		foreach ($commandesConfirmes as $commandeConfirme) {
		    			$com['envoyees'][$commandeConfirme['_id']] = $commandeConfirme['_rev'];
		    			$nbCommandes++;
		    		}
		    		$documentClient->putDocument($com, 'COMMANDES');
		    		$output->writeln($nbCommandes.' Commande(s) traitee(s)');
		    	} else {
		    		$output->writeln('Erreur ecriture fichier');
		    	}
	    	} else {
	    		$output->writeln('Aucune commande a traiter');
    		}
    }
    
    protected function getVendeurInfos($commande)
    {
    	$result = 'A';
    	//$result .= ';';
    	$result .= $this->format($commande['client']['soc'], 2);
    	//$result .= ';';
    	$result .= $commande['identifiant'];
    	//$result .= ';';
    	$result .= $this->format(0, 2);
    	return $result;
    }
    
    protected function getClientInfos($commande)
    {
    	$result = 'B';
    	//$result .= ';';
    	$result .= $this->format($commande['client']['soc'], 2);
    	//$result .= ';';
    	$result .= $commande['identifiant'];
    	//$result .= ';';
    	$result .= $this->format(str_replace('CLIENT-', '', $commande['client_id']), 8, " ");
    	return $result;    	
    }
    
    protected function getArticlesInfos($commande)
    {
    	$result = '';
    	foreach ($commande['produits'] as $produit) {
    		if ($result) {
    			$result .= "\r\n";
    		}
    		$result .= 'D';
	    	//$result .= ';';
	    	$result .= $this->format($commande['client']['soc'], 2);
	    	//$result .= ';';
	    	$result .= $commande['identifiant'];
	    	//$result .= ';';
	    	$result .= $this->format(str_replace('ARTICLE-', '', $produit['_id']), 13, " ");
	    	//$result .= ';';
	    	$result .= $this->format($produit['prix'] * 100, 9);
	    	//$result .= ';';
	    	$result .= 'I';
	    	//$result .= ';';
	    	$result .= 'O';	    	
	    	//$result .= ';';
	    	$result .= $this->format($produit['quantity'], 9);
	    	//$result .= ';';
	    	//$result .= '';
    	}
    	return $result;
    }
    
    protected function getCommandeInfos($commande)
    {
    	$date = '';
    	if ($commande['date_livraison']) {
    		$d = new \DateTime($commande['date_livraison']);
    		$date = $d->format('Ymd');
    	}
    	$result = 'C';
    	//$result .= ';';
    	$result .= $this->format($commande['client']['soc'], 2);
    	//$result .= ';';
    	$result .= $commande['identifiant'];
    	//$result .= ';';
    	$result .= $date;
    	//$result .= ';';
    	$result .= (isset($commande['commentaire']))? $this->format($commande['commentaire'], 30, " ") : $this->format("", 30, " ");
    	//$result .= ';';
    	$result .= 'L';
    	return $result;
    	
    }
    
    protected function format($val, $nbChar, $token = "0")
    {
    	return ($token === "0")? str_pad($val, $nbChar, $token, STR_PAD_LEFT) : str_pad($val, $nbChar, $token, STR_PAD_RIGHT);
    }
    
    protected function writeFile($fileName, $contentFile)
    {
        if(!$contentFile) {
            return;
        }

		return file_put_contents($fileName, $contentFile, LOCK_EX);
    }

   
}
