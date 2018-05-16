
console.log("running search.js");

var templateSourceSingle = document.getElementById('results-template-single').innerHTML,
    templateSingle = Handlebars.compile(templateSourceSingle),
    resultsPlaceholderSingles = document.getElementById('resultsSingle'),
    playingCssClass = 'playing',
    audioObject = null;

var access_token = "BQCYEXcHdUSI06HdgYZoYBbWgLMJlyjWwEwbt1_SuO05FvBz4F8Dp5erWqvjlDcrP6HWwqEB0-iVbq9zUU34wTUILlKwhIES8NXMfQ3pQQaRTiY1tgZVNkbY356ambUEx3GbA2Y6ynWRWR2gKZV3H4tGr35K1VH1";

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