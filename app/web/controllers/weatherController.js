var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    requestIp    = require('request-ip'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    env             = require('dotenv').config();

router.get('/', async function(req, res) {
    try {
        let ip = requestIp.getClientIp(req);
        // ip = '27.72.98.102';
        let urlIp = 'http://api.ipstack.com/' + ip +'?access_key=06c2037cb963267e7fd55af19d14afc6&format=1';
        webService.addRecordTable({"examine_id":ip},'log_info');
        let dataIp = await webService.callApiAll(urlIp,{},{},'GET');
        let lat = '20.996070861816406';
        let lon = '105.80506134033203';
        let apikey = env.parsed.OPENWEATHER;
        weather = {
            name: '',
            icon: '01d',
            temp: 0,
            feels_like: 0,
            description: 'Trời nắng',
            humidity: 0,
            temp_min: 0,
            temp_max: 0,
            wind_speed: 0,
            wind_deg: 0,
            sunset: Date.now(),
            sunrise: Date.now()
        }
        if(dataIp && dataIp.success){
            console.log("ip",dataIp.data.success && dataIp.data.success == false, dataIp.data);
            if(!((dataIp.data.success && dataIp.data.success == false) || (dataIp.data.zip == null))){
                lat = dataIp.data.latitude;
                lon = dataIp.data.longitude;
            }
        }
        let urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=vi&appid=${apikey}`;
        let dataCurrentWeather = await webService.callApiAll(urlWeather,{},{},'GET');
        if(dataCurrentWeather.success && dataCurrentWeather.success == true && dataCurrentWeather.data.cod && dataCurrentWeather.data.cod == 200){
            let currentWeather = dataCurrentWeather.data;
            weather = {
                name: currentWeather.name,
                icon: currentWeather.weather.length > 0 ? currentWeather.weather[0].icon : '01d',
                temp: Math.round(currentWeather.main.temp),
                feels_like: Math.round(currentWeather.main.temp),
                description: currentWeather.weather.length > 0 ? currentWeather.weather[0].description : 'Trời nắng',
                humidity: currentWeather.main.humidity,
                temp_min: Math.round(currentWeather.main.temp_min),
                temp_max: Math.round(currentWeather.main.temp_max),
                wind_speed: currentWeather.wind.speed,
                wind_deg: currentWeather.wind.deg,
                sunset: '' + currentWeather.sys.sunset,
                sunrise: currentWeather.sys.sunrise
            }
            console.log("currentWeather", currentWeather, weather, moment.unix(currentWeather.sys.sunset).format("hh:mm:ss"), moment.unix(currentWeather.sys.sunrise).format("hh:mm:ss"));
        }
        // webService.getDataWeather();
        res.render('weather/index.ejs', {
            moment: moment,
            link:'weather',
            weather: weather
        });
    } catch (e) {
        console.log("error", e);
    }
});

module.exports = router;