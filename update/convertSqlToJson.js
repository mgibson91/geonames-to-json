const sql = require('mysql');
const fs  = require('fs');

/**
 * Expects dbConfig.js file in the following format:
   module.exports = {
     "host" : "<host>",
     "user" : "<user>",
     "password" : "<password>",
     "database" : "<databaseName>"
}
 */
const dbConfig = require('./dbConfig');
const con = sql.createConnection(dbConfig);

// Create data folders if they don't exist
createDataDirectories();

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

con.query('SELECT * FROM countries;', function(countryError, countryResults) {

    updateCountryFile(countryResults);

    // For each country
    countryResults.forEach(function(country) {

        const query = sql.format('SELECT asciiName FROM places WHERE countryCode = ?;', country.iso);
        con.query(query, function(placeError, cityResults) {
            updateCityFile(cityResults, country.iso);
        })
    });

    con.end();
});

function createDataDirectories() {
    if (!fs.existsSync('../data')){
        fs.mkdirSync('../data');
    }

    if (!fs.existsSync('../data/cities')){
        fs.mkdirSync('../data/cities');
    }
}

function overwriteFile(file, newContent) {
    if (fs.existsSync(file)) {
        fs.truncateSync(file, 0);
    }

    fs.appendFileSync(file, newContent);
}

/** Create 'countries.json' file including an array of country objects containing country code and name */
function updateCountryFile(countryResults) {
    const countries = countryResults.map(function(countryEntry){return {iso: countryEntry.iso, name: countryEntry.name}});
    overwriteFile('../data/countries.json', JSON.stringify(countries));
}

/** Create  'cities/<countryCode>.json' file */
function updateCityFile(cityResults, countryCode) {
    const cityNames = cityResults.map((city) => city.asciiName);
    overwriteFile('../data/cities/' + countryCode + '.json', JSON.stringify(cityNames));
}