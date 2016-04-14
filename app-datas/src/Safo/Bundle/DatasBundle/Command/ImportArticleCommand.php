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
use Safo\Bundle\DatasBundle\Lib\KeyInflector;
use Safo\Bundle\DatasBundle\CSV\ArticleCsvFile;
use Safo\Bundle\DatasBundle\CouchDocument\Marque;
use Safo\Bundle\DatasBundle\CouchDocument\Secteur;
use Safo\Bundle\DatasBundle\CouchDocument\Rayon;
use Safo\Bundle\DatasBundle\CouchDocument\Famille;
use Safo\Bundle\DatasBundle\CouchDocument\Fournisseur;
use Safo\Bundle\DatasBundle\CouchDocument\Article;


class ImportArticleCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
            ->setName('safo-datas:import:article')
            ->setDescription('Import de la base article via un fichier csv.')
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

        $imagesPath = dirname($input->getArgument('csv'))."/../images_uploaded";
    	
    	$datas = $csvFile->getCsv();
    	foreach ($datas as $data) {    	
    		$article = new Article();
			$article->setId($data[ArticleCsvFile::ARTICLE_CODE]);
			if ($a = $documentManager->find('Safo\Bundle\DatasBundle\CouchDocument\Article', $article->id)) {
				$article = $a;
			}

            $md5AttachementsOrigin = $this->getMd5Attachments($article);
            $articleOriginJson = json_encode($article);

			$article->libelle = $data[ArticleCsvFile::LIBELLE];
			$article->date_creation = new \DateTime($data[ArticleCsvFile::DATE_CREATION]);
			$article->date_modification = new \DateTime($data[ArticleCsvFile::DATE_MODIFICATION]);
			$article->reg = $data[ArticleCsvFile::REG];
			$article->soc = $data[ArticleCsvFile::SOC];
			$article->statut = $data[ArticleCsvFile::STATUT];
			$article->nature = $data[ArticleCsvFile::NATURE];
			$article->ean13 = trim($data[ArticleCsvFile::EAN13]);
			$article->pcb = (int)$data[ArticleCsvFile::PCB];
			$article->type_code = $data[ArticleCsvFile::TYPE_CODE];
			$article->type_libelle = $data[ArticleCsvFile::TYPE_LIBELLE];
			$article->departement = $data[ArticleCsvFile::DEPARTEMENT];
			$article->poids_net = Tools::floatize($data[ArticleCsvFile::POIDS_NET]);
			$article->alcool_presence = ($data[ArticleCsvFile::ALCOOL_PRESENCE] == 'O') ? true : false;
			$article->alcool_degre = Tools::floatize($data[ArticleCsvFile::ALCOOL_DEGRE]);
			$article->contenance = Tools::floatize($data[ArticleCsvFile::CONTENANCE]);
            $article->marque = $data[ArticleCsvFile::MARQUE];
            $article->secteur = $data[ArticleCsvFile::SECTEUR_LIBELLE];
            $article->rayon = $data[ArticleCsvFile::RAYON_LIBELLE];
            $article->famille = $data[ArticleCsvFile::FAMILLE_LIBELLE];;
            $article->fournisseur = $data[ArticleCsvFile::FOURNISSEUR_LIBELLE];
            
            $article->attachments = null;

            $this->loadImage($article, $imagesPath, "petite");
            $this->loadImage($article, $imagesPath, "normale");

            $md5Attachements = $this->getMd5Attachments($article);

            if($articleOriginJson == json_encode($article) && $md5Attachements == $md5AttachementsOrigin) {
                $documentManager->detach($article);
                continue;
            }

		    $documentManager->persist($article);
      	    $output->writeln($article->id);
    	}
		
        $documentManager->flush();
    }

    protected function getMd5Attachments($article) {

        if(!isset($article->attachments["petite.jpg"])) {

            return null;
        }

        if(!isset($article->attachments["normale.jpg"])) {

            return null;
        }

        return md5($article->attachments["petite.jpg"]->getRawData()).md5($article->attachments["normale.jpg"]->getRawData());
    }

    protected function loadImage($article, $imagesPath, $key) {
        $imageFilePath = $imagesPath . "/" . $article->ean13 . "_" . $key . ".jpg";

        if(file_exists($imageFilePath)) {
            if(!file_get_contents($imageFilePath)) {

                return;
            }
            $fh = fopen($imageFilePath, 'r');
            $article->attachments[$key.'.jpg'] = \Doctrine\CouchDB\Attachment::createFromBinaryData($fh, 'image/jpg');
            fclose($fh);
        }
    }
}
