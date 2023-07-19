//Stores all JS in a jQuery function that won't run until the HTML is loaded
$(function () {
    //List of necessary declarations to html objects that will be acted upon by JS.
    let today = dayjs();
    let locationSearch = $('#location-search');
    let searchButton = $('#location-search-button');
    let searchHistory = $('#search-history');

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
                const { lat, lon } = data[0];
                //Another template literal API url is called using the lat and lon values extracted earlier
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=03829b78f9fbd15989252f9ded900d22`;
                return weatherApiUrl;
            })
            //If the fetch is unsuccesful, the console logs an error message.
            .catch(function (error) {
                console.log(error);
            });
    }
    //Use lat and long in function to call weatherApi
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
    searchButton.on('click', function () {
        //The findCoords function constructed above is called after the button is clicked
        findCoords()
        .then(function (weatherApiUrl) {
            // User fetches the weatherApiUrl variable established earlier to make the API call for weather data
            fetch(weatherApiUrl)
              .then(function (response) {
                //If the response is successful, the JSON data is returned, if not, it throws an error
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error('Error: ' + response.status);
                }
              })
              //Finally, the data is logged in the console.
              .then(function (data) {
                // Process the weather data
                console.log(data);
              })
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    });