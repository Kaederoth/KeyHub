//START: Front page code
function PushNotifSubscribe(){
	//firebase notification
	messaging.getToken().then((currentToken) => {
	  if (currentToken) {
		sendTokenToServer(currentToken);
	  } else {
		// Show permission request.
		console.log('No Instance ID token available. Request permission to generate one.');
		// Show permission UI.
		setTokenSentToServer(false);
	  }
	}).catch((err) => {
	  console.log('An error occurred while retrieving token. ', err);
	  setTokenSentToServer(false);
	});	
}
function getPageName(url){
    return new URL(url).pathname.split('/').filter(segment => segment !== '')[0];
}
function paintContributors(wrapperId){
	$.ajax({
		url: 'https://api.github.com/repos/jondycz/keyhub/contributors?page=1&per_page=250',
		dataType: 'jsonp',
		success: function(data) {
			$.each(data.data, function(key, val) {
				wrapperId.append('<a href="' + val.html_url + '" target="_blank" title="' + val.login + '"><img src="' + val.avatar_url + '&s=64" alt="' + val.login + '" width="64" height="64" style="margin:5px;" loading="lazy" /></a>');
			});
		}
	});
}
function loginWithSteam(){
	var loginLink = '/connect/steam?return=' + encodeURIComponent(location.pathname);
	if (window.self !== window.top) {
		window.open(loginLink + '&embed=true');
	}else{
		location.href = loginLink;
	}
}
//END: Front page code

//START: Giveaway page code
function VerifyTasks(link, token = 0){
	document.getElementById("verify").style.display = "none";
	document.getElementById("VerifLoad").style.display = "block";
	 $.ajax({     
		 type: "POST",
		 url: '/verify?data='+link+'&token='+token,
		 success: function (data) {
			 if(data['error'] != "exhausted"){
				 //server resources exhausted
				 document.getElementById("verify").title = "Wait 30 seconds to verify again";
				 document.getElementById("verify").disabled = true;
				 setTimeout(function(){document.getElementById("verify").disabled = false;$("#verify").removeAttr("title");grecaptcha.reset();},30000);
				 if(data['code'] != 1){
					$(".task-result").css("display", "flex");
					$(".task-result").removeClass( "fa-times-circle" ).addClass("fa-check-circle");
					$(".taskErrors").css("display", "none");
				 }
				if(data['success'] != null){
					if(data['success'] == true){
						document.getElementById("keybox").setAttribute("value", data["message"]);
						document.getElementById("keybutton").setAttribute("onclick", "window.open('https://store.steampowered.com/account/registerkey?key="+data["message"]+"', '_blank');");
						document.getElementById("keygroup").style.display = "contents";
						document.getElementById("verifybox").style.display = "none";
						$('#keysleft').html(($('#keysleft').text())-1);
					}else{
						document.getElementById("error").style.display = "flex";
						document.getElementById("errormsg").textContent = data["message"];
					}
				}else{
					//take indexes
					document.getElementById("error").style.display = "none";
					$('.taskErrors').hide();
					$.each(data, function(index, value) {
						$("#task-"+index).removeClass( "fa-check-circle" ).addClass( "fa-times-circle" );
						$("#task-"+index+"-reason").css("display", "block");
						$("#task-"+index+"-reason").text(value);
					});
				}
				document.getElementById("VerifLoad").style.display = "none";
				document.getElementById("verify").style.display = "initial";
			 }else{
				 setTimeout(function(){ VerifyTasks(link, token); }, 2000);
			 }
		 },
		error: function(xhr, ajaxOptions, thrownError) {
			//hadle errors here
			alert("We have experienced an error here! Please wait for a while to try verifying again.");
			document.getElementById("verify").style.display = "initial";
			document.getElementById("VerifLoad").style.display = "none";
			grecaptcha.reset();
		},
		 dataType: "json"
	 });	
}

function keysleft(){
	 $.ajax({
		 type: "GET",
		 url: 'https://api.key-hub.eu/?type=giveawaycount&data='+parseInt(window.location.pathname.split("/")[2]),
		 success: function (data) {
			$('#keysleft').html(data);
			if(data != 0){
				setTimeout(function(){ keysleft(); }, 5000);
			}
		 },
		 dataType: "json"
	 });
}

if(getPageName(window.location.href) === "giveaway"){
	setTimeout(function(){ keysleft(); }, 5000);
	if($("#logout").length != 0 && typeof VPNcheck == 'function'){
		VPNcheck();
	}
}

function videoTask(videoid, data){
	if(videoid != '' && data != ''){
		window.data = data;
		$('<div class="video-underlay"></div><div class="video-overlay"><div id="countdown" style="text-align: right;"></div><div class="video-container"><div id="player" name="player"></div></div></div>').appendTo('body');
		window.videoid = videoid;
		playvideo();
	}
}

window.playcount = 0;
function playvideo(videoid){
  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  var player;
  var videotime = 0;
  if(window.playcount != 0){
	  onYouTubeIframeAPIReady();
  }
}
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		videoId: videoid,
		playerVars: {
			controls: 0,
			disablekb: 1,
			loop: 1,
			fs: 0
			
		},
		events: {
			'onReady': onPlayerReady
		}
	});
  window.playcount++;
}

function onPlayerReady(event) {
	(function(){
		//temporarily disabling autoplay
		//event.target.playVideo();
		//document.getElementsByClassName('video-stream html5-main-video')[0].loop = true;
		var checkvid = setInterval(function(){
			videoCheck();
		}, 200)
		var countdown = setInterval(function(){
			if(player.getDuration() > 120){var duration = 120;}else{var duration = player.getDuration();}
			var duration = (duration - player.getCurrentTime()).toFixed(0);
			if(duration > 59){
				duration = Math.floor((duration/60)).toFixed(0)+":"+('0' + duration%60).slice(-2);
			}
			$("#countdown").html(duration);
		}, 1000)					
		var last = 0;
		function videoCheck(){
			if(player.playerInfo.playerState != -1){
				if(player.getCurrentTime()-1.2 < last){
					if(player.getDuration() > 120){var duration = 120;}else{var duration = player.getDuration();}
					if((duration-1) < player.getCurrentTime()){
						clearInterval(checkvid);
						clearInterval(countdown);
						if(player){
							player.stopVideo();
							player.destroy();
							player = null;				
						}
						$(".video-overlay").remove();
						$(".video-underlay").remove();
						$.get('/away?data='+window.data, function (data, textStatus, jqXHR) {});
					}else{
						last = player.getCurrentTime();
					}
				}else{
					player.seekTo(last);
				}
			}else{
				/*clearInterval(checkvid);
				clearInterval(countdown);
				if(player){
					player.stopVideo();
					player.destroy();
					player = null;				
				}
				$(".video-overlay").remove();
				$(".video-underlay").remove();
				console.log("Error loading video");*/
			}
		}
	}());
}
//END: Giveaway page code

//START: Drops page code
function Donate(token){
	var key = document.getElementById('Donkey').value;
	 $.ajax({   
		 type: "POST",
		 url: '/drops',
		 data: {'donate': '1','key': key},						 
		 success: function (data) {
			if(data["success"] != null){
				//neco dobre
				document.getElementById("skeymsg").innerText = data["success"];
				document.getElementById("skeymsg").style.backgroundColor = "green";
				document.getElementById("skeymsg").style.display = "block";
			}
			if(data["error"] != null){
				//neco spatne
				document.getElementById("skeymsg").innerText = data["error"];
				document.getElementById("skeymsg").style.backgroundColor = "red";
				document.getElementById("skeymsg").style.display = "block";
			}
		 },
		 dataType: "json"
	 });
	window.scrollTo(0, 0);						 
}
function ClaimKeyDrop(event){
	if(event.isTrusted){
		document.getElementById("skeyc").disabled = true;
		 $.ajax({  
			 type: "POST",
			 url: '/drops',
			 data: {'claim': '1'},							 
			 success: function (data) {
				if(data["success"] != null){
					//neco dobre
					document.getElementById("skeymsg").innerText = data["success"];
					document.getElementById("skeymsg").style.backgroundColor = "green";
					document.getElementById("skeymsg").style.display = "block";
				}
				if(data["error"] != null){
					//neco spatne
					document.getElementById("skeymsg").innerText = data["error"];
					document.getElementById("skeymsg").style.backgroundColor = "red";
					document.getElementById("skeymsg").style.display = "block";
					/*if(data["error"] != "You have to rate your previous key before you can claim another"){
						if(data["error"] != "Sorry Drop isnt yet active, click fast!"){
							setTimeout(function(){ location.reload(); }, 3000);
						}
					}*/
					if (typeof window.keyClaimed === 'undefined') {
						if(data["error"] != "Sorry Drop isnt yet active, click fast!"){
							setTimeout(function(){ location.reload(); }, 3000);
						}
					}
				}
				if(data["skey"] != null){
					//dej klic
					document.getElementById("skey").innerText = data["skey"];
					document.getElementById("feedbackalert").style.display = "block";
					document.getElementById("skeyc").style.display = "none";
					window.keyClaimed = true;
					clearInterval(ts);
				}
				document.getElementById("skeyc").disabled = false;
			 },
			 dataType: "json"
		 });
	}else{
		document.getElementById("skeymsg").innerText = "Something went wrong. Maybe update to a newer browser?";
		document.getElementById("skeymsg").style.backgroundColor = "red";
		document.getElementById("skeymsg").style.display = "block";								
	}
}
function remainingTime(timestamp2){
	return (timestamp2 - Math.floor(Date.now() / 1000));
}
function timestamptotime(timestamp){
	var hour, minute, second;
	hour = minute = second = 0;
	if(timestamp >= 0){
		hour = Math.floor(timestamp/3600);
		minute = Math.floor((timestamp % 3600)/60);
		second = Math.floor((timestamp % 3600)%60);
		document.getElementById("countdown").innerText = hour + " : " + ('0' + minute).slice(-2) + " : " + ('0' + second).slice(-2);	
	}else{
		clearInterval(ts);
	}
	if(timestamp <= 5){
		if(document.getElementById("skey").innerText != "Sorry, no keys left, check back later"){
			document.getElementById("skeyc").style.display = "inline-block";
		}
	}
	document.getElementById("countdown").innerText = hour + " : " + ('0' + minute).slice(-2) + " : " + ('0' + second).slice(-2);
}
function updateDropsClock(timestamp){
	timestamp = Math.round(timestamp - (document.timeline.currentTime / 1000));
	var timestamp2 = Math.floor(Date.now() / 1000) + timestamp;
	timestamptotime(timestamp);
	var ts = setInterval(function(){
		if(timestamp != remainingTime(timestamp2)){
			timestamp = remainingTime(timestamp2);
			timestamptotime(timestamp);								
		}
	}, 100)
}
function KeyFeedback(option){
	 $.ajax({
		 type: "POST",
		 url: '/drops',
		 data: {'postStatus': option},							 
		 success: function (data) {
			if(data["success"] != null){
				//neco dobre
				document.getElementById("skeymsg").innerText = data["success"];
				document.getElementById("skeymsg").style.backgroundColor = "green";
				document.getElementById("skeymsg").style.display = "block";
			}
			if(data["error"] != null){
				//neco spatne
				document.getElementById("skeymsg").innerText = data["error"];
				document.getElementById("skeymsg").style.backgroundColor = "red";
				document.getElementById("skeymsg").style.display = "block";
			}
		 },
		 dataType: "json"
	 });
	setTimeout(function(){ window.location.href = "/drops"; }, 1500);
}
//END: Drops page code

//Code executed on full page load
window.onload = function() {
	// mobile_menu
	var menu = $('ul#navigation');
	if(menu.length){
		menu.slicknav({
			prependTo: ".mobile_menu",
			closedSymbol: '+',
			openedSymbol:'-'
		});
	};
	//language selection
	var languageSelect = document.getElementById('languageSelect');
	if (languageSelect) {
		languageSelect.addEventListener('change', function() {
			window.location.href = '?lang=' + this.value + "#languageSelect";
		});
	}
	//holiday logo
	(async  () => {
		let logoUrl = '/img/logos/' + (new Date()).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', '') + ".svg";
		fetch(logoUrl)
		.then((response) => {
			if (response.ok) {
				document.querySelector(".logo-img > a > img").src = logoUrl;
			}
		});
	})();
};
