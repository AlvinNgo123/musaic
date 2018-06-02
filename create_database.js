// Based on Philip Guo's code
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('friends.db');

// run each database statement *serially* one after another
// (if you don't do this, then all statements will run in parallel,
//  which we don't want)
db.serialize(() => {
  // create a new database table:

  db.run("CREATE TABLE accounts (id TEXT, display_name TEXT,  external_urls TEXT, href TEXT, email TEXT, images TEXT)");

  //db.run("INSERT INTO accounts VALUES ('42069', 'Jennifer Klage Amerine', '{}', '', '', '')");
  //console.log('successfully created the users table in musaic.db');



  db.run("CREATE TABLE friends (name TEXT, firstName TEXT, favSong TEXT, artist TEXT, chat TEXT, time TEXT, img TEXT)");

  db.run("INSERT INTO friends VALUES ('Hunter Lai', 'Hunter', 'Starboy', 'The Weekend', '15', '1h', 'css/ProfilePics/hunter.jpg')");
  db.run("INSERT INTO friends VALUES ('Alvin Ngo', 'Alvin', 'Shame', 'Hearts & Colors', '65', '2h', 'css/ProfilePics/alvin.jpg')");
  db.run("INSERT INTO friends VALUES ('Nathan Mansur', 'Nathan', 'Radioactive', 'Imagine Dragons', '45', '1h', 'css/ProfilePics/nathan.jpg')");
  db.run("INSERT INTO friends VALUES ('Luis Lu', 'Luis', 'Viva La Vida', 'Coldplay', '55', '4h', 'css/ProfilePics/luis.jpg')");
  db.run("INSERT INTO friends VALUES ('Jason Liu', 'Jason', 'Mine', 'Bazzi', '70', '5h', 'css/ProfilePics/jason.jpg')");
  db.run("INSERT INTO friends VALUES ('Justin Wu', 'Justin', 'Mic Drop', 'BTS', '80', '7h', 'css/ProfilePics/justin.jpg')");
  db.run("INSERT INTO friends VALUES ('Victoria Vu', 'Victoria', 'Stay', 'Zedd', '90', '12h', 'css/ProfilePics/victoria.jpg')");
  db.run("INSERT INTO friends VALUES ('Kenneth Truong', 'Kenneth', 'Better Now', 'Post Malone', '124', '1d', 'css/ProfilePics/kenneth.jpg')");
  db.run("INSERT INTO friends VALUES ('Nessa Vu', 'Nessa', 'The Middle', 'Zedd', '170', '3d', 'css/ProfilePics/nessa.jpg')");



  console.log('successfully created friends');   

  // db.run("CREATE TABLE users (name TEXT, favoriteSong TEXT, mostPlayedS TEXT, newestDiscovery TEXT, favoriteArtist TEXT, mostPlayedA TEXT, recentlyPlayed TEXT)");

  // // insert 3 rows of data:
  // db.run("INSERT INTO users VALUES ('Hunter', 'Starboy - The Weeknd', 'Pompeii - Bastille', 'Chun Li - Nicki Minaj', 'The Weeknd', 'Cash Cash', 'Mine - Bazzi')");
  // db.run("INSERT INTO users VALUES ('Nathan', 'Whatever It Takes - Imagine Dragons', 'Counting Stars - OneRepublic', 'Changed - Bazzi', 'Imagine Dragons', 'Imagine Dragons', 'Better Now - Post Malone')");
  // db.run("INSERT INTO users VALUES ('Luis', 'Starboy - The Weeknd', 'Pompeii - Bastille', 'Chun Li - Nicki Minaj', 'The Weeknd', 'Cash Cash', 'Mine - Bazzi')");

  

db.each("SELECT name, favSong, img FROM friends", (err, row) => {
      console.log(row.name + ": " + row.favSong + row.img);
  });
});


  // print them out to confirm their contents:
//   db.each("SELECT name, favoriteSong, mostPlayedS, newestDiscovery, favoriteArtist, mostPlayedA, recentlyPlayed  FROM users", (err, row) => {
//       console.log(row.name + ": " + row.favoriteSong + ' - ' + row.mostPlayedS + ' - ' + row.newestDiscovery + ' - ' + row.favoriteArtist + ' - ' + row.mostPlayedA + ' - ' + row.recentlyPlayed);
//   });
// });

db.close();