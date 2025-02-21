// Claves de API: reemplaza con tus claves reales
const OWM_API_KEY = 'TU_OWM_API_KEY'; // OpenWeatherMap
const WB_API_KEY  = 'TU_WB_API_KEY';  // Weatherbit
const VC_API_KEY  = 'TU_VC_API_KEY';  // Visual Crossing

// Función para mostrar mensajes o resultados en el div "result"
function displayResult(message) {
  document.getElementById('result').innerHTML = message;
}

// Función para obtener el texto del campo de entrada y validar que no esté vacío
function getCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    displayResult("Por favor, introduce una localidad válida.");
    throw new Error("Localidad no proporcionada");
  }
  return city;
}

// Función de geocodificación usando Nominatim de OpenStreetMap
function geocodeCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al geolocalizar la ciudad: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.length === 0) {
        throw new Error("No se encontró la localidad: " + city);
      }
      // Tomamos la primera opción (la más probable)
      return data[0]; // data[0] incluye lat, lon y display_name
    });
}

/*  
  FUNCIONES DE LLAMADA A LAS APIs DE CLIMA
*/

// 1. Tiempo Actual con OpenWeatherMap
function getCurrentWeather() {
  const city = getCity();
  displayResult(`Geolocalizando "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const displayName = location.display_name;
      displayResult(`Obteniendo el tiempo actual para <strong>${displayName}</strong>...`);
      
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=es`;
      return fetch(url);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud de OpenWeatherMap: " + response.statusText);
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
      displayResult("Error: " + error.message);
    });
}

// 2. Pronóstico a 15 Días con Weatherbit
function get15DaysForecast() {
  const city = getCity();
  displayResult(`Geolocalizando "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const displayName = location.display_name;
      displayResult(`Obteniendo pronóstico para 15 días en <strong>${displayName}</strong>...`);
      
      const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WB_API_KEY}&units=M`;
      return fetch(url);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud de Weatherbit: " + response.statusText);
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
      displayResult("Error: " + error.message);
    });
}

// 3. Pronóstico a 3 Meses con Visual Crossing Weather
function get3MonthsForecast() {
  const city = getCity();
  displayResult(`Geolocalizando "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const displayName = location.display_name;
      
      // Calcula la fecha actual y la fecha 90 días después
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const endDate = futureDate.toISOString().split('T')[0];
      
      displayResult(`Obteniendo pronóstico a 3 meses para <strong>${displayName}</strong>...`);
      
      // Usamos lat,lon en la URL (separados por coma)
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${startDate}/${endDate}?unitGroup=metric&key=${VC_API_KEY}&include=days`;
      return fetch(url);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud de Visual Crossing: " + response.statusText);
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
      displayResult("Error: " + error.message);
    });
}
