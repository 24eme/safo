<?php

namespace Safo\Bundle\DatasBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;

use Safo\Bundle\DatasBundle\Lib\CsvFile;
use Safo\Bundle\DatasBundle\CSV\ClientCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Enseigne;
use Safo\Bundle\DatasBundle\CouchDocument\Categorie;
use Safo\Bundle\DatasBundle\CouchDocument\Client;


class ImportClientCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:client')
            ->setDescription('Import de la base client via un fichier csv.')
            ->addArgument('csv', InputArgument::REQUIRED, 'Fichier CSV')
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
    	$documentManager = $this->getContainer()->get('doctrine_couchdb.odm.default_document_manager');
    	$csvFile = new CsvFile($input->getArgument('csv'));
    	
    	$datas = $csvFile->getCsv();
    	foreach ($datas as $data) {    	
    		$client = new Client();
			$client->setId($data[ClientCsvFile::CLIENT_CODE]);
			if ($c = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Client', $client->id)) {
				$client = $c;
			}

            $clientOriginJson = json_encode($client);

			$client->libelle = $data[ClientCsvFile::LIBELLE];
			$client->ville = $data[ClientCsvFile::VILLE];
			$client->code_postal = $data[ClientCsvFile::CODE_POSTAL];
			$client->tarif_id = $data[ClientCsvFile::TARIF_CODE];
			$client->assortiment_id = $data[ClientCsvFile::ASSORTIMENT_CODE];
			$client->date_modification = new \DateTime($data[ClientCsvFile::DATE_MODIFICATION]);
			$client->reg = $data[ClientCsvFile::REG];
			$client->soc = $data[ClientCsvFile::SOC];
			$client->statut = $data[ClientCsvFile::STATUT];
            $client->enseigne = $data[ClientCsvFile::ENSEIGNE_LIBELLE];
			$client->enseigne_id = 'ENSEIGNE-'.$data[ClientCsvFile::ENSEIGNE_CODE];
            $client->categorie = $data[ClientCsvFile::CATEGORIE_LIBELLE];

            if($clientOriginJson == json_encode($client)) {
                $documentManager->detach($client);
                continue;
            }
			
			$documentManager->persist($client);
			
			$output->writeln($client->id);
    	}
		$documentManager->flush();
    }
}
