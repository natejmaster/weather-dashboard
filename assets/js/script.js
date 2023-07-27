//Store entire JS code in a jQuery function so no JS runs until the HTML is fully loaded
$(function () {
    //Declaration of all necessary global variables that will be needed before any interactivity
    let today = dayjs();
    let searchHistory = $('#search-history');
    let fiveDayContainer = $('#five-day-forecast-container');
    let storedCities = JSON.parse(localStorage.getItem('storedCities')) || [];
    //The findCoords function takes the city typed in the input and runs it through openweathermap's reverse geocoder API call to get the longitude and latitude data based on the city name
    function findCoords() {
        let reverseGeoCoderUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationSearch.val()}&limit=1&appid=03829b78f9fbd15989252f9ded900d22`;
        return fetch(reverseGeoCoderUrl)
            .then(response => {
                if (response.ok) {
                    //If the fetch call is succesful, the response is the JSON data from openweathermap
                    return response.json();
                } else {
                    //If there's an error fetching the data, this error message will tell the user the status of the error to aid in troubleshooting
                    throw new Error('Error: ' + response.status);
                }
            })
            //Once data is fetched as a JSON response, an variable with values for lat and lon are created and pulled from the data
            .then(data => {
                const { lat, lon } = data[0];
                //We make two calls to the openweathermap API: one for current weather and one for the 5 day forecast, using the lat and lon data pulled from the reverse geocoder
                const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;
                const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;
                //Data is returned as a promise to be utilized later to populate the current weather and forecast cards
                return Promise.all([
                    fetch(currentWeatherApiUrl).then(response => response.json()),
                    fetch(forecastApiUrl).then(response => response.json())
                ]);
            })
            //If an error prevents this data from reaching the user, an error message will log in the console expressing the issue
            .catch(error => {
                console.log(error);
            });
    }
    //This function dictates how behavior the search history buttons will behave when clicked (repopulating the data for the current weather and 5 day forecast)
    function handleSearchHistoryClick(event) {
        //This variable grabs the name of the city from the button's text content
        const cityName = event.target.textContent;
        //These two lines of code recreate what would happen if the cityName was re-entered into the search input and the search button was clicked
        locationSearch.val(cityName);
        searchButton.click();
    }
    //This function takes any cities that have been searched for and renders them as an interactive button in the search history div
    function renderStoredCities() {
        searchHistory.empty();
        //First, we check to ensure that the button the application is trying to render doesn't already exist.
        for (const storedCity of storedCities) {
            //If the app finds a button with the same name, that button will not render
            const existingButton = searchHistory.find('.history-button').filter((_, el) => el.textContent === storedCity);
            if (existingButton.length === 0) {
                //If the button doesn't exist, a new search history button will render and append to the list
                const storedCityButton = $('<button>').text(storedCity).attr('class', 'history-button');
                searchHistory.append(storedCityButton);
            }
        }
    }
    //This function takes any name entered into the input and searched for and saves it to local storage under the name storedCities.
    function saveCities() {
        localStorage.setItem('storedCities', JSON.stringify(storedCities));
        //Once data is set to localStorage, the function triggers the previous function to render the city as a button in the search history
        renderStoredCities();
    }
    //The primary function of this application is the search event, so the input and search button must be declared
    const locationSearch = $('#location-search');
    const searchButton = $('#location-search-button');
    //An event listener dictates how the application will behave when the search button is clicked
    searchButton.on('click', () => {
        //The text typed into the input is stored in a variable with any spaces trimmed off either end
        const searchText = locationSearch.val().trim();
        //The function stops if the searchText input is empty
        if (searchText === "") {
            return;
        }
        //The name of the city is pushed into StoredCities and the saveCities function is triggered
        storedCities.push(searchText);
        saveCities();
        //All of the rendering and populating space for current weather and the 5 day forecast are cleared so data doesn't render on top of any pre-existing data.
        $('#current-city, #current-date, #current-weather-icon, #current-temp, #current-wind, #current-humidity').empty();
        fiveDayContainer.empty();
        //The current date is redeclared locally within the function using dayjs because it must be manipulated within the 5 day forecast
        const currentWeatherDate = dayjs();
        // First, we will use dayjs to get the current hour in 24-hour format. This is necessary to ensure that the forecast data will always show each day's data at noon
        const currentHour = today.hour();
        // Then, we will calculate the difference between the current hour and noon (12:00)
        const hoursUntilNoon = currentHour < 12 ? 12 - currentHour : currentHour - 12;
        // After that, we calculate the forecast index for noon data (8th index per day)
        const forecastIndexNoon = hoursUntilNoon / 3;
        // Finally, we will round down the forecast index to get the nearest 3-hour interval (index)
        const nearestForecastIndex = Math.floor(forecastIndexNoon);
        // Then, we adjust the forecast index to the exact noon data for today's forecast
        const todayForecastIndex = nearestForecastIndex;
        //The findCoords function is called after the button click
        findCoords()
            //Once the findCoords function is completed, the data fetched from both API calls is applied to the rendering code
            .then(([currentWeatherData, forecastData]) => {
                console.log("Fetched Forecast Data:", forecastData);
                //This references a page on the openweathermap site that matches the icon code from Current Weather data to a specific weather icon.
                const iconCode = currentWeatherData.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                //The data fetched and stored in currentWeatherData is populated in the Current Weather space
                $('#current-city').text(currentWeatherData.name);
                $('#current-date').text(today.format('MMM D, YYYY'));
                $('#current-weather-icon').attr('src', iconUrl);
                $('#current-temp').text(`Temp: ${currentWeatherData.main.temp} °F`);
                $('#current-wind').text(`Wind: ${currentWeatherData.wind.speed} MPH`);
                $('#current-humidity').text(`Humidity: ${currentWeatherData.main.humidity}%`);
                //The input from the location search is cleared to make it easier to search for another city
                locationSearch.val('');
                //A for loop renders each day of the five day forecast
                for (let i = 0; i < 5; i++) {
                    //We declare the forecast index using the index provided in the todayForecastIndex to ensure that each day of the forecast records data from noon on that particular date.
                    let forecastIndex = todayForecastIndex;
                    //The date is increased by one day with each iteration of the for loop
                    const forecastDate = currentWeatherDate.add(i + 1, 'day');
                    //This provides formatting for how the date will be displayed in each forecast card
                    const dayDate = forecastDate.format('MMM D, YYYY');
                    //This data fetches the correct piece of weather icon data from each day of the forecast and matches it to the icon library on openweathermap's website
                    const iconCode = forecastData.list[forecastIndex + (i * 8)].weather[0].icon;
                    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                    //We declare the temperature, wind, and humidity for each day of the forecast
                    const dayTemp = `Temp: ${forecastData.list[forecastIndex + (i * 8)].main.temp} °F`;
                    const dayWind = `Wind: ${forecastData.list[forecastIndex + (i * 8)].wind.speed} MPH`;
                    const dayHumidity = `Humidity: ${forecastData.list[forecastIndex + (i * 8)].main.humidity}%`;
                    //This creates a dayCard that will reference the corresponding day
                    const dayCard = $('<div>').attr('id', `day-${i}`).attr('class', 'day-card');
                    //The data that is pulled during each iteration of the for loop is appended to the parent element, dayCard
                    dayCard.append($('<h4>').text(dayDate));
                    dayCard.append($('<img>').attr('src', iconUrl).attr('alt', 'Weather Icon'));
                    dayCard.append($('<p>').text(dayTemp));
                    dayCard.append($('<p>').text(dayWind));
                    dayCard.append($('<p>').text(dayHumidity));
                    //Once all of the necessary data is appended to the dayCard, we append each dayCard to the five day forecast container
                    fiveDayContainer.append(dayCard);
                }
            })
            //If there is an error on any request of the data, it is logged in the console
            .catch(error => {
                console.log(error);
            });
    });
    //This is an event listener that handles the behavior when one of the search history buttons is clicked to trigger the function that recalls that city's data
    searchHistory.on('click', '.history-button', handleSearchHistoryClick);
    renderStoredCities();
    //We declare the search history link in JS so we can dictate how the application behaves when the link is clicked
    const clearSearchHistoryLink = $('#clear-search-history');
    //When the clear search history link is clicked, the storedCities array empties, and the save cities function is called to clear the search history buttons with the now-cleared data
    clearSearchHistoryLink.on('click', function () {
        // Clear the storedCities array and update the search history div
        storedCities = [];
        saveCities();
    });
});