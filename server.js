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
app.post('/cities', function (req, res) {

    const reqCountry = req.body.country;
    if (!reqCountry) {
        return errorMessage(res, 500, 'No country specified');
    }

    const isoResult = getIsoFromCountry(reqCountry);
    if (isoResult.error) {
        return errorMessage(res, 500, isoResult.error);
    }

    // Get city data using ISO code
    if (isoResult.iso) {
        if (!cities.hasOwnProperty(isoResult.iso)) {
            return errorMessage(res, 500, 'Unknown city');
        }
        return res.send(JSON.stringify(cities[isoResult.iso]));
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
app.post('/valid/country', function (req, res) {

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
app.post('/valid/city', function (req, res) {

    if (!req.body.country) {
        return errorMessage(res, 500, 'No country specified');
    }

    const isoResult = getIsoFromCountry(req.body.country);
    if (isoResult.error) {
        return res.send(JSON.stringify({valid: false, error: isoResult.error}));
    }

    if (!req.body.city) {
        return errorMessage(res, 500, 'No city specified');
    }

    // At this point, we know cities contains an entry for the requested country as getIsoFromCountry was successful
    if (!cities[isoResult.iso].includes(req.body.city)) {
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
function getIsoFromCountry(reqCountry) {

    if (reqCountry.length == 2) {
        // Process ISO2 requests
        const upperCaseIso = reqCountry.toUpperCase();
        return cities.hasOwnProperty(upperCaseIso) ? {iso: upperCaseIso} : {error: 'Unknown ISO2 code: ' + upperCaseIso};
    }

    // Check for any matches in countries for reqCountry
    const matches = JSON.parse(countries).filter((country) => {
            return reqCountry.toLowerCase() === country.name.toLowerCase();
        });

    // Failure: Country can't be found
    if (matches.length == 0) {
         return {error: 'Unable to find data for country: ' + reqCountry}
    }
    // Failure: Ambiguous multiple results (should never happen)
    else if (matches.length > 1) {
        return {error: 'Ambiguous result, multiple country matches returned for ' + reqCountry +
                                '. Try request with ISO code instead'};
    }
    // Failure: No ISO code found (should never happen if the data is generated consistently)
    else if (!matches[0].iso) {
        return {error: 'No ISO code found for this country'};
    }
    // Success: Return ISO code
    else {
        return {iso: matches[0].iso};
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

/* curl -X GET localhost:8080/cities -H "Content-Type: application/json" -d '{"country":"gb"}' */
/* curl -X GET localhost:8080/valid -H "Content-Type: application/json" -d '{"country":"gb"}' */