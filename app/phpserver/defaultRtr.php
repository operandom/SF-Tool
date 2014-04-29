<?php

function trace() {
	
	$stdout = fopen('php://stdout', 'w');
	
	$message = '';
	
	$numArgs = func_num_args();
	
	if ( $numArgs == 1) {
		$message = func_get_arg(0);
		$type = gettype($message);
		
		if ($type == 'array' || $type == 'object') {
			$message = var_export($message, true);
		}
		
	} elseif ($numArgs > 1) {
		$message = implode(' ', func_get_args());
	}
	
	$time = date('h:m:s',time());
	
	fwrite($stdout, "[TRACE] $time > $message\n");
}


if (is_file($_SERVER['DOCUMENT_ROOT'].DIRECTORY_SEPARATOR.$_SERVER['SCRIPT_NAME'])) {
    return false;
}


$_SERVER['SCRIPT_FILENAME'] = $_SERVER['DOCUMENT_ROOT'].DIRECTORY_SEPARATOR.'app.php';

require 'index.php';

?>
