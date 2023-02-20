const cities = require('cities.json');
const axios = require('axios')
const { DateTime } = require("luxon");
const { default: mongoose } = require('mongoose');
const {CityWeather} = require("../models/cityWeather")

require("dotenv").config();

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true})

// var cityNames = new Set(["Ankara", "Istanbul", "Izmir"])

const cityWeatherService = {

    get: async (req, res) => {

        try {

            const data = await getWeatherData(req.query,"weather","forecast")
       
            var cityWeather = new CityWeather(data)

            cityWeather.save((err, doc) => {

                if(!err){
                    res.status(201).json(doc)
                }else{
                    res.status(500).json(err)
                }
            })
            
        } catch (error) {

            const err = {
                message: error.message
            }

            res.status(500).json(err)
            
        }


    },

    add: (req, res) => {

        var cityWeather = new CityWeather(req.body)

        cityWeather.save((err, doc) => {

            if(!err){
                res.status(201).json(doc)
            }else{
                res.status(500).json(err)
            }

        })


    },

    getAll: (req,res) => {

        CityWeather.find({}, (err,docs) => {

            if(!err){
                res.json(docs)
            }else{
                res.status(500).json(err)
            }
        })

    },

    getById: (req, res) => {

        let id = req.params.id
        console.log(id)

        CityWeather.findById(id, (err,docs) => {

            if(!err){
                if(docs){
                    res.json(docs)
                }else{
                    res.status(404).json({'message': 'Not Found'})
                }
            }else{
                res.status(500).json(err)
            }
        })
        
    },

    delete: (req,res) => {

        let id = req.params.id

        CityWeather.findByIdAndDelete(id, (err,doc) => {

            if(!err){
                res.json(doc)
            }else{
                res.status(500).json(err)
            }

        })

    },

    update: (req,res) => {

        let id = req.params.id

        CityWeather.findByIdAndUpdate(id, req.body, {returnOriginal: false},(err,doc) => {

            if(!err){
                res.json(doc)
            }else{
                res.status(500).json(err)
            }

        })

    },

    getAllCityNames: (req,res) => {

        //res.json({cityNames: Array.from(cityNames), count: cityNames.size})

        let cityNamesDb = new Set()

        CityWeather.find({}, (err,docs) => {

            if(!err){

                docs.forEach(city => {
                    cityNamesDb.add(city.name)
                });

                res.json({cities: Array.from(cityNamesDb), count: cityNamesDb.size})

                
            }else{
                res.status(500).json(err)
            }
        })

    },

    getRandomCityNames: (req,res) =>{

        let cityNames = new Set(["Ankara", "Istanbul", "Izmir"])

        addCities(cityNames)

        res.json({cities: Array.from(cityNames), count: cityNames.size})

    }

}


const getWeatherData = async (query, infoType1, infoType2) => {

    let data = {}
    
    data.units = query.units != null ? query.units : "metric"

    await axios({
        method: "get",
        url: process.env.BASE_URL + "/" + infoType1,
        params: {
          appid: process.env.API_KEY,
          ...query
        },
    }).then(async (response) => {

            data.lat = response.data.coord.lat
            data.lon = response.data.coord.lon
            data.temp = response.data.main.temp
            data.feels_like = response.data.main.feels_like
            data.temp_min = response.data.main.temp_min
            data.temp_max = response.data.main.temp_max
            data.humidity = response.data.main.humidity
            data.name = response.data.name
            data.dt = response.data.dt
            data.country = response.data.sys.country
            data.sunrise = response.data.sys.sunrise
            data.sunset = response.data.sys.sunset
            data.speed = response.data.wind.speed
            data.offset = Math.ceil(response.timezone / 3600)

            data.details = response.data.weather[0].main
            data.icon = response.data.weather[0].icon

            await axios({
            method: "get",
            url: process.env.BASE_URL + "/" + infoType2,
            params: {
              appid: process.env.API_KEY,
              lat: data.lat,
              lon: data.lon,
              units: data.units
            },
        }).then((response) => {

            let {city, list} = response.data;
            let offset = city.timezone

            list = list.slice(1,6).map(l => {
                return {
                    day: formatToLocalTime(l.dt + offset, 'ccc'),
                    time: formatToLocalTime(l.dt + offset, 'hh:mm a'),
                    temp: l.main.temp,
                    icon: l.weather[0].icon
                }
            })

            data.list = list
            data.offset = offset

        })
    })

    return data

}

const formatToLocalTime = (
    secs,
    format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone('utc').toFormat(format);




const uploadCities = () =>{

    cityNames.forEach(async (name) => {

        try{

            console.log(name)
            
            const data = await getWeatherData({q:name})
        
            let cityWeather = new CityWeather(data)

            cityWeather.save((err, doc) => {

                if(err){
                    console.log(err)
                }
            })

        }catch (error){

            console.log(error)

        }


    })

}

const addCities= (cityNames) => {

    let count = cities.length

    while(cityNames.size < 200){

        cityNames.add(cities[randBetween(0,count-1)].name)
    }

}

const randBetween = (min, max) => {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

// rastgele şehir seçmek için
// addCities() 
// rastgele seçilen şehirlerin hava durumunu dbye aktarmak için
//uploadCities()

const checkIfCity = (name) =>{

    CityWeather.findOne({name: name}, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Result : ", docs);
        }
    });


}

const toTitleCase = str => str.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase())


module.exports = {
    cityWeatherService
}
