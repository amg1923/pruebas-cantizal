// script.js

// Función para mostrar resultados en el div "result"
function displayResult(message) {
  document.getElementById("result").innerHTML = message;
}

// Función para obtener la ubicación del usuario usando la API de Geolocalización
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        callback(lat, lon);
      },
      (error) => {
        displayResult("Error obteniendo la ubicación: " + error.message);
      }
    );
  } else {
    displayResult("La geolocalización no es soportada por este navegador.");
  }
}

// Función para obtener el tiempo actual (simulado)
function getCurrentWeather() {
  displayResult("Obteniendo el tiempo actual...");
  getUserLocation((lat, lon) => {
    // Aquí podrías realizar una llamada a una API real, por ejemplo a OpenWeatherMap:
    // let apiKey = 'TU_API_KEY';
    // let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    // fetch(url).then(response => response.json()).then(data => { ... });

    // Para efectos de demostración, simulamos la respuesta:
    setTimeout(() => {
      const simulatedResponse = `Ubicación: lat ${lat.toFixed(2)}, lon ${lon.toFixed(2)}<br>Clima: Soleado, 25°C`;
      displayResult(simulatedResponse);
    }, 1000);
  });
}

// Función para obtener el pronóstico de los próximos 15 días (simulado)
function get15DaysForecast() {
  displayResult("Obteniendo pronóstico para los próximos 15 días...");
  getUserLocation((lat, lon) => {
    // En un escenario real, se haría una llamada a una API que proporcione un pronóstico extendido.
    // Simulamos la respuesta:
    setTimeout(() => {
      let forecastHTML = `<h3>Pronóstico a 15 días</h3>`;
      for (let day = 1; day <= 15; day++) {
        forecastHTML += `<p>Día ${day}: Predicción simulada: Parcialmente nublado, 22°C</p>`;
      }
      displayResult(forecastHTML);
    }, 1000);
  });
}

// Función para obtener la predicción a 3 meses vista (simulado)
function get3MonthsForecast() {
  displayResult("Obteniendo predicción a 3 meses vista...");
  // En la vida real, esta predicción sería compleja y se basaría en modelos estadísticos.
  // Simulamos una respuesta:
  setTimeout(() => {
    let forecastHTML = `<h3>Predicción a 3 meses</h3>`;
    forecastHTML += `<p>Este es un pronóstico simulado basado en tendencias históricas.</p>`;
    forecastHTML += `<p>Se espera que el clima sea variable, con periodos de lluvia y sol, y temperaturas entre 15°C y 30°C.</p>`;
    displayResult(forecastHTML);
  }, 1000);
}
