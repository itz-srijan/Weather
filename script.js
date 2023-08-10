const cityInput = document.querySelector("#search-bar")
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityWeather());

const timeEl = document.getElementById("time")
const dateEl = document.getElementById("date")
const tempEl = document.getElementById("temp")
const weatherEL = document.getElementById("weather")
const forecastDiv = document.querySelector(".future-days")

const locationEl = document.getElementById("location")
const countryEl = document.getElementById("country")
const positionEl = document.getElementById("position")
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const time_API_KEY = '03MKU6HX0SBL'
const API_KEY = '4e1de61172f50e375e97414f6f2e625a'

// getting current time for every second 
const myInterval = setInterval(
    function(){
        const time = new Date()
        const day = time.getDay()
        const month = time.getMonth()
        const date = time.getDate()
        const hour = time.getHours()
        const hourInTweleve = hour >= 13 ? hour % 12 : hour
        const mins = time.getMinutes()
        const amPm = hour > 12 ? 'PM' : 'AM'

        // set time 
        timeEl.innerHTML = (hourInTweleve < 10 ? '0' + hourInTweleve : hourInTweleve) + ':' + (mins < 10 ? '0' + mins : mins) + `<span id="am-pm">${amPm}</span>`

        dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month]
    }, 1000)

getCurrentLocationWeather()

//weather updates of current user location
function getCurrentLocationWeather() {
        navigator.geolocation.getCurrentPosition((success) => {
        let { latitude, longitude } = success.coords
        getCurrentWeatherData(latitude, longitude)
        getForecastData(latitude, longitude)
    })
}
//getting weather of a city
let newCountry = "";
let newPlace = "";
function getCityWeather() {
    clearInterval(myInterval)

    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEO_API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        console.log(data)
        const { lat, lon,} = data[0]
        newCountry = data[0].country
        newPlace = data[0].name
        getCurrentWeatherData(lat, lon)
        getForecastData(lat, lon)
        timeEl.innerHTML = ""
        dateEl.innerHTML = ""
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
    cityInput.value = ''   
}

// current weather
function getCurrentWeatherData(latitude, longitude) {
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`).then(res => res.json()).then(data => {
        console.log(data)
        showWeatherData(data)
        setTimeZone(data)
    })
}
// forecast weather
function getForecastData(latitude, longitude) {
    
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`).then(res => res.json()).then(newData => {
        // filter the forecast to get one forecast per day
        const uniqueForecastDays = []
        const fiveDaysForecast = newData.list.filter(forecast => {
            const forecastDate1 = new Date(forecast.dt_txt).getDate()
            if (!uniqueForecastDays.includes(forecastDate1)) {
                return uniqueForecastDays.push(forecastDate1)
            }
        });
        forecastDiv.innerHTML = ""
        fiveDaysForecast.forEach((weatherItem, index) => forecastDiv.insertAdjacentHTML("beforeend", createForecast(weatherItem, index)))
    })

}


// for timezone of weather
function setTimeZone(data) {
    let name = ""
    let country = ""
    if(newCountry === "" && newPlace === ""){
       name = data.name
       country = data.sys.country 
    }
    else{
        name = newPlace
        country = newCountry
        newCountry = ""
        newPlace = ""
    }
    let { lon, lat } = data.coord
    locationEl.innerHTML = name
    countryEl.innerHTML = country
    positionEl.innerHTML = lon + '° N' + ' / ' + lat + '° E'
}

// for current weather details
function showWeatherData(data) {
    changeBackground(data)
    let currentDescription = data.weather[0].main
    let { sunrise, sunset } = data.sys
    let wind = data.wind
    let clouds = data.clouds.all
    let { feels_like, humidity, pressure, temp,
    } = data.main
    weatherEL.innerHTML =
        `<div class="temperature" id="temp">${parseInt(temp)} <span>°C</span>
         <span >${currentDescription}
        </span>
    </div>
    <div class="weather-items">
        <div>Feels Like</div>
        <div>${parseInt(feels_like)} <span>°C</span>
        </div>
    </div>
    <div class="weather-items">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div> 
    <div class="weather-items">
        <div>Pressure</div>
        <div>${pressure}hPa</div>
    </div>
    <div class="weather-items">
        <div>Cloud</div>
        <div>${clouds}%</div>
    </div>
    <div class="weather-items">
        <div>Wind</div>
        <div>${wind.speed}m/s</div>
    </div>
    <div class="weather-items">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-items">
        <div>Sunset</div>
        <div>${window.moment(sunset * 1000).format('HH:mm a')}</div>
    </div>
    `
}
// for forecast weather details 
const createForecast = (weatherItem, index) => {
    // console.log(weatherItem)
    let date = new Date()
    let day = date.getDay();
    if (index != 0)
        return `<div class="future-days-item">
    <div class="future-container">
    <div><div class="day">${days[(day+index)%7]}
    </div></div>
    <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="icon">
    </div>
    <div class="weather-update">
        <div class="forecast-temp">${parseInt(weatherItem.main.temp)} °C</div>
        <div style="font-size: 15px; font-weight: 400">${weatherItem.weather[0].main}</div>
        <div>Humidity <span>${weatherItem.main.humidity}%</span></div>
        <div>Clouds <span>${weatherItem.clouds.all}%</span></div>
    </div>
</div>`;
    else return "";
}
// changing background according to weather 
function changeBackground(data) {
    const backgroundData = {
        "01d": 'url("./image/clear_sky.jpg")',
        "01n": 'url("./image/clear_night_sky.jpg")',
        "02d": 'url("./image/cloudy.jpg")',
        "02n": 'url("./image/cloudy.jpg")',
        "03d": 'url("./image/broken_clouds.jpg")',
        "03n": 'url("./image/broken_clouds.jpg")',
        "04d": 'url("./image/broken_clouds.jpg")',
        "04n": 'url("./image/broken_clouds.jpg")',
        "13n": 'url("./image/snow_night.jpg")',
        "13d": 'url("./image/snow_day.jpg")',
        "09n": 'url("./image/shower_rain_night.jpg")',
        "09d": 'url("./image/shower_rain.jpg")',
        "10n": 'url("./image/rain_night.jpg")',
        "10d": 'url("./image/rain.jpg")',
        "11d": 'url("./image/thunder_storm.jpg")',
        "11n": 'url("./image/thunder_storm.jpg")',
        "50n": 'url("./image/haze.jpg")'
    };
    const moreBackGround = {
        Tornado : 'url("./image/tornado.jpg")',
        Mist : 'url("./image/mist.jpg")',
        Haze : 'url("./image/haze.jpg")',
        Fog : 'url("./image/fog.jpg")',
        Sand : 'url("./image/sand.jpg")',
        Smoke : 'url("./image/smoke.jpg")', 
        Dust : 'url("./image/dust.jpg")'
    }
   
    const icon = data.weather[0].icon 
    let image_url = ""
    if(icon === "50d" || icon === "50n"){
        image_url = moreBackGround[data.weather[0].main]      
    }
    else{
        image_url = backgroundData[icon]
    }
    // console.log(image_url)
    document.querySelector("body").style.backgroundImage = image_url
} 
