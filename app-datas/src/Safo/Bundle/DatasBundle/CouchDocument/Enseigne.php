<?php

namespace Safo\Bundle\DatasBundle\CouchDocument;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * Enseigne
 *
 * @CouchDB\Document
 */
class Enseigne
{
	
	const CLASS_NAME = 'Enseigne';
	
    /**
     * @var integer
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
