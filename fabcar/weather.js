/**
@author: dhananjay patil
@version: 1.0
@date: 03/10/2017
@Description: Weather Data API  
**/
// This file will Interact with IBM weather Data and it will return forecast.
var express = require('express');
var request = require('request');
var cfenv = require('cfenv');

//Security - helmet
var helmet = require('helmet');

//setup middleware
var app = express();
var ninetyDaysInMilliseconds = 7776000000;

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
var weather_host = appEnv.services["weatherinsights"] 
        ? appEnv.services["weatherinsights"][0].credentials.url // Weather credentials passed in
        : "https://c0c9c05e-ed89-429c-88e2-daffb83ce568:hqlvdlSrDM@twcservice.au-syd.mybluemix.net"; // or copy your credentials url here for standalone

function weatherAPI(path, qs, done) {
    var url = weather_host + path;
    console.log(url, qs);
    request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json"
        },
        qs: qs
    }, function(err, req, data) {
        if (err) {
            done(err);
        } else {
            if (req.statusCode >= 200 && req.statusCode < 400) {
                try {
                    done(null, JSON.parse(data));
                } catch(e) {
                    console.log(e);
                    done(e);
                }
            } else {
                console.log(err);
                done({ message: req.statusCode, data: data });
            }
        }
    });
}

app.get('/api/forecast/daily', function(req, res) {
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/10day.json", {
        units: req.query.units || "e",
        language: req.query.language || "en-US"
    }, function(err, result) {
        if (err) {
        	console.log(err);
            res.send(err).status(400);
        } else {
        	console.log("10 days Forecast");
            res.json(result);
        }
    });
});

app.get('/api/forecast/daily/3days', function(req, res) {
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/3day.json", {
        units: req.query.units || "e",
        language: req.query.language || "en-US"
    }, function(err, result) {
        if (err) {
        	console.log(err);
            res.send(err).status(400);
        } else {
        	console.log("3 days Forecast");
            res.json(result);
        }
    });
});

app.get('/api/forecast/hourly', function(req, res) {
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/hourly/48hour.json", {
        units: req.query.units || "m",
        language: req.query.language || "en"
    }, function(err, result) {
        if (err) {
            res.send(err).status(400);
        } else {
        	console.log("24 hours Forecast");
            result.forecasts.length = 24;    // we require only 24 hours for UI
            res.json(result);
        }
    });
});

app.listen(appEnv.port, appEnv.bind, function() {
  console.log("server starting on " + appEnv.url);
});
