const fs      = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

let countries = {};
let cities    = {};
populateCache();

let app = express();
app.use(bodyParser.json());

app.use(function(req, res, next)
{
    // TODO: Allows requests from any origin - This should be changed
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

/** Start server */
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
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
        return errorMessage(res, 500, 'No country specified');
    }

    let countryIso;

    // If not ISO2 format, convert to IS02
    if (reqCountry.length > 2) {

        const isoResult = getIsoFromCountryName(reqCountry);
        if (isoResult.error) {
            return errorMessage(res, 500, isoResult.error);
        }
        else {
            countryIso = matches[0].iso;
        }
    }
    else {
        countryIso = reqCountry.toUpperCase();
    }

    // Get city data using ISO code
    if (countryIso) {
        if (!cities.hasOwnProperty(countryIso)) {
            return errorMessage(res, 500, 'Unknown city');
        }
        return res.send(JSON.stringify(cities[countryIso]));
    }
    else {
        return errorMessage(res, 500, 'Unable to get city data');
    }
});

/**
 * Checks if a given country is valid
 *
 * 200 Success: {valid: boolean}
 * 200 Failure: {valid: boolean, error: string}
 *
 * 500 Failure: {error: string}
 */
app.get('/valid/country', function (req, res) {

    if (!req.body.country) {
        return errorMessage(res, 500, 'No country specified');
    }

    const isoResult = getIsoFromCountry(req.body.country);
    if (isoResult.error) {
        return res.send(JSON.stringify({valid: false, error: isoResult.error}));
    }
    else {
        return res.send(JSON.stringify({valid: true}));
    }
});

/**
 * Checks if a given country : city pair is valid
 *
 * 200 Success: {valid: boolean}
 * 200 Failure: {valid: boolean, error: string}
 *
 * 500 Failure: {error: string}
 */
app.get('/valid/city', function (req, res) {

    if (!res.req.query.country) {
        return errorMessage(res, 500, 'No country specified');
    }

    const isoResult = getIsoFromCountry(req.body.country);
    if (isoResult.error) {
        return res.send(JSON.stringify({valid: false, error: isoResult.error}));
    }

    if (!res.req.query.city) {
        return errorMessage(res, 500, 'No city specified');
    }

    if (!cities.hasOwnProperty(isoResult.iso)) {
        return res.send(JSON.stringify({valid: false, error: 'Unknown city'}));
    }
    else {
        return res.send(JSON.stringify({valid: true}));
    }
});

function errorMessage(res, code, message) {
    if (res) {
        if (message) {
            res.status(code);
            res.contentType("application/json");
            res.send({error: message});
        }
        else {
            res.sendStatus(code);
            res.end();
        }
    }
}

/**
 * Returns the ISO2 for a country name if it exists.
 *
 * On success, result.iso will be populated and result.error will be empty
 * On failure, result.iso will be empty and result.error will be populated
 *
 * @param {string} requestedCountry
 * @returns {iso: string, error: string}
 */
function getIsoFromCountryName(requestedCountry) {
    const matches = JSON.parse(countries).filter((country) => {
            return requestedCountry.toLowerCase() === country.name.toLowerCase();
        });

    // Failure: Country can't be found
    if (matches.length == 0) {
         return {iso: '', error: 'Unable to find data for country: ' + requestedCountry}
    }
    // Failure: Ambiguous multiple results (should never happen)
    else if (matches.length > 1) {
        return {iso: '', error: 'Ambiguous result, multiple country matches returned for ' + requestedCountry +
                                '. Try request with ISO code instead'};
    }
    // Failure: No ISO code found (should never happen if the data is generated consistently)
    else if (!matches.iso) {
        return {iso: '', error: 'No ISO code found for this country'};
    }
    // Success: Return ISO code
    else {
        return {iso: matches[0].iso, error: ''};
    }
}

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