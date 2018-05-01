// Based on Philip Guo's code
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('musaic.db');

// run each database statement *serially* one after another
// (if you don't do this, then all statements will run in parallel,
//  which we don't want)
db.serialize(() => {
  // create a new database table:
  db.run("CREATE TABLE users (name TEXT, favoriteSong TEXT, mostPlayedS TEXT, newestDiscovery TEXT, favoriteArtist TEXT, mostPlayedA TEXT, recentlyPlayed TEXT)");

  // insert 3 rows of data:
  db.run("INSERT INTO users VALUES ('Hunter', 'Starboy - The Weeknd', 'Pompeii - Bastille', 'Chun Li - Nicki Minaj', 'The Weeknd', 'Cash Cash', 'Mine - Bazzi')");
  db.run("INSERT INTO users VALUES ('Nathan', 'Whatever It Takes - Imagine Dragons', 'Counting Stars - OneRepublic', 'Changed - Bazzi', 'Imagine Dragons', 'Imagine Dragons', 'Better Now - Post Malone')");
  db.run("INSERT INTO users VALUES ('Luis', 'Starboy - The Weeknd', 'Pompeii - Bastille', 'Chun Li - Nicki Minaj', 'The Weeknd', 'Cash Cash', 'Mine - Bazzi')");

  console.log('successfully created the users table in musaic.db');

  // print them out to confirm their contents:
  db.each("SELECT name, favoriteSong, mostPlayedS, newestDiscovery, favoriteArtist, mostPlayedA, recentlyPlayed  FROM users", (err, row) => {
      console.log(row.name + ": " + row.favoriteSong + ' - ' + row.mostPlayedS + ' - ' + row.newestDiscovery + ' - ' + row.favoriteArtist + ' - ' + row.mostPlayedA + ' - ' + row.recentlyPlayed);
  });
});

db.close();