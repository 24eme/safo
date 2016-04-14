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
use Safo\Bundle\DatasBundle\CSV\PromoCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Promos;

class ImportPromoCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:promos')
            ->setDescription('Import de la base promo via un fichier csv.')
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
    	$promos = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Promos', 'PROMOS');

        if(!$promos) {
            $promos = new Promos();
            $promos->setId();
        }

        $promos->articles = array();

    	foreach ($datas as $data) {
            $key = ((trim($data[PromoCsvFile::ENSEIGNE_CODE])) ? "ENSEIGNE-".$data[PromoCsvFile::ENSEIGNE_CODE] : ((trim($data[PromoCsvFile::CLIENT_CODE])) ? "CLIENT-".$data[PromoCsvFile::CLIENT_CODE] : null));

            if(!$key) {
                continue;
            }

	    	$promos->articles['ARTICLE-'.$data[PromoCsvFile::ARTICLE_CODE]][$key] = Tools::floatize($data[PromoCsvFile::PRIX]);
    	}
    	
        $documentManager->persist($promos);
		$documentManager->flush();
    }
}
