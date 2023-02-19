const express = require('express');
const { cityWeatherService } = require('./services/cityWeatherService');

const app = express()

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/api/city', async (req,res)=> {
    cityWeatherService.get(req,res)
})

app.get('/api/randomCities', (req,res) => {
    cityWeatherService.getRandomCityNames(req,res)
})

app.post('/api/city', (req,res) =>{
    cityWeatherService.add(req,res)
})

app.get('/api/cities', (req,res) => {
    cityWeatherService.getAll(req,res)
})

app.get('/api/cityNames', (req,res) => {
    cityWeatherService.getAllCityNames(req,res)
})

app.get('/api/city/:id', (req,res) =>{
    cityWeatherService.getById(req,res)
})

app.delete('/api/delete/city/:id', (req, res) => {
    cityWeatherService.delete(req,res)
})

app.put('/api/update/city/:id', (req, res) => {
    cityWeatherService.update(req,res)
})


app.listen(8099, () => {

    console.log('Express is running!')
})


