const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

const weatherInfo = document.getElementById('weather-info');
const loadingIndicator = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const currentWeatherElem = document.getElementById('current-weather');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const forecastElem = document.getElementById('forecast');

// Show loading indicator
function showLoading() {
    loadingIndicator.style.display = 'block';
    weatherInfo.style.display = 'none';
}

// Hide loading indicator
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Clear weather information
function clearWeatherInfo() {
    currentWeatherElem.textContent = "";
    humidityElem.textContent = "";
    windElem.textContent = "";
    forecastElem.textContent = "";
}

// Fetch current weather
function getCurrentWeather(lat, lon) {
    return fetch(`https://wttr.in/${lat},${lon}?format=%C+%t`)
        .then(response => response.text())
        .then(data => {
            currentWeatherElem.innerHTML = `Current Weather: ${data}`;
        });
}

// Fetch humidity
function getHumidity(lat, lon) {
    return fetch(`https://wttr.in/${lat},${lon}?format=Humidity:+%h`)
        .then(response => response.text())
        .then(data => {
            humidityElem.innerHTML = data;
        });
}

// Fetch wind information
function getWind(lat, lon) {
    return fetch(`https://wttr.in/${lat},${lon}?format=Wind:+%w`)
        .then(response => response.text())
        .then(data => {
            windElem.innerHTML = data;
        });
}

// Fetch forecast
function getForecast(lat, lon) {
    return fetch(`https://wttr.in/${lat},${lon}?format=Next+Day+Forecast:+%f`)
        .then(response => response.text())
        .then(data => {
            forecastElem.innerHTML = data;
        });
}

// Fetch all weather data
function getWeather(lat, lon) {
    showLoading();
    clearWeatherInfo();

    // Call all the weather data fetching functions
    Promise.all([
        getCurrentWeather(lat, lon),
        getHumidity(lat, lon),
        getWind(lat, lon),
        getForecast(lat, lon)
    ]).then(() => {
        weatherInfo.style.display = 'block';
        hideLoading();
    }).catch(error => {
        console.error("Error fetching weather:", error);
        clearWeatherInfo();
        currentWeatherElem.textContent = "Unable to fetch weather information.";
        weatherInfo.style.display = 'block';
        hideLoading();
    });
}

// Search for a location
function searchLocation() {
    const location = searchInput.value.trim();
    if (location === "") {
        alert("Please enter a location");
        return;
    }

    showLoading();
    const geocoder = L.Control.Geocoder.nominatim();
    geocoder.geocode(location, function(results) {
        if (results.length > 0) {
            const latlng = results[0].center;
            map.setView(latlng, 10);

            L.marker(latlng).addTo(map);
            getWeather(latlng.lat, latlng.lng);
        } else {
            alert("Location not found");
            hideLoading();
        }
    });
}

// Get weather on map click
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    getWeather(lat, lng); // Fetch and display weather for clicked coordinates
});

// Event listeners for search
searchButton.addEventListener('click', searchLocation);

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchLocation();
    }
});
