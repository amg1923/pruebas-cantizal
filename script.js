// Función para mostrar mensajes o resultados en el div "result"
function displayResult(message) {
  document.getElementById('result').innerHTML = message;
}

// Función para obtener el valor del campo de entrada y validar que no esté vacío
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
        throw new Error("Error en la geocodificación: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.length === 0) {
        throw new Error("No se encontró la localidad: " + city);
      }
      // Devolvemos la primera opción (la más probable)
      return data[0];
    });
}

// Mapeo de códigos meteorológicos de Open‑Meteo a descripciones
const weatherCodeDescriptions = {
  0: "Cielo despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Escarcha en niebla",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  56: "Llovizna congelada ligera",
  57: "Llovizna congelada densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia congelada ligera",
  67: "Lluvia congelada fuerte",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada fuerte",
  77: "Aguanieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo fuerte"
};

// 1. Obtener el tiempo actual usando Open‑Meteo
function getCurrentWeather() {
  const city = getCity();
  displayResult(`Geolocalizando "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const displayName = location.display_name;
      displayResult(`Obteniendo el tiempo actual para <strong>${displayName}</strong>...`);
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
      
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Error en la solicitud de Open‑Meteo: " + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          const current = data.current_weather;
          const description = weatherCodeDescriptions[current.weathercode] || "Sin descripción";
          const html = `
            <h3>Tiempo Actual en ${displayName}</h3>
            <p><strong>Temperatura:</strong> ${current.temperature} °C</p>
            <p><strong>Viento:</strong> ${current.windspeed} km/h</p>
            <p><strong>Condiciones:</strong> ${description}</p>
            <p><strong>Hora:</strong> ${current.time}</p>
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
  displayResult(`Geolocalizando "${city}"...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = location.lat;
      const lon = location.lon;
      const displayName = location.display_name;
      displayResult(`Obteniendo pronóstico para 15 días en <strong>${displayName}</strong>...`);
      
      // Solicitamos datos diarios: pronóstico de 16 días (mostraremos los primeros 15)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`;
      
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Error en la solicitud de Open‑Meteo: " + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          let forecastHTML = `<h3>Pronóstico a 15 días para ${displayName}</h3>`;
          const times = data.daily.time;
          const weathercodes = data.daily.weathercode;
          const tempMax = data.daily.temperature_2m_max;
          const tempMin = data.daily.temperature_2m_min;
          
          const daysToShow = Math.min(15, times.length);
          for (let i = 0; i < daysToShow; i++) {
            const date = times[i];
            const desc = weatherCodeDescriptions[weathercodes[i]] || "Sin descripción";
            forecastHTML += `
              <p>
                <strong>${date}:</strong> ${desc}, Temp Máx: ${tempMax[i]} °C, Temp Mín: ${tempMin[i]} °C
              </p>
            `;
          }
          displayResult(forecastHTML);
        });
    })
    .catch(error => {
      displayResult("Error: " + error.message);
    });
}

// 3. Mostrar el mapa de la localidad usando OpenStreetMap
function showMap() {
  const city = getCity();
  displayResult(`Geolocalizando "${city}" para mostrar el mapa...`);
  
  geocodeCity(city)
    .then(location => {
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      const displayName = location.display_name;
      
      const mapHTML = `
        <h3>Mapa de ${displayName}</h3>
        <iframe width="100%" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05}%2C${lat-0.05}%2C${lon+0.05}%2C${lat+0.05}&amp;layer=mapnik&marker=${lat}%2C${lon}">
        </iframe>
        <br/>
        <small>
          <a href="https://www.openstreetmap.org/?mlat=${lat}&amp;mlon=${lon}#map=12/${lat}/${lon}" target="_blank">
            Ver mapa más grande
          </a>
        </small>
      `;
      displayResult(mapHTML);
    })
    .catch(error => {
      displayResult("Error: " + error.message);
    });
}
