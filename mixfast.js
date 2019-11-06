Number.prototype.toHHMMSS = function () {
			var sec_num = parseInt(this, 10); // don't forget the second param
			//var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor(sec_num / 60);
			var seconds = sec_num - (minutes * 60);

			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			return minutes+':'+seconds;
		}
String.prototype.timeToFloat = function() {
    if (this.includes(":")) {
        var min = parseInt(this.split(":")[0]);
        var sec = parseInt(this.split(":")[1]);
        return min*60+sec;
    }else{
        return parseFloat(this);
    }
}

window.onerror = function(msg, url, line, col, error) {
	alert("Error: "+error+"\n at "+ line+", "+col);
};
		// for legacy browsers
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		const audioContext = new AudioContext();
		const master = audioContext.createGain();
		class AudioTrack {
			constructor (source, audioContext, master) {
				this.gainNode = audioContext.createGain();
				this.source = audioContext.createMediaElementSource(source);
				this.source.connect(this.gainNode).connect(master);
				this.gain = 2;
				this.soloed = false;
				this.muted = false;
			}
			
			setGain(gain){
				this.gain = gain;
				if (!this.muted){
					this.gainNode.gain.value = gain;
				}
			}
			
					
			mute(){
				this.muted=true;
				this.gainNode.gain.value = 0;				
			}
			unmute(){
				this.muted=false;
				this.gainNode.gain.value = this.gain;
			}
		}
		
		var audioElements;
		var tracks=[];
		var gainNodes=[];
		var playButton;
		var seekbar;
		var seekbarPosition;
        var loadingGif;
		var dur=null; //duration
		var durDisplay;
		var currentText;
		var buttonText;
		var muteActive = false;
		var soloedTracks = 0;
		var numTracks = 0;
        var loop = false;
        var loopStart = 0;
		var loopEnd = 20;
		var loopMarker;
        var startInput;
        var endInput;
		
		window.onload = function() {
			// get the audio element
			audioElements = document.querySelectorAll('audio');
			numTracks = audioElements.length;
			currentText = document.getElementById("current");
			buttonText = document.getElementById("buttonText");
			// pass it into the audio context
			for (var i = 0; i<audioElements.length; i++){
					//tracks.push(audioContext.createMediaElementSource(audioElements[i]));
					//gainNodes.push(audioContext.createGain());
					//tracks[i].connect(gainNodes[i]).connect(audioContext.destination);
					tracks.push(new AudioTrack(audioElements[i], audioContext, master));
					bindVolume(i);
			}
            loadingGif = document.querySelector('#loading-gif');
			playButton = document.querySelector('button');

			playButton.addEventListener('click', function() {
				// check if context is in suspended state (autoplay policy)
				if (audioContext.state === 'suspended') {
					audioContext.resume();
				}

				// play or pause track depending on state
				if (this.dataset.playing === 'false') {
					if (numTracks <= 0) {
                        loadingGif.style.opacity = 0;
						playAll();
                    }
                    //console.log(numTracks);
					//console.log("Playing");
					this.dataset.playing = 'true';
				} else if (this.dataset.playing === 'true') {
					pauseAll();
					this.dataset.playing = 'false';
				}

			}, false);
			
			//Init master fader
			master.connect(audioContext.destination);
			document.querySelector("#master").addEventListener('input', function() {
					master.gain.value = this.value;
				}, false);
			
			//Init tracks
			audioElements.forEach(function(el, i){
                if (el.readyState==4) {
                    numTracks -= 1;
                }
				/*el.addEventListener("canplaythrough", function() {
					numTracks = numTracks - 1;
					//console.log(numTracks);
					if ((numTracks <= 0) && (playButton.dataset.playing === "true")) {
                        loadingGif.style.opacity = 0;
                        playAll();
					}
				});*/
				
				el.addEventListener("waiting", function() {
					if (numTracks < audioElements.length) {
						numTracks += 1;
                    }
                    loadingGif.style.opacity = 1;
					pauseAll();
					//console.log("Waiting...");
				});
				// get children
				const anchor = el.parentNode.querySelector('.tracklane');
				const loadText = el.parentNode.querySelector('p');
				//show label
				anchor.style.display = 'inline-block';
				// hide loading text
				loadText.style.display = 'none';
			});
			
			try { document.querySelector("#navigation").style.opacity=1; } catch(e) {console.log("No nav found");}
			document.querySelector("#master-controls").style.opacity=1;
			loadingGif.style.opacity = 0;			
			
			audioElements[0].addEventListener('ended', function(){
				playButton.dataset.playing = 'false';
			}, false);
			
			audioElements[0].addEventListener("timeupdate",function(event){
				var time = audioElements[0].currentTime;
				calc(time);
                currentText.text = time.toHHMMSS()+"/"+durDisplay;
                if (loop && time > loopEnd) { //loop back
                    jumpTo(loopStart);
                }
			});
			
			audioElements[0].addEventListener("play",function(event){
                playing=true;
                //playButton.dataset.playing = "true";
				buttonText.text="\u275A\u275A";
			});
			audioElements[0].addEventListener("pause",function(event){
                playing=false;
                //playButton.dataset.playing = "false";
				buttonText.text="\u25b6";
			});
			
			audioElements[0].addEventListener("loadedmetadata", function(event){
				dur=audioElements[0].duration;
				durDisplay=dur.toHHMMSS();
                currentText.text="00:00"+"/"+durDisplay;
                loopEnd =dur;
			});
			if (dur == null) {//event passed
				dur=audioElements[0].duration;
				durDisplay=dur.toHHMMSS();
                currentText.text="00:00"+"/"+durDisplay;
                loopEnd =dur;
			}
			seekbar = document.getElementById("seekbar");
			seekbar.value=0;
			seekbar.max=1000;
			seekbarPosition = seekbar.getBoundingClientRect();
			seekbar.addEventListener("input",function(event){
				numTracks = audioElements.length;
				for (var i = 0; i<audioElements.length; i++){
					audioElements[i].currentTime=toValue(seekbar.value);
				}
            });
            
            startInput = document.querySelector("#loopStart");
            startInput.addEventListener("input", function() {
				loopStart = this.value.timeToFloat();
				moveMarker();
                checkLoopPoints();
            });
            
            endInput=document.querySelector("#loopEnd");
            endInput.addEventListener("input", function() {
				loopEnd = this.value.timeToFloat();
				moveMarker();
                checkLoopPoints();
            });
            document.querySelector("#loop").addEventListener("change", function(){
				loop=this.checked;
				if (loop) {
					loopMarker.style.background = "#eb3b3b";
				}else{
					loopMarker.style.background = "#535353";
				}
            });

            document.querySelector("#loop").addEventListener("input", function() {
                //loop = this.checked;
			});
			
			loopMarker = document.querySelector("#loopmarker");

            startInput.value = 0;
			endInput.value = dur.toHHMMSS();
			moveMarker();
			
		}
		
		function playAll() {
				for (var i = 0; i<audioElements.length; i++){
					audioElements[i].play();
				}
			}
			
		function pauseAll() {
			for (var i = 0; i<audioElements.length; i++){
				audioElements[i].pause();
			}
		}
		
		function jumpTo(time) {
			numTracks = audioElements.length;
			audioElements.forEach(function(el) {
				el.currentTime = time;
			});
		}			
		
		//calculate the seekbar value from currentTime
		function calc(time){
			var result = time*1000/dur;
			seekbar.value=result;
			return result;
		}
		
		//Calculate the time from seekbar value
		function toValue(value){
			var result = dur/1000*value;
			//seekbar.value=result;
			return result;
		}
		
		//bind the volume listener to the track
		function bindVolume(index){
			document.querySelector("#volume"+index).addEventListener('input', function() {
					tracks[index].setGain(this.value);
				}, false);
		}
		
		function mute(button){
			var index = parseInt(button.name);
			if (tracks[index].muted) {
				if (soloedTracks == 0) {
					button.classList.remove("active");
					tracks[index].unmute();
				}
			}else{
				button.classList.add("active");
				tracks[index].mute();
			}
			
		}
		
		function solo(button){
			var index = parseInt(button.name);
			if (tracks[index].soloed) {
				button.classList.remove("active");
				tracks[index].soloed = false;
				soloedTracks -= 1;
			}else{
				button.classList.add("active");
				tracks[index].soloed = true;
				soloedTracks += 1;
			}
			if (soloedTracks > 0) {// mute all other unsoloed tracks
				for (var i = 0; i<tracks.length; i++){
					if (!tracks[i].soloed){
						tracks[i].mute();
					}else {
						tracks[i].unmute();
					}
				}
			}else {
				for (var i = 0; i<tracks.length; i++){
					tracks[i].unmute();
				}
			}			
		}
        
        function reset() {
			for (var i = 0; i<tracks.length; i++){
				tracks[i].setGain(2);
				document.querySelector("#volume"+i).value = 2;
			}
		}

		function unSoloAll() {
			for (var i = 0; i<tracks.length; i++){
				tracks[i].unmute();
				tracks[i].soloed = false;
				soloedTracks = 0;
			}

			var buttons = document.querySelectorAll(".solo");
			buttons.forEach(function(el, i) {
				el.classList.remove("active");
			});
		}

		function unMuteAll() {
			if (soloedTracks > 0) {// unmute all soloed tracks
				for (var i = 0; i<tracks.length; i++){
					if (!tracks[i].soloed){
						tracks[i].mute();
					}else {
						tracks[i].unmute();
					}
				}
			}else { //unmute all tracks if last solo is removed
				for (var i = 0; i<tracks.length; i++){
					tracks[i].unmute();
				}
			}
			var buttons = document.querySelectorAll(".mute");
			buttons.forEach(function(el, i){
				el.classList.remove("active");
			});
		}
		
		function moveMarker() {
			loopMarker.style.left = seekbarPosition.width*loopStart/dur+"px";
			loopMarker.style.width = seekbarPosition.width*(loopEnd-loopStart)/dur+"px";
		}

        function drag(ev,time){
            //console.log(time);
            ev.dataTransfer.setData("time", parseFloat(time));
        }
        function allowDrop(ev){
            ev.preventDefault();
        }

        function drop(ev, el, isEnd){
            var time = parseFloat(ev.dataTransfer.getData("time"));
            el.value= time.toHHMMSS();
            if (isEnd){
				loopEnd = time;
				moveMarker();
            }else{
				loopStart = time;
				moveMarker();
            }
            checkLoopPoints();
        }

        function setStart(){
			loopStart = audioElements[0].currentTime;
            startInput.value = audioElements[0].currentTime.toHHMMSS();
			moveMarker();
			checkLoopPoints();
        }

        function setEnd(){
            loopEnd = audioElements[0].currentTime;
			endInput.value = audioElements[0].currentTime.toHHMMSS();
			moveMarker();
            checkLoopPoints();
        }

        function checkLoopPoints(){
            if (parseFloat(loopStart) > parseFloat(loopEnd)) {
                startInput.parentNode.style.background = "red";
            } else {
                startInput.parentNode.style.background = "";
            }
        }
		document.addEventListener("keydown", function(e) {
			if (e.code === "KeyL") {
				console.log(audioElements[0].currentTime+":");
            }
            /*if (e.code === "Space") {
                e.preventDefault();
                if (playing) {
                    pauseAll();
                }else{
                    playAll();
                }
            }*/
		});

		function updateState() {
			numTracks = numTracks - 1;
			var playButton = document.querySelector("button");
			var loadingGif = document.querySelector('#loading-gif');
			console.log(numTracks);
			if ((numTracks <= 0) && (playButton.dataset.playing === "true")) {
				loadingGif.style.opacity = 0;
				playAll();
			}
		}