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
const db = new sqlite3.Database('accounts.db');

const bodyParser = require('body-parser');



var login = require('./routes/login');
var mainPage = require('./routes/mainPage');
var profile = require('./routes/profile');
var friends = require('./routes/friends');
var myProfile = require('./routes/myProfile');
// Example route
// var user = require('./routes/user');



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
var data = require("./data.json");

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

app.get('/data/:name', (req, res) => {
  console.log("running get request");
  const nameToLookup = req.params.name; // matches ':userid' above
  const val = data[nameToLookup];
  console.log(nameToLookup, '->', val); // for debugging
  if (val) {
    res.send(val);
  } else {
    res.send({}); // failed, so return an empty object instead of undefined
  }
});

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

app.get('/profile', profile.view);
app.get('/friends', friends.view);
app.get('/myProfile', myProfile.view);




app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

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
        redirect_uri: redirect_uri,
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



        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
          console.log("EMAIL = "+body.email);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
	 //db.run("CREATE TABLE accounts (id TEXT, display_name TEXT,  external_urls TEXT, href TEXT, email TEXT, images TEXT)");

    //db.run("INSERT INTO accounts VALUES ('42069', 'Jennifer Klage Amerine', '{}', '', '', '')");

    db.run("INSERT INTO accounts VALUES (body.id, body.display_name, body.external_urls, body.href, body.email, body.images)");
    console.log('successfully created the users table in musaic.db');

    db.each("SELECT id, display_name, external_urls FROM accounts", (err, row) => {
    console.log(row.id + ": " + row.display_name + ' - ' +  row.external_urls);
    });
  }
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
