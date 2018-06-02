
console.log("running search.js");

var templateSourceSingle = document.getElementById('results-template-single').innerHTML,
    templateSingle = Handlebars.compile(templateSourceSingle),
    resultsPlaceholderSingles = document.getElementById('resultsSingle'),
    playingCssClass = 'playing',
    audioObject = null;

var access_token = 
"BQCHiLbi_S-4eoqDr6Z3VIfHOGMtVl6-viUmnHL689_0eje4DCIG9RavWurhuTX880-cqszD8NqiooohxPTKYARqjn2vwhuqYjQRMiUB-Cd_-LIUhP0WnQzD3CBMWZVpbL_bwYzATbmDCADKdxTzSIB7Q2NkuXXwX1jcKlUVMvPgZbejU4RHa-2XHGdQ1VQw9LGNIOia_g7NI10KFsfBBrMQEbnvwADQzzQofUZ1ksCeL9usXXMsPwMYQXFA-N6g-6G26uqeIg";





//TAKES THE USER'S INPUT AND SENDS IT AS A QUERY TO SPOTIFY TO SEARCH FOR TRACKS WITH THAT NAME
var searchTracks = function (query) {
    console.log("running searchTracks");	


    	//call to spotify
	    $.ajax({
	        url: 'https://api.spotify.com/v1/search',
	        headers: {
	            'Authorization': 'Bearer ' + access_token
	        },
	        data: {
	        	//user's input
	            q: query,
	            type: 'track'
	        },

	        //response is the data received from spotify
	        success: function (response) {
	           
	           //uses the handlebars template to show each song on the selectSong page based on the response received
	            resultsPlaceholderSingles.innerHTML = templateSingle(response);




	            console.log("resultsPlaceholderSingles.innerHTML = "+resultsPlaceholderSingles.innerHTML);
	        }
    });
};



//WHEN CLICKING ON THE ALBUM COVER THE PREVIEW WILL PLAY
	resultsSingle.addEventListener('click', function (e) {

		//the song that was clicked on
	    var target = e.target;


	    if (target !== null && target.classList.contains('cover')) {
	  		console.log("printing target ID: "+target.getAttribute('data-track-id'));
	     	console.log("printing target URL: "+target.getAttribute('data-prev-url'));
	      	console.log("printing track name: "+target.getAttribute('trackName'));
	    

	      	//id of the song that was clicked on
	     	 var id = target.getAttribute('data-track-id');

			console.log("printing artist: "+target.getAttribute('artist'));
			console.log("printing album: "+target.getAttribute('album'));


			//Some songs don't have preview, so if it does not it will display a message
	      if(!(target.getAttribute('data-prev-url'))){
	      		console.log("preview not found");
	      		document.getElementById(id).style.display = "block";
	      }else{
	      	// document.getElementById('notPlayingMsg').setAttribute('display', 'none');
	      		document.getElementById(id).style.display = "none";
	      }



	    	
	    	//Creates audio object and plays
	        if (target.classList.contains(playingCssClass)) {
	            audioObject.pause();
	        } else {
	            if (audioObject) {
	                audioObject.pause();
	            }

	            //create new audio object based on preview url
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

	

//when the user presses search, it will run searchTracks which will find and populate the page with
//search results
document.getElementById('search-form-single').addEventListener('submit', function (e) {
    e.preventDefault();

    //runs searchTracks with the user's search input
    searchTracks(document.getElementById('query-single').value);
}, false);