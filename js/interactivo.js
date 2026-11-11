document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------------
  // SIMULADOR 1: DIAGRAMAS DE BODE (MAGNITUD Y FASE)
  // -------------------------------------------------------------
  const ctxMag = document.getElementById('bodeMagChart').getContext('2d');
  const ctxPhase = document.getElementById('bodePhaseChart').getContext('2d');
  const fcSlider = document.getElementById('fcSlider');
  const fcVal = document.getElementById('fcVal');
  const tipoFiltro = document.getElementById('tipoFiltro');

  // Vector de frecuencias de 10 a 3000 Hz
  const freqs = [];
  for (let f = 10; f <= 3000; f += 25) {
    freqs.push(f);
  }

  function calcularRespuestaBode(fc, tipo) {
    const magDB = [];
    const faseDeg = [];

    freqs.forEach(f => {
      let H_mag, H_fase;
      if (tipo === 'pasaBajos') {
        H_mag = 1 / Math.sqrt(1 + Math.pow(f / fc, 2));
        H_fase = -Math.atan(f / fc) * (180 / Math.PI);
      } else { // pasaAltos
        H_mag = (f / fc) / Math.sqrt(1 + Math.pow(f / fc, 2));
        H_fase = (Math.PI / 2 - Math.atan(f / fc)) * (180 / Math.PI);
      }
      magDB.push(20 * Math.log10(H_mag));
      faseDeg.push(H_fase);
    });

    return { magDB, faseDeg };
  }

  let fcInicial = parseFloat(fcSlider.value);
  let datosIniciales = calcularRespuestaBode(fcInicial, tipoFiltro.value);

  // Gráfica de Magnitud (dB)
  let bodeMagChart = new Chart(ctxMag, {
    type: 'line',
    data: {
      labels: freqs,
      datasets: [{
        label: 'Magnitud |H(f)| (dB)',
        data: datosIniciales.magDB,
        borderColor: '#007acc',
        backgroundColor: 'rgba(0, 122, 204, 0.1)',
        fill: true,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Frecuencia f (Hz)', color: '#333' } },
        y: { title: { display: true, text: 'Ganancia (dB)', color: '#333' }, min: -30, max: 2 }
      }
    }
  });

  // Gráfica de Fase (Grados)
  let bodePhaseChart = new Chart(ctxPhase, {
    type: 'line',
    data: {
      labels: freqs,
      datasets: [{
        label: 'Fase ∠H(f) (°)',
        data: datosIniciales.faseDeg,
        borderColor: '#e67e22',
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        fill: true,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Frecuencia f (Hz)', color: '#333' } },
        y: { title: { display: true, text: 'Fase (Grados)', color: '#333' }, min: -100, max: 100 }
      }
    }
  });

  function actualizarBode() {
    const fc = parseFloat(fcSlider.value);
    const tipo = tipoFiltro.value;
    fcVal.textContent = fc;

    const datos = calcularRespuestaBode(fc, tipo);
    bodeMagChart.data.datasets[0].data = datos.magDB;
    bodePhaseChart.data.datasets[0].data = datos.faseDeg;

    bodeMagChart.update();
    bodePhaseChart.update();
  }

  fcSlider.addEventListener('input', actualizarBode);
  tipoFiltro.addEventListener('change', actualizarBode);

  // -------------------------------------------------------------
  // SIMULADOR 2: ENTRADA VS SALIDA EN EL TIEMPO
  // -------------------------------------------------------------
  const ctxTime = document.getElementById('timeSignalChart').getContext('2d');
  const finSlider = document.getElementById('finSlider');
  const finVal = document.getElementById('finVal');

  const fcFijo = 500; // Frecuencia de corte fija para la demo temporal (Pasa-Bajos)
  const numPuntos = 200;
  const tiempoTotal = 0.01; // 10 milisegundos

  const timeVector = [];
  const dt = tiempoTotal / numPuntos;
  for (let i = 0; i < numPuntos; i++) {
    timeVector.push((i * dt * 1000).toFixed(2)); // Tiempo en ms
  }

  function calcularSenalesTemporales(fin) {
    const mag = 1 / Math.sqrt(1 + Math.pow(fin / fcFijo, 2));
    const faseRad = -Math.atan(fin / fcFijo);

    const x_t = [];
    const y_t = [];

    for (let i = 0; i < numPuntos; i++) {
      let t = i * dt;
      let entrada = Math.cos(2 * Math.PI * fin * t);
      let salida = mag * Math.cos(2 * Math.PI * fin * t + faseRad);

      x_t.push(entrada);
      y_t.push(salida);
    }

    return { x_t, y_t };
  }

  let finInicial = parseFloat(finSlider.value);
  let datosSenalInicial = calcularSenalesTemporales(finInicial);

  let timeSignalChart = new Chart(ctxTime, {
    type: 'line',
    data: {
      labels: timeVector,
      datasets: [
        {
          label: 'Entrada x(t) = cos(2π f_in t)',
          data: datosSenalInicial.x_t,
          borderColor: '#2ecc71',
          borderWidth: 2,
          pointRadius: 0,
          borderDash: [4, 4]
        },
        {
          label: 'Salida y(t) con Atenuación y Desfasaje',
          data: datosSenalInicial.y_t,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          fill: true,
          borderWidth: 3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Tiempo (ms)', color: '#333' } },
        y: { title: { display: true, text: 'Amplitud', color: '#333' }, min: -1.2, max: 1.2 }
      }
    }
  });

  finSlider.addEventListener('input', function () {
    const fin = parseFloat(this.value);
    finVal.textContent = fin;

    const datos = calcularSenalesTemporales(fin);
    timeSignalChart.data.datasets[0].data = datos.x_t;
    timeSignalChart.data.datasets[1].data = datos.y_t;
    timeSignalChart.update();
  });
});