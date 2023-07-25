//Stores all JS in a jQuery function that won't run until the HTML is loaded
$(function () {
    //List of necessary declarations to html objects that will be acted upon by JS.
    let today = dayjs();
    let locationSearch = $('#location-search');
    let searchButton = $('#location-search-button');
    let searchHistory = $('#search-history');
    let fiveDayContainer = $('#five-day-forecast-container')

    //The function findCoords runs the location name through OpenWeatherMap's reverse geocoder API
    function findCoords() {
        //The template literal adjusts the url to contain the value typed into locationSearch at the time of the buttonclick
        let reverseGeoCoderUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationSearch.val()}&limit=1&appid=03829b78f9fbd15989252f9ded900d22`;
        //Returning this fetch request ensures that we get our requested data returned to the application (in this case, the values of latitude and longitude)
        return fetch(reverseGeoCoderUrl)
            //Standard .then syntax for both response and data
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    //Application throws an error alert if the fetch request doesn't work correctly
                    throw new Error('Error: ' + response.status);
                }
            })
            //Then, a function runs the returned object data through a function that isolates the lat and lon data from the object pulled from the API
            .then(function (data) {
                let { lat, lon } = data[0];
                //Another template literal API url is called using the lat and lon values extracted earlier
                let forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;
                let currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;
                //Finally, declare variables that will fetch requests from both of these APIs and return them as an object containing both promises.
                let currentWeatherPromise = fetch(currentWeatherApiUrl).then(response => response.json());
                let forecastPromise = fetch(forecastApiUrl).then(response => response.json());
                return { currentWeatherPromise, forecastPromise };
            })
            //If the fetch is unsuccesful, the console logs an error message.
            .catch(function (error) {
                console.log(error);
            });
    }

    //Use data to populate html containers
    //Populate current-header
    //Current location name
    //Current date
    //Current weather icon
    //Populate current-conditions
    //Current temp
    //Current wind
    //Current humidity
    //Populate five-day-forecast
    //Create elements for five day forecast cards
    //Populate Data
    //Append forecast cards to five-day-forecast container
    //Event listener for the search button
    searchButton.on('click', function () {
        //Calls the original function that produces the lat and long and converts them into the promised object data
        findCoords()
            //Next, a function takes the data and logs both the forecast data and the current weather data to the console.
            .then(function (data) {
                // Log the forecast data to the console
                data.currentWeatherPromise.then(function (currentWeatherData) {
                    console.log("Current Weather Data:", currentWeatherData);
                    $('#current-city').text(currentWeatherData.name);
                    $('#current-date').text(today.format('MMM D, YYYY'));
                    //STILL WORKING ON IT $('#current-weather-icon').text(currentWeatherData.weather)
                    $('#current-temp').text("Temp: " + currentWeatherData.main.temp + " °F")
                    $('#current-wind').text("Wind: " + currentWeatherData.wind.speed + " MPH");
                    $('#current-humidity').text("Humidity: " + currentWeatherData.main.humidity + "%");
                });

                // Log the current weather data to the console
                data.forecastPromise.then(function (forecastData) {
                    console.log("Forecast Data:", forecastData);
                    for (let i = 0; i < 5; i++) {
                        let forecastIndex = 4;
                        let dayCard = document.createElement('div');
                        dayCard.id = `day-${i}`;
                        let dayDate = document.createElement('h4');
                        dayDate.textContent = today.add(i + 1, 'day').format('MMM D, YYYY');
                        let dayTemp = document.createElement('p');
                        dayTemp.textContent = "Temp: " + forecastData.list[forecastIndex + (i * 8)].main.temp + " °F";
                        let dayWind = document.createElement('p');
                        dayWind.textContent = "Wind: " + forecastData.list[forecastIndex + (i * 8)].wind.speed + " MPH";
                        let dayHumidity = document.createElement('p');
                        dayHumidity.textContent = "Humidity: " + forecastData.list[forecastIndex + (i * 8)].main.humidity + "%";
                        dayCard.append(dayDate);
                        dayCard.append(dayTemp);
                        dayCard.append(dayWind);
                        dayCard.append(dayHumidity);
                        fiveDayContainer.append(dayCard);
                    }
                });
            })
            //Throws an error if the data can't be called
            .catch(function (error) {
                console.log(error);
            });
    });
});