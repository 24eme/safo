<?php

namespace Safo\Bundle\DatasBundle\CouchDocument;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * Article
 *
 * @CouchDB\Document
 */
class Article
{
	
	const CLASS_NAME = 'Article';
	
    /**
     * @var string
     *
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    public $id;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $libelle;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $nature;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $ean13;
    
    /** 
     * @var integer
     * 
     * @CouchDB\Field(type="integer") 
     */
    public $pcb;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $type_code;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $type_libelle;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $departement;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $marque;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $secteur;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $rayon;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $famille;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $fournisseur;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $poids_net;
    
    /** 
     * @var boolean
     * 
     * @CouchDB\Field(type="boolean") 
     */
    public $alcool_presence;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $alcool_degre;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $contenance;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $statut;
    
    /** 
     * @var datetime
     * 
     * @CouchDB\Field(type="datetime") 
     */
    public $date_creation;
    
    /** 
     * @var datetime
     * 
     * @CouchDB\Field(type="datetime") 
     */
    public $date_modification;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $reg;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $soc;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $classe;
    
    /** 
     * 
     * @CouchDB\EmbedMany 
     */
    public $tarifs;
    
    /** 
     * 
     * @CouchDB\EmbedMany 
     */
    public $promos;
    
    /** 
     * @var array
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $assortiments;

    /** 
     *
     * @CouchDB\Attachments 
     */
    public $attachments;
    
    public function __construct()
    {
    	$this->classe = $this->getClassName();
    }
    
    public function setId($id)
    {
    	$this->id = strtoupper($this->getClassName()).'-'.$id;
    }
    
    public function getClassName()
    {
    	return self::CLASS_NAME;
    }
}
