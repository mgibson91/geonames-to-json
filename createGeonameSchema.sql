DROP SCHEMA IF EXISTS geonameData;
CREATE SCHEMA geonameData DEFAULT CHARACTER SET utf8mb4;;
USE geonameData;

DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS places;

CREATE TABLE countries (
  iso char(2) DEFAULT NULL,
  iso3 char(3) DEFAULT NULL,
  isoNumeric int(11) DEFAULT NULL,
  fipsCode varchar(3) DEFAULT NULL,
  name varchar(200) DEFAULT NULL,
  capital varchar(200) DEFAULT NULL,
  areaInSqKm double DEFAULT NULL,
  population int(11) DEFAULT NULL,
  continent char(2) DEFAULT NULL,
  tld char(3) DEFAULT NULL,
  currencyCode char(3) DEFAULT NULL,
  currencyName char(20) DEFAULT NULL,
  phone char(10) DEFAULT NULL,
  postalCodeFormat varchar(100) DEFAULT NULL,
  postalCodeRegex varchar(255) DEFAULT NULL,
  languages varchar(200) DEFAULT NULL,
  geonameId int(11) DEFAULT NULL,
  neighbours char(100) DEFAULT NULL,
  equivalentFipsCode char(10) DEFAULT NULL,
  KEY iso (iso),
  KEY iso3 (iso3),
  KEY isoNumeric (isoNumeric),
  KEY fipsCode (fipsCode),
  KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE places (
  geonameId int(11) NOT NULL,
  name varchar(200) DEFAULT NULL,
  asciiName varchar(200) DEFAULT NULL,
  alternateNames varchar(4000) DEFAULT NULL,
  latitude decimal(10,7) DEFAULT NULL,
  longitude decimal(10,7) DEFAULT NULL,
  featureClass char(1) DEFAULT NULL,
  featureCode varchar(10) DEFAULT NULL,
  countryCode varchar(2) DEFAULT NULL,
  cc2 varchar(200) DEFAULT NULL,
  admin1Code varchar(20) DEFAULT NULL,
  admin2Code varchar(80) DEFAULT NULL,
  admin3Code varchar(20) DEFAULT NULL,
  admin4Code varchar(20) DEFAULT NULL,
  population int(11) DEFAULT NULL,
  elevation int(11) DEFAULT NULL,
  gtopo30 int(11) DEFAULT NULL,
  timezone varchar(40) DEFAULT NULL,
  modificationDate date DEFAULT NULL,
  PRIMARY KEY (geonameId),
  KEY name (name),
  KEY asciiName (asciiName),
  KEY latitude (latitude),
  KEY longitude (longitude),
  KEY featureClass (featureClass),
  KEY featureCode (featureCode),
  KEY countryCode (countryCode),
  KEY cc2 (cc2),
  KEY admin1Code (admin1Code),
  KEY population (population),
  KEY elevation (elevation),
  KEY timezone (timezone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

