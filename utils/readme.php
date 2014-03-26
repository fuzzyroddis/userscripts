#!/usr/bin/php
<?php
/*
	Readme Generator for my Userscript Repository
*/
error_reporting(E_ALL);

function getDetails($str)
{
	$details = array();

	preg_match('#//\s+==UserScript==([\s\S]+?)//\s+==/UserScript==#', $str, $matches);
	$matches = $matches[1];

	preg_match('#// @name\s+(.+)#', $matches, $temp);
	$details['name'] = $temp[1];

	preg_match('#// @description\s+(.+)#', $matches, $temp);
	$details['description'] = $temp[1];

	preg_match('#// @author\s+(.+)#', $matches, $temp);
	$details['author'] = $temp[1];

	return $details;

}

$readme = <<<EOT
Steven's Userscript Collection
==============================
*A collection of userscripts I have created or modified.*
EOT;

$scripts = scandir('../', SCANDIR_SORT_ASCENDING);

foreach($scripts as $script)
{
	if(preg_match('/\.user\.js$/', $script)) //userscripts only
	{
		$file = file_get_contents('../'.$script);
		$details = getDetails($file);

		$readme .= "\n[".$details['name'].'](https://github.com/StevenRoddis/userscripts/blob/master/'.rawurlencode($script).")\n------------"; //name & subheading
		if($details['author'])
			$readme .= "\nAuthor: ".$details['author'];
		if($details['description'])
			$readme .= "\nDescription: ".$details['description'];
		$readme .= "\n\n------------";
	}	
}

file_put_contents('../README.md', $readme);
?>