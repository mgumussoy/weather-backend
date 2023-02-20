const mongoose = require('mongoose')


const CityWeatherSchema = mongoose.Schema({

    lat: Number,
    lon: Number,
    temp: Number,
    feels_like: Number,
    temp_min: Number,
    temp_max: Number,
    humidity: Number,
    name: String,
    dt: Number,
    country: String,
    sunrise: Number,
    sunset: Number,
    details: String,
    icon: String,
    speed: Number,
    list: [{day: String, time: String, temp: Number, icon: String}],
    units: String,
    offset: Number
   
})

const CityWeather = mongoose.model('CityWeather', CityWeatherSchema)


module.exports = {
    CityWeather
}
