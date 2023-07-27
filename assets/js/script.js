$(function () {
    let today = dayjs();
    let searchHistory = $('#search-history');
    let fiveDayContainer = $('#five-day-forecast-container');
    let storedCities = JSON.parse(localStorage.getItem('storedCities')) || [];

    function findCoords() {
        let reverseGeoCoderUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationSearch.val()}&limit=1&appid=03829b78f9fbd15989252f9ded900d22`;
        return fetch(reverseGeoCoderUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error: ' + response.status);
                }
            })
            .then(data => {
                const { lat, lon } = data[0];
                const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;
                const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22&units=imperial`;

                return Promise.all([
                    fetch(currentWeatherApiUrl).then(response => response.json()),
                    fetch(forecastApiUrl).then(response => response.json())
                ]);
            })
            .catch(error => {
                console.log(error);
            });
    }

    function handleSearchHistoryClick(event) {
        const cityName = event.target.textContent;
        locationSearch.val(cityName);
        searchButton.click();
    }

    function renderStoredCities() {
        searchHistory.empty();
        for (const storedCity of storedCities) {
            const existingButton = searchHistory.find('.history-button').filter((_, el) => el.textContent === storedCity);
            if (existingButton.length === 0) {
                const storedCityButton = $('<button>').text(storedCity).attr('class', 'history-button');
                searchHistory.append(storedCityButton);
            }
        }
    }

    function saveCities() {
        localStorage.setItem('storedCities', JSON.stringify(storedCities));
        renderStoredCities();
    }

    const locationSearch = $('#location-search');
    const searchButton = $('#location-search-button');
    searchButton.on('click', () => {
        const searchText = locationSearch.val().trim();
        if (searchText === "") {
            return;
        }
        storedCities.push(searchText);
        saveCities();

        $('#current-city, #current-date, #current-weather-icon, #current-temp, #current-wind, #current-humidity').empty();
        fiveDayContainer.empty();

        const currentWeatherDate = dayjs();
        findCoords()
            .then(([currentWeatherData, forecastData]) => {
                const iconCode = currentWeatherData.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                $('#current-city').text(currentWeatherData.name);
                $('#current-date').text(today.format('MMM D, YYYY'));
                $('#current-weather-icon').attr('src', iconUrl);
                $('#current-temp').text(`Temp: ${currentWeatherData.main.temp} °F`);
                $('#current-wind').text(`Wind: ${currentWeatherData.wind.speed} MPH`);
                $('#current-humidity').text(`Humidity: ${currentWeatherData.main.humidity}%`);
                locationSearch.val('');

                for (let i = 0; i < 5; i++) {
                    const forecastIndex = 4;
                    const forecastDate = currentWeatherDate.add(i + 1, 'day');
                    const dayDate = forecastDate.format('MMM D, YYYY');
                    const iconCode = forecastData.list[forecastIndex + (i * 8)].weather[0].icon;
                    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                    const dayTemp = `Temp: ${forecastData.list[forecastIndex + (i * 8)].main.temp} °F`;
                    const dayWind = `Wind: ${forecastData.list[forecastIndex + (i * 8)].wind.speed} MPH`;
                    const dayHumidity = `Humidity: ${forecastData.list[forecastIndex + (i * 8)].main.humidity}%`;

                    const dayCard = $('<div>').attr('id', `day-${i}`).attr('class', 'day-card');
                    dayCard.append($('<h4>').text(dayDate));
                    dayCard.append($('<img>').attr('src', iconUrl));
                    dayCard.append($('<p>').text(dayTemp));
                    dayCard.append($('<p>').text(dayWind));
                    dayCard.append($('<p>').text(dayHumidity));
                    fiveDayContainer.append(dayCard);
                }
            })
            .catch(error => {
                console.log(error);
            });
    });

    searchHistory.on('click', '.history-button', handleSearchHistoryClick);
    renderStoredCities();
    
    const clearSearchHistoryLink = $('#clear-search-history');
    clearSearchHistoryLink.on('click', function () {
        // Clear the storedCities array and update the search history div
        storedCities = [];
        saveCities();
    });
});