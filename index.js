const fs      = require('fs');
const express = require('express')

let countries = {};
let cities    = {};
populateCache();

app = express()

app.use(function(req, res, next)
{
    // TODO: Allows requests from any origin - This should be changed
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

/** Start server */
app.listen(8000, function () {
    console.log('Location server started');
})

/** Return JSON array of countries */
app.get('/countries', function (req, res) {

    res.send(JSON.stringify(countries));
});

/** Return JSON array of cities for requested country code */
app.get('/cities', function (req, res) {

    country = res.req.query.country;

    if (country) {
        if (!cities.hasOwnProperty(country)) {
            res.status(500);
            res.send('Unknown city\n');
        }
        res.send(JSON.stringify(cities[country]));
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
    countries = fs.readFileSync('./countries.json', 'utf8');
}

function loadCityData() {
    fs.readdirSync('./cities').forEach(file => {

        const countryCode = file.slice(0, 2);
        const countryCities = fs.readFileSync('./cities/' + file, 'utf8');

        cities[countryCode] = countryCities;
    });
}