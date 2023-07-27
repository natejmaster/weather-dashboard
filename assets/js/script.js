//Stores all JS in a jQuery function that won't run until the HTML is loaded
$(function () {
    //List of necessary declarations to html objects that will be acted upon by JS.
    let today = dayjs();
    let locationSearch = $('#location-search');
    let searchButton = $('#location-search-button');
    let searchHistory = $('#search-history');
    let fiveDayContainer = $('#five-day-forecast-container')
    let storedCities = [];

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
    function renderStoredCities() {
        searchHistory.empty();
        for (let i = 0; i < storedCities.length; i++) {
            let storedCity = storedCities[i];
            let storedCityButton = $('<button>').text(storedCity);
            searchHistory.append(storedCityButton);
        }
    }
    function saveCities() {
        localStorage.setItem('storedCities', JSON.stringify(storedCities));
        renderStoredCities();
    };
    //Event listener for the search button
    searchButton.on('click', function () {
        let searchText = locationSearch.val().trim();
        if (searchText === "") {
            return;
        }
        storedCities.push(searchText);

        saveCities();
        //Clears any pre-existing data from the current weather and five day forecast spaces
        $('#current-city').empty();
        $('#current-date').empty();
        $('#current-weather-icon').attr('src', '');
        $('#current-temp').empty();
        $('#current-wind').empty();
        $('#current-humidity').empty();
        fiveDayContainer.empty();

        let currentWeatherDate = dayjs();
        //Calls the original function that produces the lat and long and converts them into the promised object data
        findCoords()
            //Next, a function takes the data and logs both the forecast data and the current weather data to the console.
            .then(function (data) {
                // Log the forecast data to the console
                data.currentWeatherPromise.then(function (currentWeatherData) {
                    console.log("Current Weather Data:", currentWeatherData);
                    let iconCode = currentWeatherData.weather[0].icon;
                    let iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                    $('#current-city').text(currentWeatherData.name);
                    $('#current-date').text(today.format('MMM D, YYYY'));
                    $('#current-weather-icon').attr('src', iconUrl);
                    $('#current-temp').text("Temp: " + currentWeatherData.main.temp + " °F");
                    $('#current-wind').text("Wind: " + currentWeatherData.wind.speed + " MPH");
                    $('#current-humidity').text("Humidity: " + currentWeatherData.main.humidity + "%");
                    locationSearch.val('');
                });

                // Log the current weather data to the console
                data.forecastPromise.then(function (forecastData) {
                    console.log("Forecast Data:", forecastData);
                    for (let i = 0; i < 5; i++) {
                      let forecastIndex = 4;
                      let forecastDate = currentWeatherDate.add(i + 1, 'day');
                      let dayDate = forecastDate.format('MMM D, YYYY');
                      let iconCode = forecastData.list[forecastIndex + (i * 8)].weather[0].icon;
                      let iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                      let dayTemp = "Temp: " + forecastData.list[forecastIndex + (i * 8)].main.temp + " °F";
                      let dayWind = "Wind: " + forecastData.list[forecastIndex + (i * 8)].wind.speed + " MPH";
                      let dayHumidity = "Humidity: " + forecastData.list[forecastIndex + (i * 8)].main.humidity + "%";
            
                      // Create and append forecast card using jQuery
                      let dayCard = $('<div>').attr('id', `day-${i}`);
                      dayCard.attr('class', `day-card`);
                      let dayDateElement = $('<h4>').text(dayDate);
                      let dayIcon = $('<img>').attr('src', iconUrl);
                      let dayTempElement = $('<p>').text(dayTemp);
                      let dayWindElement = $('<p>').text(dayWind);
                      let dayHumidityElement = $('<p>').text(dayHumidity);
            
                      dayCard.append(dayDateElement);
                      dayCard.append(dayIcon);
                      dayCard.append(dayTempElement);
                      dayCard.append(dayWindElement);
                      dayCard.append(dayHumidityElement);
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