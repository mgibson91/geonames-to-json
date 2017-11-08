USE geonameData;

-- Requires the countryInfo.txt file, downloadable from geonames
SELECT '########## Loading countries... ##########';
LOAD DATA LOCAL INFILE 'download/countryInfo.txt'
INTO TABLE countries
CHARACTER SET 'utf8mb4'
IGNORE 51 LINES
(iso, iso3, isoNumeric, fipsCode, name, capital, areaInSqKm, population, continent, tld, currencyCode, currencyName, phone, postalCodeFormat, postalCodeRegex, languages, geonameId, neighbours, equivalentFipsCode);

-- Requires a primary geoname data file, i.e. allCountries.txt, cities15000.txt etc. (found in corresponding .zip files)
SELECT '########## Loading places... ##########';
LOAD DATA LOCAL INFILE 'download/cities15000.txt'
INTO TABLE places
CHARACTER SET 'utf8mb4'
(geonameId, name, asciiName, alternateNames, latitude, longitude, featureClass, featureCode, countryCode, cc2, admin1Code, admin2Code, admin3Code, admin4Code, population, elevation, gtopo30, timezone, modificationDate);


