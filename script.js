// Define tus claves de API (reemplaza 'TU_..._API_KEY' con tus claves reales)
const OWM_API_KEY = 'TU_OWM_API_KEY'; // Clave de OpenWeatherMap
const WB_API_KEY  = 'TU_WB_API_KEY';  // Clave de Weatherbit
const VC_API_KEY  = 'TU_VC_API_KEY';  // Clave de Visual Crossing

// Función para mostrar mensajes o resultados en el div "result"
function displayResult(message) {
  document.getElementById('result').innerHTML = message;
}

// Función para obtener el valor del campo de texto (la ciudad)
function getCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    displayResult("Por favor, introduce una localidad válida.");
    throw new Error("Localidad no proporcionada");
  }
  return city;
}

/*  
  FUNCIONES DE LLAMADA A LAS APIs
*/

// 1. Obtener el tiempo actual usando OpenWeatherMap API
function getCurrentWeather() {
  const city = getCity();
  displayResult("Obteniendo el tiempo actual para " + city + "...");
  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_API_KEY}&units=metric&lang=es`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const weatherHTML = `
        <h3>Tiempo Actual en ${data.name}</h3>
        <p><strong>Condiciones:</strong> ${data.weather[0].description}</p>
        <p><strong>Temperatura:</strong> ${data.main.temp} °C</p>
        <p><strong>Humedad:</strong> ${data.main.humidity}%</p>
        <p><strong>Viento:</strong> ${data.wind.speed} m/s</p>
      `;
      displayResult(weatherHTML);
    })
    .catch(error => {
      displayResult("Error al obtener el tiempo actual: " + error.message);
    });
}

// 2. Obtener el pronóstico de 15 días usando Weatherbit API
function get15DaysForecast() {
  const city = getCity();
  displayResult("Obteniendo pronóstico para 15 días en " + city + "...");
  
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(city)}&key=${WB_API_KEY}&units=M`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      let forecastHTML = `<h3>Pronóstico a 15 días para ${data.city_name}</h3>`;
      // Weatherbit retorna hasta 16 días; mostramos los primeros 15 días
      data.data.slice(0, 15).forEach(day => {
        forecastHTML += `
          <p>
            <strong>${day.valid_date}:</strong> ${day.weather.description}, Temp: ${day.temp} °C, Humedad: ${day.rh}%
          </p>
        `;
      });
      displayResult(forecastHTML);
    })
    .catch(error => {
      displayResult("Error al obtener el pronóstico de 15 días: " + error.message);
    });
}

// 3. Obtener el pronóstico a 3 meses usando Visual Crossing Weather API
function get3MonthsForecast() {
  const city = getCity();
  displayResult("Obteniendo pronóstico a 3 meses para " + city + "...");
  
  // Calcula la fecha actual y la fecha 90 días después (aproximadamente 3 meses)
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 90);
  const endDate = futureDate.toISOString().split('T')[0];
  
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}/${startDate}/${endDate}?unitGroup=metric&key=${VC_API_KEY}&include=days`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      let forecastHTML = `<h3>Pronóstico a 3 meses para ${data.resolvedAddress}</h3>`;
      forecastHTML += `<p>A continuación se muestran días representativos:</p>`;
      // Para no sobrecargar la vista, seleccionamos 5 días distribuidos a lo largo de los 90 días
      const days = data.days;
      const interval = Math.floor(days.length / 5);
      for (let i = 0; i < days.length; i += interval) {
        const day = days[i];
        forecastHTML += `
          <p>
            <strong>${day.datetime}:</strong> ${day.conditions}, Temp Máx: ${day.tempmax} °C, Temp Mín: ${day.tempmin} °C
          </p>
        `;
      }
      displayResult(forecastHTML);
    })
    .catch(error => {
      displayResult("Error al obtener el pronóstico a 3 meses: " + error.message);
    });
}
