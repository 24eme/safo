<?php

namespace Safo\Bundle\DatasBundle\CouchDocument;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * Promos
 *
 * @CouchDB\Document
 */
class Promos
{
    const CLASS_NAME = 'Promos';

    /**
     * @var integer
     *
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    public $id;
    
    /** 
     * @var mixed
     * 
     * @CouchDB\Field(type="mixed") 
     */
    public $articles;

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
    
    public function setId()
    {
        $this->id = strtoupper($this->getClassName());
    }
    
    public function getClassName()
    {
        return self::CLASS_NAME;
    }
    
}
