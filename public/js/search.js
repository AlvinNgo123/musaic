
console.log("running search.js");

var templateSourceSingle = document.getElementById('results-template-single').innerHTML,
    templateSingle = Handlebars.compile(templateSourceSingle),
    resultsPlaceholderSingles = document.getElementById('resultsSingle'),
    playingCssClass = 'playing',
    audioObject = null;

var access_token = 
"BQCwI5tJI1NwUgBLWenly_hif_cZ0EyRW7MAUcQHZ4-940rozvR5eMSKoUFa3lat0USLXWQwPRu4kfNLC1uVwfcorbNKJphPqxqZtSx7ZOzBGNw7IEv3KA0al9M_KPVCp11DftxnutDWqNSGa1ocEk2H5p6jMeCg";

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
	    if (target !== null && target.classList.contains('cover')) {
	    console.log("printing target ID: "+target.getAttribute('data-track-id'));
	      console.log("printing target URL: "+target.getAttribute('data-prev-url'));
	      console.log("printing track name: "+target.getAttribute('trackName'));
	      var id = target.getAttribute('data-track-id');
		console.log("printing artist: "+target.getAttribute('artist'));

		console.log("printing album: "+target.getAttribute('album'));


	      if(!(target.getAttribute('data-prev-url'))){
	      	console.log("preview not found");
	      	document.getElementById(id).style.display = "block";
	      }else{
	      	// document.getElementById('notPlayingMsg').setAttribute('display', 'none');
	      		document.getElementById(id).style.display = "none";
	      }



	    
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