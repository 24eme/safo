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
use Safo\Bundle\DatasBundle\CSV\AssortimentCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Assortiment;
use Safo\Bundle\DatasBundle\CouchDocument\Article;


class ImportAssortimentCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:assortiments')
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
    	$assortiments = array();
    	foreach ($datas as $data) {
			$assortiments[$data[AssortimentCsvFile::ARTICLE_CODE]][$data[AssortimentCsvFile::ASSORTIMENT_CODE]] = $data[AssortimentCsvFile::ASSORTIMENT_CODE];
    	}

    	foreach ($assortiments as $articleId => $assortimentsArticle) {
            ksort($assortimentsArticle);
    		if ($article = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Article', 'ARTICLE-'.$articleId)) {
                if(json_encode($article->assortiments) == json_encode($assortimentsArticle)) {
                    $documentManager->detach($article);
                    continue;   
                }
				$article->assortiments = $assortimentsArticle;
				$documentManager->persist($article);
				$output->writeln($article->id);
			}
    	}
		$documentManager->flush();
    }
}
