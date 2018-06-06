/*
  app.js contains routes to each page, calls to spotify API, gets data from spotify and stores in database
 */

/* Firebase Code */
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyD3LN58BAvOG8ouHInfEzCKYmbwZI06gec",
    authDomain: "musaic-1c1c3.firebaseapp.com",
    databaseURL: "https://musaic-1c1c3.firebaseio.com",
    projectId: "musaic-1c1c3",
    storageBucket: "musaic-1c1c3.appspot.com",
    messagingSenderId: "287286942286"
  };

firebase.initializeApp(config);

const database = firebase.database();
// ------- //


//packages
var express = require('express');
var expressSession = require('express-session');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');


//SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('friends.db');

const bodyParser = require('body-parser');


//routes
var login = require('./routes/login');
var mainPage = require('./routes/mainPage');
var community = require('./routes/community');





//SPOTIFY VARIABLES
var client_id = 'a289562a1f854fe4bb7c6ef6ebbde25d'; // Your client id
var client_secret = '5934bdba7c534aaca5239d185b76cbb1'; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};



var stateKey = 'spotify_auth_state';

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('IxD secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(bodyParser.urlencoded({extended: true})); 

//set up express session
app.use(expressSession({secret: "npminstall", saveUninitialized: false, resave: false}));

app.get('/', login.view);
app.get('/mainPage', mainPage.view);

// app.get('/mainPage/:id', mainPage.viewID);


// GET a list of all usernames
//
// To test, open this URL in your browser:
//   http://localhost:3000/friends

app.get('/friend', (req, res) => {
  // db.all() fetches all results from an SQL query into the 'rows' variable:
  db.all('SELECT * FROM friends', (err, rows) => {
    if (rows.length > 0) {
      res.send(rows);
    } else {
      res.send({});
    }
  });
});


//AJAX call:  returns name of friends
app.get('/friend/:name', (req, res) => {
  console.log("running get request");
  const nameToLookup = req.params.name; // matches ':userid' above

  db.all(
    'SELECT * FROM friends WHERE name=$name', 
    {
      $name: nameToLookup, 
    }, 
    (err, rows) => {
      console.log(rows);
      if(rows.length > 0){
        res.send(rows[0]);
      } else {
        res.send({});
      }
    }
  )


  
});


// GET Profile data for a user



app.get('/community', community.view);


//Spotify Login Button.  will run /callback after this
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-read-recently-played user-library-modify';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


let id_global = "";



//runs after login.  Gets data from spotify and stores in Firebase
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;



  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
      //  redirect_uri: redirect_uri,
       redirect_uri: 'http://localhost:3000/callback',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {

      if (!error && response.statusCode === 200) {



        var access_token = body.access_token,
            refresh_token = body.refresh_token;


        //Stores access tokens in session variables
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;


        //gets recently played songs
        var recentSong = {
          url: 'https://api.spotify.com/v1/me/player/recently-played?before=1525928815663&limit=1',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        request.get(recentSong, function(error, response, body) {
          console.log('Should show most recently played song'); //Test
          console.log(body);
          //console.log('BELOW IS MOST RECENTLY PLAYED SONG VARIABLE');
          //console.log(body.items[0].track.name);
        });


          //spotify top artists
        var topArtists = {
          url: 'https://api.spotify.com/v1/me/top/artists?limit=6&offset=20',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


          //spotify top songs
        var topSongs = {
          url: 'https://api.spotify.com/v1/me/top/tracks?limit=6&offset=20',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };



        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        


          request.get(topArtists, function(error, response, bod) {
            

            request.get(topSongs, function(error, response, bo) {
            

              let displayName = body.display_name;
              let userId = "Placeholder";
              if(!displayName){
                displayName = "None";
                body.display_name = "None";
              }

                //All variables stored in database
              let image;
              let topArtist1;
              let topArtist2;
              let topArtist3;
              let topArtist4;
              let topArtist5;
              let topSong;
              let topSong2;
              let topSong3;
              let topSong4;
              let topSong5;
              let topSongArtist;
              let topSongArtist2;
              let topSongArtist3;
              let topSongArtist4;
              let topSongArtist5;
              let topSongPrev;
              let topSongCover;
              let topSongID;
              let topArtistID;
              let topArtistID2;




              //checking for invalid values because of Spotify API bugs
              try{
                displayName = body.display_name;
              }catch(e){
                displayName = null;
              }





              try{
                image = body.images[0].url;
              }catch(e){
                image = "css/ProfilePics/userDefault.png";
              }

              req.session.image = image;

              try{
                  topArtist = bod.items[1].name;
              }catch(e){
                  topArtist = null;
              }

              try{
                  topArtist2 = bod.items[2].name;
              }catch(e){
                  topArtist2 = null;
              }

              try{
                  topArtist3 = bod.items[3].name;
              }catch(e){
                  topArtist3 = null;
              }

              try{
                  topArtist4 = bod.items[4].name;
              }catch(e){
                  topArtist4 = null;
              }
              try{
                  topArtist5 = bod.items[5].name;
              }catch(e){
                  topArtist5 = null;
              }

              try{
                  topSong = bo.items[1].name;
              }catch(e){
                  topSong = null;
              }             
              try{
                  topSong2 = bo.items[2].name;
              }catch(e){
                  topSong2 = null;
              }
              try{
                  topSong3 = bo.items[3].name;
              }catch(e){
                  topSong3 = null;
              }
              try{
                  topSong4 = bo.items[4].name;
              }catch(e){
                  topSong4 = null;
              }
              try{
                  topSong5 = bo.items[5].name;
              }catch(e){
                  topSong5 = null;
              }

              try{
                  topSongArtist = bo.items[1].artists[0].name;
              }catch(e){
                  topSongArtist = null;
              }
              try{
                  topSongArtist2 = bo.items[2].artists[0].name;
              }catch(e){
                  topSongArtist2 = null;
              }
              try{
                  topSongArtist3 = bo.items[3].artists[0].name;
              }catch(e){
                  topSongArtist3 = null;
              }
              try{
                  topSongArtist4 = bo.items[4].artists[0].name;
              }catch(e){
                  topSongArtist4 = null;
              }
              try{
                  topSongArtist5 = bo.items[5].artists[0].name;
              }catch(e){
                  topSongArtist5 = null;
              }
              
              try{
                 topSongPrev = bo.items[1].preview_url;
                 if (topSongPrev === null) {
                  topSongPrev = "None";
                 }
                console.log("No top song Prev but in Try");
                console.log(topSongPrev);

              }catch(e){
                  topSongPrev = "None";
                  console.log("No top song Prev");
              }

               try{
                 topSongPrev2 = bo.items[2].preview_url;
                      if (topSongPrev2 === null) {
                            topSongPrev2 = "None";
                      }                
                }catch(e){
                      topSongPrev2 = "None";
                }

                 try{
                 topSongPrev3 = bo.items[3].preview_url;
                      if (topSongPrev3 === null) {
                            topSongPrev3 = "None";
                      }                
                }catch(e){
                      topSongPrev3 = "None";
                }

                 try{
                 topSongPrev4 = bo.items[4].preview_url;
                      if (topSongPrev4 === null) {
                            topSongPrev4 = "None";
                      }                
                }catch(e){
                      topSongPrev4 = "None";
                }

                 try{
                 topSongPrev5 = bo.items[5].preview_url;
                      if (topSongPrev5 === null) {
                            topSongPrev5 = "None";
                      }                
                }catch(e){
                      topSongPrev5 = "None";
                }


              try{
                topSongCover = bo.items[1].album.images[2].url;
              }catch(e){
                  topSongCover= null;
              }

              try{
                topSongCover2 = bo.items[2].album.images[2].url;
              }catch(e){
                  topSongCover2= null;
              }

              try{
                topSongCover3 = bo.items[3].album.images[2].url;
              }catch(e){
                  topSongCover3= null;
              }

              try{
                topSongCover4 = bo.items[4].album.images[2].url;
              }catch(e){
                  topSongCover4= null;
              }

              try{
                topSongCover5 = bo.items[5].album.images[2].url;
              }catch(e){
                  topSongCover5= null;
              }

             
              try{
                 topSongID = bo.items[1].id;
              }catch(e){
                  topSongID = null;
              }

             
              try{
                 topSongID2 = bo.items[2].id;
              }catch(e){
                  topSongID2 = null;
              }
              try{
                 topSongID3= bo.items[3].id;
              }catch(e){
                  topSongID3 = null;
              }
              try{
                 topSongID4 = bo.items[4].id;
              }catch(e){
                  topSongID4 = null;
              }
               try{
                 topSongID5= bo.items[5].id;
              }catch(e){
                  topSongID5 = null;
              }

              try{
                topArtistID = bod.items[1].id;
              }catch(e){
                topArtistID = null;
              }

               try{
                topArtistID2 = bod.items[2].id;
              }catch(e){
                topArtistID2 = null;
              }
              try{
                topArtistID3 = bod.items[3].id;
              }catch(e){
                topArtistID3 = null;
              }
              try{
                topArtistID4 = bod.items[4].id;
              }catch(e){
                topArtistID4 = null;
              }
              try{
                topArtistID5 = bod.items[5].id;
              }catch(e){
                topArtistID5 = null;
              }
             




              //code to store info in database under users name

              try { 
                database.ref('users/' + body.display_name).set({displayName: displayName, 
                  image: image, id:userId,

                  topArtist: topArtist, topArtist2: topArtist2, topArtist3: topArtist3,
                  topArtist4: topArtist4, topArtist5: topArtist5,



                  topSong: topSong, topSong2: topSong2, topSong3: topSong3,
                  topSong4: topSong4, topSong5: topSong5,

                  topSongID: topSongID, topSongID2: topSongID2, topSongID3: topSongID3,
                  topSongID4: topSongID4, topSongID5: topSongID5,

                  topSongArtist: topSongArtist, topSongArtist2: topSongArtist2, 
                  topSongArtist3: topSongArtist3, topSongArtist4: topSongArtist4,
                  topSongArtist5: topSongArtist5,

                  topSongPrev: topSongPrev, topSongPrev2: topSongPrev2, topSongPrev3: topSongPrev3, topSongPrev4: topSongPrev4, topSongPrev5: topSongPrev5, 
                  
                  topSongCover: topSongCover, topSongCover2: topSongCover2, topSongCover3: topSongCover3, topSongCover4: topSongCover4, topSongCover5: topSongCover5,
                  topArtistID: topArtistID, topArtistID2: topArtistID2,  topArtistID3: topArtistID3,  topArtistID4: topArtistID4,  topArtistID5: topArtistID5 
                });
              }
              catch (e) {
                 

                 console.log("ERROR IN TRY STATEMENT.  RUNNING CATCH");
                 database.ref('users/' + body.display_name).set({displayName: displayName, 
                  image: image, id:userId,

                  topArtist: topArtist, topArtist2: topArtist2, topArtist3: topArtist3,
                  topArtist4: topArtist4, topArtist5: topArtist5,



                  topSong: topSong, topSong2: topSong2, topSong3: topSong3,
                  topSong4: topSong4, topSong5: topSong5,

                  topSongID: topSongID, topSongID2: topSongID2, topSongID3: topSongID3,
                  topSongID4: topSongID4, topSongID5: topSongID5,

                  topSongArtist: topSongArtist, topSongArtist2: topSongArtist2, 
                  topSongArtist3: topSongArtist3, topSongArtist4: topSongArtist4,
                  topSongArtist5: topSongArtist5,

                  topSongPrev: topSongPrev, topSongPrev2: topSongPrev2, topSongPrev3: topSongPrev3, topSongPrev4: topSongPrev4, topSongPrev5: topSongPrev5, 
                  
                  topSongCover: topSongCover, topSongCover2: topSongCover2, topSongCover3: topSongCover3, topSongCover4: topSongCover4, topSongCover5: topSongCover5,
                  topArtistID: topArtistID, topArtistID2: topArtistID2,  topArtistID3: topArtistID3,  topArtistID4: topArtistID4,  topArtistID5: topArtistID5 
                });
              }

            });    
          });

          id_global = body.id;
          console.log("Here: " + id_global);
          req.session.user_id = id_global;

          

          console.log("Body display name=  "+body.display_name);
          if(body.display_name)
            req.session.display_name = body.display_name;
          else{
            const user_name ="None";
            req.session.display_name = user_name;
            body.display_name = req.session.display_name;
          }


          console.log('successfully created the users table in musaic.db');


    //TESTING 
   

   //Checks Database to see if ID already exists
    db.all('SELECT * FROM accounts WHERE id=$id',

    {
      $id: body.id
    },
    (err, rows)=> {
      if(rows.length > 0){
        //ID already found so login as that user
        
        res.redirect("/mainPage");
      }else{
        //ID not found so add it to database
        


        db.run(
          "INSERT INTO accounts VALUES ($id, $display_name, $external_urls, $href, $email, $images)",
            {
              $id: body.id,
              $display_name: body.display_name,
              $external_urls: body.external_urls,
              $href: body.href,
              $email: body.email,
              $images: body.images,
            },

            (err) => {
              if (err) {
              //res.send({message: 'error in app.post(/users)'});
              console.log("ERROR: error in app.post(/callback");
            } else {
               //res.send({message: 'successfully run app.post(/users)'});
               console.log("Successfully ran app.post(/callback)");
            }
            } 


            );


        console.log("\nLOGGING IN AS A NEW USER.  ID="+body.id+" EMAIL="+body.email+"\n");
        res.redirect("/mainPage");
        // res.redirect("/mainPage/"+body.id);
      }
    }
      )
        });

      



      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
	
  }
});


app.post('/callback', (req, res) => {
console.log("Running /callback post request");

   db.run(
          "INSERT INTO accounts VALUES ($id, $display_name, $external_urls, $href, $email, $images)",
            {
              $name: req.body.id,
              $display_name: req.body.display_name,
              $external_urls: req.body.external_urls,
              $href: req.body.href,
              $email: req.body.email,
              $images: req.body.images,
            },

            (err) => {
              if (err) {
              res.send({message: 'error in app.post(/users)'});
            } else {
               res.send({message: 'successfully run app.post(/users)'});
            }
            } 


            );


});



app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  req.session.refresh_token = req.query.refresh_token;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
// Example route
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
