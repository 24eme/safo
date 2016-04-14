<?php

namespace Safo\Bundle\DatasBundle\CouchDocument;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * Client
 *
 * @CouchDB\Document
 */
class Client
{
	
	const CLASS_NAME = 'Client';
	
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
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $ville;
    
    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $code_postal;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $tarif_id;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $assortiment_id;

    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $categorie_id;

    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $categorie;

    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $enseigne;

    /** 
     * @var string
     * 
     * @CouchDB\Field(type="string") 
     */
    public $enseigne_id;
    
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
