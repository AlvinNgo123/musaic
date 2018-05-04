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



  db.run("CREATE TABLE friends (name TEXT, favSong TEXT, img TEXT)");

  db.run("INSERT INTO friends VALUES ('Hunter Lai', 'Starboy', 'Hunter.jpg')");
  db.run("INSERT INTO friends VALUES ('Alvin Ngo', 'Shame', 'Alvin.jpg')");
  db.run("INSERT INTO friends VALUES ('Luis Lu', 'Viva La Vida', 'Luis.jpg')");

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