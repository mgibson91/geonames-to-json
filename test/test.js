const assert  = require('assert')

const axios = require('axios').create({
    baseURL: 'http://localhost:' + process.env.PORT || 8080
});

// Returns true if exactly one match is found
function checkForCountry(countries, expectedIso, expectedName) {
    return countries.filter((country) => (country.iso == expectedIso && country.name == expectedName)).length == 1;
}

function verifyCountries(countries) {
    assert(checkForCountry(countries, 'US', 'United States'));
    assert(checkForCountry(countries, 'GB', 'United Kingdom'));
    assert(checkForCountry(countries, 'DE', 'Germany'));
    assert(checkForCountry(countries, 'GR', 'Greece'));
    assert(checkForCountry(countries, 'ZW', 'Zimbabwe'));
}

function verifyGbCities(cities) {
    assert(cities.indexOf('London') > -1);
    assert(cities.indexOf('Manchester') > -1);
    assert(cities.indexOf('Edinburgh') > -1);
    assert(cities.indexOf('Cardiff') > -1);
    assert(cities.indexOf('Belfast') > -1);
}

function buildRequest(requestType, url, data) {
    return {
        method: requestType.toUpperCase(),
        url: url,
        headers: {'Content-Type': 'application/json'},
        data: data
    }
}

describe('Geonames service tests', () => {
    describe('Countries', () => {
        it ('Should correctly return a range of known countries', () => {
            return axios.get('/countries')
                .then((response) => {verifyCountries(JSON.parse(response.data));})
                .catch((error)   => {assert.fail(error);})
        })

        it ('Should respond with 404 if incorrect parameter is sent', () => {
            return axios.get('/incorrect')
                .then((response) => {assert.fail('Incorrect call should have failed');})
                .catch((error)   => {assert.equal(error.response.status, 404)})
        })
    })

    describe('Cities', () => {

        // ISO2
        describe('Should be able to query cities using country ISO2 code', () => {

            it('GB - UPPER CASE', () => {
                return axios(buildRequest('POST','/cities', {country: 'GB'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })

            it('gb - lower case', () => {
                return axios(buildRequest('POST','/cities', {country: 'gb'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })

            it('gB - mixed case', () => {
                return axios(buildRequest('POST','/cities', {country: 'Gb'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })
        })

        // Name
        describe('Should be able to query cities using country name', () => {

            it ('UNITED KINGDOM - UPPER CASE', () => {
                return axios(buildRequest('POST','/cities', {country: 'UNITED KINGDOM'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })

            it ('United Kingdom - Mixed Case', () => {
                return axios(buildRequest('POST','/cities', {country: 'United Kingdom'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })

            it ('united kingdom - lower case', () => {
                return axios(buildRequest('POST','/cities', {country: 'united kingdom'}))
                    .then((response) => {verifyGbCities(JSON.parse(response.data));})
                    .catch((error)   => {assert.fail(error);})
            })
        })

        // Invalid queries
        describe('Handling invalid queries', () => {
            it ('Unknown country - /cities?country=Unknown', () => {
                return axios(buildRequest('POST','/cities', {country: 'Unknown'}))
                    .then((response) => {
                        verifyGbCities(JSON.parse(response.data));
                    })
                    .catch((error) =>   {
                        assert.equal(error.response.status, 500);
                        assert(error.response.data.error.includes('Unable to find data for country'));
                    })
            })

            it ('No country value - /cities?country', () => {
                return axios.post('/cities?country')
                    .then((response) => {
                        verifyGbCities(JSON.parse(response.data));
                    })
                    .catch((error) =>   {
                        assert.equal(error.response.status, 500);
                        assert(error.response.data.error.includes('No country specified'));
                    })
            })

            it ('No country parameter - /cities?', () => {
                return axios.post('/cities?')
                    .then((response) => {
                        verifyGbCities(JSON.parse(response.data));
                    })
                    .catch((error) =>   {
                        assert.equal(error.response.status, 500);
                        assert(error.response.data.error.includes('No country specified'));
                    })
            })

            it ('No query parameter - /cities', () => {
                return axios.post('/cities')
                    .then((response) => {
                        verifyGbCities(JSON.parse(response.data));
                    })
                    .catch((error) =>   {
                        assert.equal(error.response.status, 500);
                        assert(error.response.data.error.includes('No country specified'));
                    })
            })
        })

        // Testing the validation queries
        describe('Validation - Country', () => {

            describe('Should report valid countries as valid - ISO2', () => {

                it ('UPPER CASE - GB', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'GB'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('lower case - gb', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'gb'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('Mixed Case - Gb', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'Gb'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })
            })

            describe('Should report valid countries as valid - country name', () => {

                it ('UPPER CASE - UNITED KINGDOM', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'UNITED KINGDOM'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('lower case - united kingdom', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'united kingdom'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('Mixed Case - United Kingdom', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'United Kingdom'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })
            })

            describe('Should report invalid countries as invalid', () => {
                it ('Country: Unknown', () => {
                    return axios(buildRequest('POST','/valid/country', {country: 'Unknown'}))
                        .then((response) => {assert.equal(response.data.valid, false)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('Should report 500 error when no country parameter specified', () => {
                    return axios.post('/valid/country')
                        .then((response) => {assert.equal(response.data.valid, false)})
                        .catch((error) =>   {
                            assert.equal(error.response.status, 500);
                            assert(error.response.data.error.includes('No country specified'));
                        })
                })
            })
        })

        describe('Validation - Cities', () => {
                it ('Should report valid cities as valid', () => {
                    return axios(buildRequest('POST','/valid/city', {country: 'GB', city: 'London'}))
                        .then((response) => {assert.equal(response.data.valid, true)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('Should report invalid cities as invalid', () => {
                    return axios(buildRequest('POST','/valid/city', {country: 'GB', city: 'Londonn'}))
                        .then((response) => {assert.equal(response.data.valid, false)})
                        .catch((error) =>   {assert.fail(error);})
                })

                it ('Should report 500 error when no country is specified', () => {
                    return axios(buildRequest('POST','/valid/city', {city: 'Londonn'}))
                        .then((response) => {assert.fail('Expected 500 failure')})
                        .catch((error) =>   {
                            assert.equal(error.response.status, 500);
                            assert(error.response.data.error.includes('No country specified'));
                        })
                })

                it ('Should report 500 error when no city is specified', () => {
                    return axios(buildRequest('POST','/valid/city', {country: 'GB'}))
                        .then((response) => {assert.fail('Expected 500 failure')})
                        .catch((error) =>   {
                            assert.equal(error.response.status, 500);
                            assert(error.response.data.error.includes('No city specified'));
                        })
                })
        })
    })
})