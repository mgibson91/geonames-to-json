const fs      = require('fs');
const express = require('express');

let countries = {};
let cities    = {};
populateCache();

app = express();

app.use(function(req, res, next)
{
    // TODO: Allows requests from any origin - This should be changed
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

/** Start server */
app.listen(8000, function () {
    console.log('Location server started');
});

/** Return JSON array of countries */
app.get('/countries', function (req, res) {

    res.send(JSON.stringify(countries));
});

/** Return JSON array of cities for requested country code */
app.get('/cities', function (req, res) {

    const reqCountry = res.req.query.country;
    if (!reqCountry) {
        res.status(500);
        res.send('No country specified\n');
        return;
    }

    let countryIso;

    // If not ISO2 format, convert to IS02
    if (reqCountry.length > 2) {
        // TODO: Catch JSON parse error
        const matches = JSON.parse(countries).filter(
            function(country){
               return reqCountry.toLowerCase() === country.name.toLowerCase();
            });

        // If not ISO format but the name can't be found either, return error.
        if (matches.length == 0) {
            res.status(500);
            res.send('Invalid country\n');
            return;
        } else if (matches.length > 1) {
            res.status(500);
            res.send('Error. Multiple country matches returned for ' + reqCountry + '\n');
            return;
        }

        // A corresponding ISO code has been found using the country name
        countryIso = matches[0].iso;

    } else {
        countryIso = reqCountry.toUpperCase();
    }

    if (countryIso) {
        if (!cities.hasOwnProperty(countryIso)) {
            res.status(500);
            res.send('Unknown city\n');
        }
        res.send(JSON.stringify(cities[countryIso]));
    }
    else {
        res.status(500);
        res.send('Unable to get city data\n');
    }
});

function populateCache() {
    loadCountryData();
    loadCityData();
}

function loadCountryData() {
    countries = fs.readFileSync('./data/countries.json', 'utf8');
}

function loadCityData() {
    fs.readdirSync('./data/cities').forEach(file => {

        const countryCode = file.slice(0, 2);
        const countryCities = fs.readFileSync('./data/cities/' + file, 'utf8');

        cities[countryCode] = countryCities;
    });
}