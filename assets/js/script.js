$(function () {
let weatherApi = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=03829b78f9fbd15989252f9ded900d22`;
let today = dayjs();
let locationSearch =  $('#location-search');
let searchHistory = $('#search-history');

//Take the value entered into the locationSearch input
    //Use this value with some third party API to match location name or zip code to long and lat
    //Use long and lat in function to call weatherApi
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
});
