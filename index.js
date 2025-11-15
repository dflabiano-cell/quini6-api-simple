const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Función para obtener todos los números de los últimos sorteos
async function obtenerTodosLosNumeros() {
  try {
    const url = 'https://www.quini-6-resultados.com.ar/';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const resultados = {
      tradicional: [],
      segunda: [],
      revancha: [],
      siempreSale: []
    };

    // Extraer el último sorteo
    const sorteoNumero = $('table').first().find('tr').eq(0).find('td').eq(1).text().trim();
    const fecha = $('table').first().find('tr').eq(0).find('td').eq(0).text().trim();

    // Tradicional
    const tradicional = [];
    $('table').first().find('tr').eq(2).find('td').each((i, elem) => {
      const num = $(elem).text().trim();
      if (num && !isNaN(num)) {
        tradicional.push(parseInt(num));
      }
    });

    // Segunda
    const segunda = [];
    $('table').first().find('tr').eq(4).find('td').each((i, elem) => {
      const num = $(elem).text().trim();
      if (num && !isNaN(num)) {
        segunda.push(parseInt(num));
      }
    });

    // Revancha
    const revancha = [];
    $('table').first().find('tr').eq(6).find('td').each((i, elem) => {
      const num = $(elem).text().trim();
      if (num && !isNaN(num)) {
        revancha.push(parseInt(num));
      }
    });

    // Siempre Sale
    const siempreSale = [];
    $('table').first().find('tr').eq(8).find('td').each((i, elem) => {
      const num = $(elem).text().trim();
      if (num && !isNaN(num)) {
        siempreSale.push(parseInt(num));
      }
    });

    if (tradicional.length > 0) {
      resultados.tradicional.push({
        sorteo: sorteoNumero,
        fecha: fecha,
        numeros: tradicional
      });
    }

    if (segunda.length > 0) {
      resultados.segunda.push({
        sorteo: sorteoNumero,
        fecha: fecha,
        numeros: segunda
      });
    }

    if (revancha.length > 0) {
      resultados.revancha.push({
        sorteo: sorteoNumero,
        fecha: fecha,
        numeros: revancha
      });
    }

    if (siempreSale.length > 0) {
      resultados.siempreSale.push({
        sorteo: sorteoNumero,
        fecha: fecha,
        numeros: siempreSale
      });
    }

    return resultados;
  } catch (error) {
    console.error('Error al obtener los números:', error.message);
    throw error;
  }
}

// Función alternativa usando TuJugada
async function obtenerDesdeTuJugada() {
  try {
    const url = 'https://www.tujugada.com.ar/quini6.asp';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const resultados = {
      tradicional: [],
      segunda: [],
      revancha: [],
      siempreSale: []
    };

    // Buscar los números en la página
    $('.numero').each((i, elem) => {
      const num = parseInt($(elem).text().trim());
      if (!isNaN(num)) {
        if (i < 6) resultados.tradicional.push(num);
        else if (i < 12) resultados.segunda.push(num);
        else if (i < 18) resultados.revancha.push(num);
        else if (i < 24) resultados.siempreSale.push(num);
      }
    });

    // Formatear resultados
    const sorteoInfo = {
      sorteo: 'Último',
      fecha: new Date().toLocaleDateString('es-AR'),
      numeros: []
    };

    return {
      tradicional: resultados.tradicional.length > 0 ? [{ ...sorteoInfo, numeros: resultados.tradicional }] : [],
      segunda: resultados.segunda.length > 0 ? [{ ...sorteoInfo, numeros: resultados.segunda }] : [],
      revancha: resultados.revancha.length > 0 ? [{ ...sorteoInfo, numeros: resultados.revancha }] : [],
      siempreSale: resultados.siempreSale.length > 0 ? [{ ...sorteoInfo, numeros: resultados.siempreSale }] : []
    };
  } catch (error) {
    console.error('Error al obtener desde TuJugada:', error.message);
    throw error;
  }
}

// Rutas de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Quini 6 - Funcionando ✅',
    endpoints: {
      todosLosnumeros: '/v1/q6r/todoslosnumeros',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/v1/q6r/todoslosnumeros', async (req, res) => {
  try {
    console.log('Obteniendo resultados del Quini 6...');
    
    // Intentar primero con quini-6-resultados.com.ar
    let resultados;
    try {
      resultados = await obtenerTodosLosNumeros();
    } catch (error) {
      console.log('Error con primera fuente, intentando con TuJugada...');
      resultados = await obtenerDesdeTuJugada();
    }

    res.json(resultados);
  } catch (error) {
    console.error('Error en /v1/q6r/todoslosnumeros:', error);
    res.status(500).json({
      error: 'Error al obtener los resultados',
      message: error.message
    });
  }
});

// Endpoint compatible con la app
app.get('/v1/q6r/sorteos', async (req, res) => {
  try {
    const resultados = await obtenerTodosLosNumeros();
    res.json({
      sorteos: [
        {
          numero: resultados.tradicional[0]?.sorteo || 'N/A',
          fecha: resultados.tradicional[0]?.fecha || 'N/A'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Quini 6 corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
