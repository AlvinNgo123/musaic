
console.log("running search.js");

var templateSourceSingle = document.getElementById('results-template-single').innerHTML,
    templateSingle = Handlebars.compile(templateSourceSingle),
    resultsPlaceholderSingles = document.getElementById('resultsSingle'),
    playingCssClass = 'playing',
    audioObject = null;

var access_token = "BQBXlFQeM7_O0CDPHx5vjuk3jDAna0tTPrT-WIaaSgEFgGK_aRSo4d5Pi7nV9DBroyw34jkQbmgJAa9FvquYkW26tcr6bBupL2DDfd9QDzOqrrBbol8ZTF_k1skWZZ0XCbASl0NjddWFedsznqKEFA2p0Xqm7aoT";

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
	            
	            console.log("Response: "+response.tracks.href);
	            console.log("template"+templateSingle(response));
	            resultsPlaceholderSingles.innerHTML = templateSingle(response);

	        }
    });
};

	resultsSingle.addEventListener('click', function (e) {
	    var target = e.target;

	    console.log("printing target: "+target);
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