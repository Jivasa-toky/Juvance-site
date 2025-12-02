import { protectPage } from '../dashboard.js';
document.addEventListener("DOMContentLoaded", () => {
    protectPage();
});

const searchValue = document.getElementById("search-value");
const searchBtn = document.getElementById("search-btn");
const themeSelect = document.getElementById('theme-select');
const unitSelect = document.getElementById('unit-select');

function getSelectedUnit() {
  return unitSelect.value === "celsius" ? "metric" : "imperial";
}

function addSelectedUnit() {
  return unitSelect.value === "celsius" ? "°C" : "°F";
}

const searchLocation = (e) => {
  if (searchValue.value === "") {
    alert("Please fill the field");
  } else {
    if (e.type === "click" || (e.type === "keydown" && e.key === "Enter")) {
      e.preventDefault();
      
      // Spinner is already shown on DOMContentLoaded in HTML.
      // If you want the spinner to appear on search, you would call showGlobalSpinner(true) here.
      fetchData(searchValue.value);
    }
  }
};

searchBtn.addEventListener("click", searchLocation);
searchValue.addEventListener("keydown", searchLocation);

// CORRECTION: Removed 'export' since this function is only called internally.
async function fetchData(city) {
  try {
    // Fetch backend API  from OpenWeatherMap
    const response = await fetch(`/api/openWeather?city=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.weather && data.weather[0]) {
      getWeatherData(data);
      // Optionally, you can add a new backend route for forecast data
       getWeatherSummaryData(data.coord.lon, data.coord.lat);
      setBackgroundImage(data.weather[0].description);
    } else {
      console.warn("Incomplete or invalid data:", data);
    }

    if (data.alerts) {
      data.alerts.forEach((alert) => {
        console.log(`Alert: ${alert.event}`);
        console.log(`Description: ${alert.description}`);
        console.log(`Start: ${new Date(alert.start * 1000)}`);
        console.log(`End: ${new Date(alert.end * 1000)}`);
      });
    }
    
    // Call the global function to HIDE the spinner on successful fetch
    if (typeof showGlobalSpinner === 'function') {
        showGlobalSpinner(false);
    }
    
  } catch (error) {
    console.error("Error fetching the weather data:", error);
    
    // Call the global function to HIDE the spinner on fetch error
    if (typeof showGlobalSpinner === 'function') {
        showGlobalSpinner(false);
    }
  }
}

const getWeatherData = (data) => {
  const location = document.getElementById("location");
  const condition = document.getElementById("condition");
  const iconSrc = document.getElementById("current-weather-icon"); // Updated ID to match HTML
  const temperature = document.getElementById("temp");
  const feelLIke = document.getElementById("feel-like");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const pressure = document.getElementById("pressure");
  const visibilitEl = document.getElementById("visibility");
  const sunriseEl = document.getElementById("sunrise");
  const sunsetEl = document.getElementById("sunset");
  const tempMax = document.getElementById("temp_max");
  const tempMin = document.getElementById("temp_min");

  const { name, weather, main, wind, visibility, sys } = data;

  const iconCode = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  location.textContent = `Location: ${name}`;
  iconSrc.src = iconUrl;
  condition.textContent = weather[0].description;
  temperature.textContent = `${main.temp} ${addSelectedUnit()}`;
  feelLIke.innerHTML = `<i class="fas fa-thermometer-half"></i> Feels Like: ${main.feels_like} ${addSelectedUnit()}`;
  humidity.innerHTML = `<i class="fa-solid fa-droplet"></i> Humidity: ${main.humidity}%`;
  windSpeed.innerHTML = `<i class="fa-solid fa-wind"></i> Wind Speed: ${wind.speed} mph`;
  pressure.innerHTML = `<i class="fas fa-tachometer-alt"></i> Pressure: ${main.pressure} hPa`;
  visibilitEl.innerHTML = `<i class="fas fa-eye"></i> Visibility: ${visibility / 1000} km`;
  tempMax.innerHTML = `<i class="fas fa-temperature-high"></i> Max Temp: ${main.temp_max} ${addSelectedUnit()}`;
  tempMin.innerHTML = `<i class="fas fa-temperature-low"></i> Min Temp:  ${main.temp_min} ${addSelectedUnit()}`;
  sunriseEl.innerHTML = `<i class="fas fa-sun"></i> Sunrise: ${milleSecondConvertToHour(sys.sunrise)}`;
  sunsetEl.innerHTML = `<i class="fas fa-moon"></i> Sunset: ${milleSecondConvertToHour(sys.sunset)}`;
};

const milleSecondConvertToHour = (timeStamp) => {
  const sunriseDate = new Date(timeStamp * 1000); // Convert to milliseconds
  const hours = sunriseDate.getHours();
  const minutes = sunriseDate.getMinutes();
  const formattedSunrise = `${hours}h:${minutes < 10 ? "0" : ""}${minutes}mn`;
  return formattedSunrise;
};

async function getWeatherSummaryData(lon, lat) {
const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
//const forecastData = await response.json();
  const data = await response.json();
  const dailySummary = {};

  data.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000).toISOString().split("T")[0];
    if (!dailySummary[date]) {
      dailySummary[date] = {
        temp: [],
        weather: [],
        rain: 0,
        icon: [],
      };
    }
    dailySummary[date].temp.push(entry.main.temp);
    dailySummary[date].weather.push(entry.weather[0].description);
    dailySummary[date].icon.push(entry.weather[0].icon);
    if (entry.rain && entry.rain["3h"]) {
      dailySummary[date].rain += entry.rain["3h"];
    }
  });
  const convertedSummary = {};
  Object.keys(dailySummary).forEach((date) => {
    const summary = dailySummary[date];
    const avgTemp =
      summary.temp.reduce((a, b) => a + b, 0) / summary.temp.length;
    const commonWeather = summary.weather
      .sort(
        (a, b) =>
          summary.weather.filter((v) => v === a).length -
          summary.weather.filter((v) => v === b).length
      )
      .pop();
    const rain = summary.rain;
    const commonIcon = summary.icon.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    const mostFrequentIcon = Object.keys(commonIcon).reduce((a, b) =>
      commonIcon[a] > commonIcon[b] ? a : b
    );

    convertedSummary[date] = {
      avgTemp,
      commonWeather,
      rain,
      mostFrequentIcon,
    };
  });
  displaySummaryData(Object.entries(convertedSummary));
}

// displaySummaryData
const displaySummaryData = (dt) => {
  const tomorrow = document.getElementById("tommorow");
  const nextTomorrow = document.getElementById("next-tommorow");
  const nextTowDays = document.getElementById("next-tow-days");
  const nextThreeDays = document.getElementById("next-three-days");
  const nextFourDays = document.getElementById("next-four-days");

  const tomorrowCond = document.getElementById("tommorow-cond");
  const tomorrowTemp = document.getElementById("tommorow-temp");
  const tomorrowRain = document.getElementById("tommorow-rain");
  const tomorrowIcon = document.getElementById("tommorow-icon");

  const nextTomorrowCond = document.getElementById("next-tommorow-cond");
  const nextTomorrowTemp = document.getElementById("next-tommorow-temp");
  const nextTomorrowRain = document.getElementById("next-tommorow-rain");
  const nextTomorrowIcon = document.getElementById("next-tommorow-icon");

  const nextTowDaysCond = document.getElementById("next-tow-days-cond");
  const nexTowDaysTemp = document.getElementById("next-tow-days-temp");
  const nextTowTaysRain = document.getElementById("next-tow-days-rain");
  const nextTowDaysIcon = document.getElementById("next-tow-days-icon");

  const nextThreeDaysCond = document.getElementById("next-three-days-cond");
  const nextThreeDaysTemp = document.getElementById("next-three-days-temp");
  const nextThreeDaysRain = document.getElementById("next-three-days-rain");
  const nextThreeDaysIcon = document.getElementById("next-three-days-icon");

  const nextFourDaysCond = document.getElementById("next-four-days-cond");
  const nextFourDaysTemp = document.getElementById("next-four-days-temp");
  const nextFourDaysRain = document.getElementById("next-four-days-rain");
  const nextFourDaysIcon = document.getElementById("next-four-days-icon");
  
  // Array of elements for easy iteration and checking
  const forecastElements = [
    { dayEl: tomorrow, condEl: tomorrowCond, tempEl: tomorrowTemp, rainEl: tomorrowRain, iconEl: tomorrowIcon, index: 1 },
    { dayEl: nextTomorrow, condEl: nextTomorrowCond, tempEl: nextTomorrowTemp, rainEl: nextTomorrowRain, iconEl: nextTomorrowIcon, index: 2 },
    { dayEl: nextTowDays, condEl: nextTowDaysCond, tempEl: nexTowDaysTemp, rainEl: nextTowTaysRain, iconEl: nextTowDaysIcon, index: 3 },
    { dayEl: nextThreeDays, condEl: nextThreeDaysCond, tempEl: nextThreeDaysTemp, rainEl: nextThreeDaysRain, iconEl: nextThreeDaysIcon, index: 4 },
    { dayEl: nextFourDays, condEl: nextFourDaysCond, tempEl: nextFourDaysTemp, rainEl: nextFourDaysRain, iconEl: nextFourDaysIcon, index: 5 }
  ];

  const converToDay = (date) => {
    const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return dayName[new Date(date).getDay()];
  };

  const converIconValue = (iconValue) => {
    let str = iconValue;
    if( str.includes("n")) {
      str = str.replace("n", "d")
      return str;
    }
     return str;
  };
  
  // Loop through all forecast days, starting with index 1 (Tomorrow)
  forecastElements.forEach((dayData) => {
      const index = dayData.index;
      // Check if the forecast data for this day exists before trying to access it
      if (dt.length > index) {
          const dayName = (index === 1) ? "Tomorrow" : `${converToDay(dt[index][0])}`;
          dayData.dayEl.textContent = dayName;

          const iconCode = converIconValue(dt[index][1].mostFrequentIcon);
          const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

          dayData.iconEl.src = iconUrl;
          dayData.condEl.textContent = `Condition: ${dt[index][1].commonWeather}`;
          dayData.tempEl.textContent = `Temperature: ${dt[index][1].avgTemp.toFixed(2)} ${addSelectedUnit()}`;
          dayData.rainEl.textContent = `Rain: ${dt[index][1].rain.toFixed(2)}mm`;
      } else {
           // Clear or hide elements if data is missing (e.g. if dt.length is only 5)
           if(dayData.dayEl.parentElement) {
                dayData.dayEl.parentElement.style.display = 'none';
           }
      }
  });
};

unitSelect.addEventListener("change", () => {
  // Re-fetch data using the current search value or default city.
  const currentCity = searchValue.value || "Ambovombe";
  fetchData(currentCity); 
});

async function setBackgroundImage(keyword) {
  // You can add Unsplash proxy backend endpoint if you want to keep that key secret too
  // For now, this will just set a background image based on condition
  try {
    const response = await fetch(`/api/unsplash?keyword=${encodeURIComponent(keyword)}`);

        if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
        }

          const data = await response.json();

 //   const res = await fetch(`https://source.unsplash.com/1600x900/?${keyword}`);
    if (data.urls && data.urls.full) {
      document.getElementById("main-content-wrapper").style.backgroundImage = `url(${data.urls.full})`;
    }
  } catch (error) {
    console.error("Failed to fetch background image:", error.message || error);
  }
}

window.addEventListener("load", () => {
  // Trigger the initial data fetch.
  fetchData("Ambovombe");
});