#!/bin/bash

user=""
password=""
database=""

function usage()
{
   echo "./updateGeonamesData.sh -u<user> -p<password> -d<database>"
}

while getopts u:d:p:f: option
do
    case "${option}"
    in
        u) user=${OPTARG};;
        p) password=${OPTARG};;
        d) database=${OPTARG};;
        h) usage;;
    esac
done

if [[ -z "${user// }" ]]; then
    echo "'--user|-u' field required. Use the '--help|-h' for more information."
    exit 1
elif [[ -z "${password// }" ]]; then
    echo "'--password|-p' field required. Use the '--help|-h' for more information."
    exit 1
elif [[ -z "${database// }" ]]; then
    echo "'--database|-p' field required. Use the '--help|-h' for more information."
    exit 1
fi

dataDir="data"
rm -rf "$dataDir"
mkdir -p "$dataDir"/cities

# Go to data directory
cd "$dataDir"

# Download and unzip country/city info
wget http://download.geonames.org/export/dump/countryInfo.txt
wget http://download.geonames.org/export/dump/cities15000.zip
unzip cities15000.zip

# Go back to previous directory
cd -

mysql -u"$user" -p"$password" "$database" < createGeonameSchema.sql
mysql -u"$user" -p"$password" "$database" < importGeonameDataIntoDatabase.sql

node convertSqlToJson.js