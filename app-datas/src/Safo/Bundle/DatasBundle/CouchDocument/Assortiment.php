<?php

namespace Safo\Bundle\DatasBundle\CouchDocument;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * Assortiment
 *
 * @CouchDB\Document
 */
class Assortiment
{
    
    /**
     * @var integer
     *
     * @CouchDB\Id(strategy="ASSIGNED")
     */
    public $id;
    
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
    
}
