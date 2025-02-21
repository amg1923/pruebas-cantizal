// Función para mostrar mensajes o resultados en el div "result"
function displayResult(message) {
  document.getElementById('result').innerHTML = message;
}

// Función para obtener el valor del campo de entrada y validarlo
function getCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    displayResult("Por favor, introduce una localidad válida.");
    throw new Error("Localidad no proporcionada");
  }
  return city;
}

// Función de geocodificación usando el API Nominatim de OpenStreetMap
function geocodeCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) throw new Error("No se encontró la localidad.");
      return data[0]; // Se toma la opción más probable
    });
}

// 1. Obtener el tiempo actual usando Open‑Meteo (sin autenticación)
function getCurrentWeather() {
  const city = getCity();
  displayResult(`Buscando la localidad "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

      return fetch(url)
        .then(response => response.json())
        .then(data => {
          const weather = data.current_weather;
          const html = `
            <h3>Tiempo Actual en ${location.display_name}</h3>
            <p><strong>Temperatura:</strong> ${weather.temperature}°C</p>
            <p><strong>Viento:</strong> ${weather.windspeed} km/h</p>
            <p><strong>Hora:</strong> ${weather.time}</p>
          `;
          displayResult(html);
        });
    })
    .catch(error => {
      displayResult("Error: " + error.message);
    });
}

// 2. Obtener el pronóstico a 15 días usando Open‑Meteo
function get15DaysForecast() {
  const city = getCity();
  displayResult(`Buscando la localidad "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=15`;

      return fetch(url)
        .then(response => response.json())
        .then(data => {
          let forecastHTML = `<h3>Pronóstico a 15 días para ${location.display_name}</h3>`;
          const times = data.daily.time;
          const tempMax = data.daily.temperature_2m_max;
          const tempMin = data.daily.temperature_2m_min;

          for (let i = 0; i < times.length; i++) {
            forecastHTML += `
              <p><strong>${times[i]}:</strong> Máx: ${tempMax[i]}°C, Mín: ${tempMin[i]}°C</p>
            `;
          }
          displayResult(forecastHTML);
        });
    })
    .catch(error => {
      displayResult("Error: " + error.message);
    });
}

// 3. Mostrar el mapa de la localidad usando Google Maps
function showMap() {
  const city = getCity();
  displayResult(`Buscando la localidad "${city}"...`);

  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      
      // Usamos latitud y longitud en la URL de Google Maps
      const mapHTML = `
        <h3>Mapa de ${location.display_name}</h3>
        <iframe width="100%" height="450" frameborder="0" style="border:0"
          src="https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed" allowfullscreen>
        </iframe>
      `;
      displayResult(mapHTML);
    })
    .catch(error => {
      displayResult("Error: " + error.message);
    });
}
