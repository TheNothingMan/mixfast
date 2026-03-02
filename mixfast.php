<?php
session_start();
$dir=$_GET['dir'];
$title=str_replace("_", " ", $dir);
if(!isset($_SESSION['loggedin'])) {
    $_SESSION['origin_url']="http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	header("Location: login.php");
}
?>
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<?php echo "<title>".$title."</title>" ?>
	<link rel = "stylesheet" type = "text/css" href = "mix.css" />
	<script type="text/javascript" src="mixfast.js"></script>
</head>
<body>
	<div id="caption_wrap">
		<a id="caption"><?php echo $title ?></a>
		<img id="loading-gif" src="loading.gif" alt="Loading">
	</div>
	<div id="control">
		<div id="custom">
			<button data-playing="false" role="switch" aria-checked="false">
				<a id="buttonText">&#9654;</a>
			</button>
			<a id="current">--:--/--:--</a>
			<div style="position: relative;">
				<div id="loopmarker"></div>
				<input type="range" id="seekbar"/>
			</div>
		</div>
		<div id="loop-wrapper">
			<a>Loop?</a>
			<input type="checkbox" id="loop"/>
			<input type="text" ondrop="drop(event,this,false)" ondragover="allowDrop(event)" id="loopStart"/>
			<input type="text" ondrop="drop(event,this,true)" ondragover="allowDrop(event)" id="loopEnd"/>
			<a class="nav-button" onclick="setStart()">Set start</a>
			<a class="nav-button" onclick="setEnd()">Set end</a>
		</div>
	</div>
	<?php
	if (file_exists($dir."/bookmarks.txt")) {
		echo '<div id="navigation"><a>Navigation:</a>';
		$fn = fopen($dir."/bookmarks.txt","r");
		while(! feof($fn))  {
			$line = fgets($fn);
			$bookmark = explode(":", $line);
			echo "<a class='nav-button' draggable='true' ondragstart='drag(event,".$bookmark[0].")' onclick='jumpTo(".$bookmark[0].")'>".$bookmark[1]."</a>";
		}
		fclose($fn);
		echo "</div>";
	}
	?>
	<div id="master-controls">
	<a>Master:</a>
	<input type='range' id='master' min='0' max='3' value='1' step='0.01'/>
	<a class="mixbutton" onclick="reset()">Reset mixer</a>
	<a class="mixbutton mute" onclick="unMuteAll()">Mute off</a>
	<a class="mixbutton solo" onclick="unSoloAll()">Solo off</a>
	</div>
	<?php
		$phpfiles = glob($dir."/*.{mp3}",GLOB_BRACE);
		echo "<div class='content-inner'>";
		natsort($phpfiles);
		$i = 0;
		foreach($phpfiles as $phpfile)
		{	$phpfile = utf8_encode($phpfile);
			echo "<div class='track'>";
			#echo "<a class='mixbutton view' name='".$i."' onclick='view(\"".$dir."/PDF/".basename($phpfile,".mp3").".pdf\")'>V</a>".
			#echo "<img class='mixbutton view' src='note.svg' name='".$i."' onclick='view(\"pdfjs/web/viewer.html?file=../../".$dir."/".basename($phpfile,".mp3").".pdf\")'/>".
			echo "<a class='mixbutton download' href='".$phpfile."' download='".$title."_".basename($phpfile,".mp3")."'><img class='download_pic' src='download.svg'/></a>".
			"<a class='tracklane'>".basename($phpfile,".mp3")."</a>".
			"<p class='loading-text'>Loading...</p>".
			"<a class='mixbutton solo' name=".$i."' onclick='solo(this)'>S</a>".
			"<a class='mixbutton mute' name=".$i."' onclick='mute(this)'>M</a>".
			"<audio playsinline preload='auto' src='"
			.$phpfile."' type='audio/ffmpeg'></audio><input type='range' id='volume"
			.$i."' min='0' max='3' value='2' step='0.01'><br>";
			$i += 1;
			echo "</div>";
		}
		echo "</div>";
		$pdffiles = glob($dir."/*.{pdf}",GLOB_BRACE);
		if (count($pdffiles) > 0) {
			echo "<div id='pdf_controls'>";
			echo "<label for='pdf_selector'>Noten auswählen:</label>";
			echo "<select id='pdf_selector' onclick='view(this.value)'>".
			"<option value='' disabled selected hidden>Noten auswählen</option>";
			natsort($pdffiles);
			foreach($pdffiles as $pdffile)
			{	$pdffile = utf8_encode($pdffile);
				echo "<option value='pdfjs/web/viewer.html?file=../../".$dir."/".basename($pdffile)."'>".basename($pdffile)."</option>";
			}
			echo "</select>";
			echo "</div>";
			echo "<iframe id='viewer' src='' type='application/pdf'/>";
		}
	?>
	<div class="viewer_wrapper"><embed id="viewer" src="Carol_of_the_bells/PDF/01_Floete_.pdf" type="application/pdf"/></div>
	
</body>
</html>