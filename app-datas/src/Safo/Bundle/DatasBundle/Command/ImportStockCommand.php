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
use Safo\Bundle\DatasBundle\CSV\StockCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Stocks;

class ImportStockCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:stocks')
            ->setDescription('Import de la base stock via un fichier csv.')
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
        $stocks = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Stocks', 'STOCKS');

        if(!$stocks) {
            $stocks = new Stocks();
            $stocks->setId();
        }

        $stocks->articles = array();

        foreach ($datas as $data) {
            $stocks->articles["ARTICLE-".$data[StockCsvFile::ARTICLE_CODE]] = array(
                "stock_co" => Tools::floatize($data[StockCsvFile::STOCK_CO]), 
                "stock_uc" => Tools::floatize($data[StockCsvFile::STOCK_UC])
            );       
        }
        
        $documentManager->persist($stocks);
        $documentManager->flush();
    }
}
