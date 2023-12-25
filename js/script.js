$(document).ready(function () {
  fetch('http://ip-api.com/json/')
    .then(response => response.json())
    .then(data => {
      if (data.city) {
        $('#cityInput').val(data.city);
        fetchWeather(data.city);
        $('#cityInput').val('');
      }
    });

  $('#weatherForm').submit(function (e) {
    e.preventDefault();
    const city = $('#cityInput').val();
    fetchWeather(city);
  });

  function fadeIn(element) {
    return new Promise(resolve => {
      element.fadeIn(300, resolve);
    });
  }

  function fadeOut(element) {
    return new Promise(resolve => {
      element.fadeOut(300, resolve);
    });
  }

  async function fetchWeather(city) {
    const apiKey = 'b13eb391bd6ef6c806b21f987358ba16';
    const weatherInfo = $('#weatherInfo');
    const errorInfo = $('#errorInfo');
    const forecast = $('#forecast');

    await fadeOut(weatherInfo);
    await fadeOut(forecast);
    await fadeOut(errorInfo);

    try {
      const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Город не найден');
          }
          return response.json();
        });

      const cityName = $('#cityName');
      const weatherIcon = $('#weatherIcon');
      const temperature = $('#temperature');
      const description = $('#description');
      const humidity = $('#humidity');
      const wind = $('#wind');
      const cDate = $('#currentDate');

      const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      weatherIcon.attr('src', iconUrl);
      weatherIcon.attr('alt', data.weather[0].description);

      const currentDate = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

      cDate.html(`<span>${currentDate}</span>`);
      cityName.html(`<img class="weather-icon" id="weatherIcon" alt="" src="${iconUrl}"> ${data.name}`);
      temperature.text(`${data.main.temp}°C по Цельсию`);
      description.text(`${data.weather[0].description}`);
      humidity.text(`${data.main.humidity}% влажности`);
      wind.text(`Ветер движется со скоростью ${data.wind.speed} м/с`);

      await fadeIn(weatherInfo);
      await fadeIn(forecast);
      errorInfo.hide();
    } catch (error) {
      console.error('Ошибка получения данных о погоде:', error);
      await fadeIn(errorInfo);
    }

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Город не найден');
        }
        return response.json();
      })
      .then(data => {
        const forecastDetails = $('#forecastDetails');
        forecastDetails.html('');

        for (let i = 0; i < data.list.length; i += 8) {
          const forecast = data.list[i];
          const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

          const forecastCard = $(`
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-2 forecast-card">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${forecastDate}</h5>
              <img class="weather-icon" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="">
              <p class="card-text">Темп: ${forecast.main.temp}°C</p>
              <p class="card-text">Мин: ${forecast.main.temp_min}°C</p>
              <p class="card-text">Макс: ${forecast.main.temp_max}°C</p>
              <p class="card-text">Влажность: ${forecast.main.humidity}%</p>
              <p class="card-text">Давление: ${forecast.main.pressure} hPa</p>
            </div>
          </div>
        </div>
      `);

          forecastDetails.append(forecastCard);
        }
      })
      .catch(error => {
        console.error('Ошибка получения данных о прогнозе:', error);
      });
  }
});
