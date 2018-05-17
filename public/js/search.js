
console.log("running search.js");

var templateSourceSingle = document.getElementById('results-template-single').innerHTML,
    templateSingle = Handlebars.compile(templateSourceSingle),
    resultsPlaceholderSingles = document.getElementById('resultsSingle'),
    playingCssClass = 'playing',
    audioObject = null;

var access_token = "BQA6grauX6jjsVCtJ9dh_0aWZrNHhC2mb1515Bw0bYtw3N2VofvTFtouUD_FELsoJjHiaQTyMiPWyxl3_53oCfL9l1YvagZoJuJfCraDNBdZ95SkfSeH3CFT_dOf9cMWIoE4AuyEvUZrEUzym8vfrTPdn1euc0lV";

var searchTracks = function (query) {
    console.log("running searchTracks");	
	    $.ajax({
	        url: 'https://api.spotify.com/v1/search',
	        headers: {
	            'Authorization': 'Bearer ' + access_token
	        },
	        data: {
	            q: query,
	            type: 'track'
	        },
	        success: function (response) {
	           
	            resultsPlaceholderSingles.innerHTML = templateSingle(response);
	            console.log("resultsPlaceholderSingles.innerHTML = "+resultsPlaceholderSingles.innerHTML);
	        }
    });
};

	resultsSingle.addEventListener('click', function (e) {
	    var target = e.target;

	    console.log("printing target ID: "+target.getAttribute('data-track-id'));
	      console.log("printing target URL: "+target.getAttribute('data-prev-url'));

	      if(!(target.getAttribute('data-prev-url'))){
	      	document.getElementById('notPlayingMsg').setAttribute('display', 'block');
	      }else{
	      	document.getElementById('notPlayingMsg').setAttribute('display', 'none');
	      }

	    if (target !== null && target.classList.contains('cover')) {
	        if (target.classList.contains(playingCssClass)) {
	            audioObject.pause();
	        } else {
	            if (audioObject) {
	                audioObject.pause();
	            }

	            audioObject = new Audio(target.getAttribute('data-prev-url'));
	            audioObject.play();
	            target.classList.add(playingCssClass);
	            audioObject.addEventListener('ended', function () {
	                target.classList.remove(playingCssClass);
	            });
	            audioObject.addEventListener('pause', function () {
	                 target.classList.remove(playingCssClass);
	            });
	        }
	    }
});



document.getElementById('search-form-single').addEventListener('submit', function (e) {
    e.preventDefault();
    searchTracks(document.getElementById('query-single').value);
}, false);