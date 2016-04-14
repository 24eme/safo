<?php

namespace Safo\Bundle\DatasBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;

use Safo\Bundle\DatasBundle\Lib\CsvFile;
use Safo\Bundle\DatasBundle\Lib\Tools;
use Safo\Bundle\DatasBundle\CSV\TarifCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Tarifs;

class ImportTarifCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:tarifs')
            ->setDescription('Import de la base tarif via un fichier csv.')
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
    	$tarifs = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Tarifs', 'TARIFS');

        if(!$tarifs) {
            $tarifs = new Tarifs();
            $tarifs->setId();
        }

        $tarifs->articles = array();

    	foreach ($datas as $data) {
	    	$tarifs->articles["ARTICLE-".$data[TarifCsvFile::ARTICLE_CODE]][$data[TarifCsvFile::TARIF_CODE]] = array("prix" => Tools::floatize($data[TarifCsvFile::PRIX]), "pvc" => Tools::floatize($data[TarifCsvFile::PVC]));        
    	}
    	
        $documentManager->persist($tarifs);
		$documentManager->flush();
    }
}
