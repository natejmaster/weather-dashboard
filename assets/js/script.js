$(function () {
let today = dayjs();
let locationSearch =  $('#location-search');
let searchButton = $('#location-search-button');
let searchHistory = $('#search-history');

//Take the value entered into the locationSearch input
    //Use this value with some third party API to match location name or zip code to long and lat
    function findCoords() {
        let reverseGeoCoderUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationSearch.val()}&limit=1&appid=03829b78f9fbd15989252f9ded900d22`;
        fetch(reverseGeoCoderUrl)
            .then(function (response) {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error('Error: ' + response.status);
                }
              })
              .then(function (data) {
                console.log(data);
              })
              .catch(function (error) {
                console.log(error);
              });
          }
    //Use lat and long in function to call weatherApi
    function getWeather(lat, long) {
        let weatherApi = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=03829b78f9fbd15989252f9ded900d22`;
        fetch(weatherApi)
        .then(function (response) {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Error: ' + response.status);
            }
          })
          then(function (data) {
            console.log(data);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    //Fetch response from weatherApi
    //Fetch data from response
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
searchButton.on('click', findCoords);
});
