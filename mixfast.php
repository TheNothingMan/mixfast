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
	<script type="text/javascript" src="mixfast_debug.js"></script>
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
	</div></div>
	<?php
		$phpfiles = glob($dir."/*.{mp3}",GLOB_BRACE);
		echo "<div class='content-inner'>";
		natsort($phpfiles);
		$i = 0;
		foreach($phpfiles as $phpfile)
		{	$phpfile = utf8_encode($phpfile);
			echo "<div class='track'>";
			echo "<a class='tracklane'>".basename($phpfile,".mp3")."</a>".
			"<p class='loading-text'>Loading...</p>".
			"<a class='mixbutton solo' name=".$i."' onclick='solo(this)'>S</a>".
			"<a class='mixbutton mute' name=".$i."' onclick='mute(this)'>M</a>".
			"<audio preload='auto' oncanplaythrough='updateState()' src='"
			.$phpfile."' type='audio/ffmpeg'></audio><input type='range' id='volume"
			.$i."' min='0' max='3' value='2' step='0.01'><br>";
			$i += 1;
			echo "</div>";
		}
		echo "</div>";
	?>
<button onclick="playAll()">ClickMe</button>
</body>
</html>