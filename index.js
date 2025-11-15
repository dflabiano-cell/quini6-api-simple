const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Función para obtener desde Quini-6-Resultados.com.ar
async function obtenerDesdeQuini6Resultados() {
  try {
    const url = 'https://www.quini-6-resultados.com.ar/';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const resultados = {
      tradicional: [],
      segunda: [],
      revancha: [],
      siempreSale: []
    };

    // Buscar todas las tablas
    const tablas = $('table');
    console.log(`Encontradas ${tablas.length} tablas`);

    // Buscar números en diferentes formatos
    const numeros = [];
    $('.numero, .ball, .number, td.num, span.num').each((i, elem) => {
      const texto = $(elem).text().trim();
      const num = parseInt(texto);
      if (!isNaN(num) && num >= 0 && num <= 45) {
        numeros.push(num);
        console.log(`Número encontrado: ${num}`);
      }
    });

    // Si encontramos números, distribuirlos
    if (numeros.length >= 6) {
      const sorteoInfo = {
        sorteo: 'Último',
        fecha: new Date().toLocaleDateString('es-AR')
      };

      resultados.tradicional.push({ ...sorteoInfo, numeros: numeros.slice(0, 6) });
      if (numeros.length >= 12) {
        resultados.segunda.push({ ...sorteoInfo, numeros: numeros.slice(6, 12) });
      }
      if (numeros.length >= 18) {
        resultados.revancha.push({ ...sorteoInfo, numeros: numeros.slice(12, 18) });
      }
      if (numeros.length >= 24) {
        resultados.siempreSale.push({ ...sorteoInfo, numeros: numeros.slice(18, 24) });
      }
    }

    return resultados;
  } catch (error) {
    console.error('Error en obtenerDesdeQuini6Resultados:', error.message);
    throw error;
  }
}

// Función para obtener desde LotoFacil
async function obtenerDesdeLotoFacil() {
  try {
    const url = 'https://www.lotofacil.com.ar/quini-6';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const numeros = [];

    // Buscar números
    $('.ball, .numero, .number, .bola').each((i, elem) => {
      const num = parseInt($(elem).text().trim());
      if (!isNaN(num) && num >= 0 && num <= 45) {
        numeros.push(num);
      }
    });

    const resultados = {
      tradicional: [],
      segunda: [],
      revancha: [],
      siempreSale: []
    };

    if (numeros.length >= 6) {
      const sorteoInfo = {
        sorteo: 'Último',
        fecha: new Date().toLocaleDateString('es-AR')
      };

      resultados.tradicional.push({ ...sorteoInfo, numeros: numeros.slice(0, 6) });
      if (numeros.length >= 12) resultados.segunda.push({ ...sorteoInfo, numeros: numeros.slice(6, 12) });
      if (numeros.length >= 18) resultados.revancha.push({ ...sorteoInfo, numeros: numeros.slice(12, 18) });
      if (numeros.length >= 24) resultados.siempreSale.push({ ...sorteoInfo, numeros: numeros.slice(18, 24) });
    }

    return resultados;
  } catch (error) {
    console.error('Error en obtenerDesdeLotoFacil:', error.message);
    throw error;
  }
}

// Función para obtener desde TuJugada
async function obtenerDesdeTuJugada() {
  try {
    const url = 'https://www.tujugada.com.ar/quini6.asp';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const numeros = [];

    // Buscar números en diferentes selectores
    $('td, span, div').each((i, elem) => {
      const texto = $(elem).text().trim();
      const num = parseInt(texto);
      if (!isNaN(num) && num >= 0 && num <= 45 && texto.length <= 2) {
        numeros.push(num);
      }
    });

    const resultados = {
      tradicional: [],
      segunda: [],
      revancha: [],
      siempreSale: []
    };

    if (numeros.length >= 6) {
      const sorteoInfo = {
        sorteo: 'Último',
        fecha: new Date().toLocaleDateString('es-AR')
      };

      // Tomar solo los primeros 24 números únicos
      const numerosUnicos = [...new Set(numeros)].slice(0, 24);
      
      if (numerosUnicos.length >= 6) {
        resultados.tradicional.push({ ...sorteoInfo, numeros: numerosUnicos.slice(0, 6) });
      }
      if (numerosUnicos.length >= 12) {
        resultados.segunda.push({ ...sorteoInfo, numeros: numerosUnicos.slice(6, 12) });
      }
      if (numerosUnicos.length >= 18) {
        resultados.revancha.push({ ...sorteoInfo, numeros: numerosUnicos.slice(12, 18) });
      }
      if (numerosUnicos.length >= 24) {
        resultados.siempreSale.push({ ...sorteoInfo, numeros: numerosUnicos.slice(18, 24) });
      }
    }

    return resultados;
  } catch (error) {
    console.error('Error en obtenerDesdeTuJugada:', error.message);
    throw error;
  }
}

// Datos de ejemplo como fallback
function obtenerDatosEjemplo() {
  const sorteoInfo = {
    sorteo: 'Demo',
    fecha: new Date().toLocaleDateString('es-AR')
  };

  return {
    tradicional: [{ ...sorteoInfo, numeros: [5, 12, 23, 34, 41, 45] }],
    segunda: [{ ...sorteoInfo, numeros: [3, 8, 15, 22, 33, 40] }],
    revancha: [{ ...sorteoInfo, numeros: [1, 9, 18, 27, 36, 42] }],
    siempreSale: [{ ...sorteoInfo, numeros: [7, 14, 21, 28, 35, 44] }]
  };
}

// Rutas de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Quini 6 - Funcionando ✅',
    endpoints: {
      todosLosnumeros: '/v1/q6r/todoslosnumeros',
      health: '/health'
    },
    version: '2.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/v1/q6r/todoslosnumeros', async (req, res) => {
  try {
    console.log('🎲 Obteniendo resultados del Quini 6...');
    
    let resultados = null;
    const fuentes = [
      { nombre: 'Quini-6-Resultados', funcion: obtenerDesdeQuini6Resultados },
      { nombre: 'LotoFacil', funcion: obtenerDesdeLotoFacil },
      { nombre: 'TuJugada', funcion: obtenerDesdeTuJugada }
    ];

    // Intentar con cada fuente
    for (const fuente of fuentes) {
      try {
        console.log(`📡 Intentando con ${fuente.nombre}...`);
        resultados = await fuente.funcion();
        
        // Verificar si tiene datos válidos
        if (resultados.tradicional.length > 0 && resultados.tradicional[0].numeros.length === 6) {
          console.log(`✅ Datos obtenidos exitosamente desde ${fuente.nombre}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error con ${fuente.nombre}: ${error.message}`);
      }
    }

    // Si no se obtuvieron datos, usar ejemplo
    if (!resultados || resultados.tradicional.length === 0) {
      console.log('⚠️ No se pudieron obtener datos reales, usando datos de ejemplo');
      resultados = obtenerDatosEjemplo();
      resultados.nota = 'Datos de ejemplo - No se pudieron obtener resultados reales';
    }

    res.json(resultados);
  } catch (error) {
    console.error('❌ Error general:', error);
    res.json(obtenerDatosEjemplo());
  }
});

// Endpoint compatible
app.get('/v1/q6r/sorteos', async (req, res) => {
  try {
    const resultados = await obtenerDesdeQuini6Resultados();
    res.json({
      sorteos: [
        {
          numero: resultados.tradicional[0]?.sorteo || 'N/A',
          fecha: resultados.tradicional[0]?.fecha || 'N/A'
        }
      ]
    });
  } catch (error) {
    res.json({
      sorteos: [
        {
          numero: 'Demo',
          fecha: new Date().toLocaleDateString('es-AR')
        }
      ]
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Quini 6 corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
