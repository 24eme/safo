<?php
namespace Safo\Bundle\DatasBundle\Lib;

class Tools
{
	public static function floatize($value)
	{
		return (trim($value))? floatval(str_replace(',', '.', $value)) : 0;
	}
}