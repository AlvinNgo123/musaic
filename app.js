/**
 * Module dependencies.
 */



var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('friends.db');

const bodyParser = require('body-parser');



var login = require('./routes/login');
var mainPage = require('./routes/mainPage');
var profile = require('./routes/profile');
var friends = require('./routes/friends');
var myProfile = require('./routes/myProfile');
var yourProfile = require('./routes/yourProfile');
// Example route
// var user = require('./routes/user');




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
//var data = require("./data.json");

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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(bodyParser.urlencoded({extended: true})); 


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


//AJAX call
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


  //const val = data[nameToLookup];
  //console.log(nameToLookup, '->', val); // for debugging
  //if (val) {
    //res.send(val);
  //} else {
    //res.send({}); // failed, so return an empty object instead of undefined
  //}
});

/*
// Gets all the users
app.get('/users', (req, res) => {
  db.all('SELECT id FROM accounts', (err, rows) => {
    console.log(rows);
    const allUsernames = rows.map(e => e.name);
    res.send(allUsernames);
  });
});


// GET Profile data for a user
app.get('/users/:userid', (req, res) => {
  const nameToLookup = req.params.userid; // matches ':userid' above

  db.all(
    'SELECT * FROM users WHERE name=$name',
    {
      $name: nameToLookup,
    }, 
    (err, rows) => {
      console.log(rows);
      if (rows.length > 0) {
        res.send(rows);
      }
      else {
        res.send({});
      }
    });
});
*/

app.get('/profile', profile.view);
app.get('/friends', friends.view);
app.get('/myProfile', myProfile.view);
app.get('/yourProfile', yourProfile.view);



//Spotify Login Button
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


var id_global = "";


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

        var topArtists = {
          url: 'https://api.spotify.com/v1/me/top/artists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(topArtists, function(error, response, body) {
          console.log('Goes into top artists'); //Test
          console.log(body);
        });


        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
          console.log("EMAIL = "+body.email);
          console.log("DEBUG:  body.id ="+body.id);

          id_global = body.id;

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
        console.log("DEBUG: user id found in database");
        //res.redirect("/mainPage/"+body.id);

        console.log("\nLOGGING IN AS A RETURNING USER.  ID="+body.id+" EMAIL="+body.email+"\n");
        res.redirect("/mainPage");
      }else{
        //ID not found so add it to database
        console.log("DEBUG: user id NOT found in database. You should not be seeing this message");


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

        // we can also pass the token to the browser to make requests from there
        

        //DO NOT DELETE THIS CODE.  I AM JUST COMMENTING IT OUT BC I DONT WANT TO DEAL W TOKENS RN. THANK YOU
        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        //   }));

 
    //res.redirect("/mainPage/"+id_global);



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

console.log("DEBUG: global_body.id"+id);
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
