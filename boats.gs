const SPREADSHEET_ID = '1mZIcjeN7E4xC7dUICpLL3_AV8ZOCnNaZEmrkyghfToY'; 
const SHEET_NAME = 'boats';

/**
 * Obtener datos completos
 */
function getData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('No se encontro la hoja');
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

/**
 * 1. FILTRAR Y ENLISTAR TIPOS (tipos unicos)
 */
function obtenerTiposUnicos() {
  const data = getData();
  const tipos = new Set();

  data.forEach(item => tipos.add(item.type));

  Logger.log(" TIPOS DE BARCOS ");
  Array.from(tipos).forEach(tipo => {
    Logger.log("• " + tipo);
  });

  return Array.from(tipos);
}

/**
 * 2. SUMA TOTAL POR TIPO
 */
function sumaPorTipo() {
  const data = getData();
  const resultado = {};

  data.forEach(item => {
    const tipo = item.type;
    const precio = Number(item.price_per_hour);

    if (!resultado[tipo]) resultado[tipo] = 0;

    resultado[tipo] += precio;
    resultado[tipo] = Number(resultado[tipo].toFixed(2));
  });

  Logger.log("\n TOTAL POR TIPO ");
  for (let tipo in resultado) {
    Logger.log(`• ${tipo}: $${resultado[tipo]}`);
  }

  return resultado;
}

/**
 * 3. GENERO POR TIPO (APROXIMADO)
 */

function generoPorTipo() {
  const data = getData();
  const resultado = {};

  const letrasMujer = new Set(['a', 'e', 'i', 'y']);
  const letrasHombre = new Set(['o', 'n', 'r', 'l', 's', 'd', 'k']);

  // Totales generales
  let totalMujeres = 0;
  let totalHombres = 0;
  let totalDesconocido = 0;

  data.forEach(item => {
    const tipo = item.type;
    const nombre = item.name.toLowerCase().trim();

    if (!resultado[tipo]) {
      resultado[tipo] = { hombres: 0, mujeres: 0, desconocido: 0 };
    }

    const ultimaLetra = nombre.charAt(nombre.length - 1);

    if (letrasMujer.has(ultimaLetra)) {
      resultado[tipo].mujeres++;
      totalMujeres++;
    } else if (letrasHombre.has(ultimaLetra)) {
      resultado[tipo].hombres++;
      totalHombres++;
    } else {
      resultado[tipo].desconocido++;
      totalDesconocido++;
    }
  });

  Logger.log("\n===== GENERO POR TIPO =====");

  for (let tipo in resultado) {
    const g = resultado[tipo];
    Logger.log(`\n• ${tipo}`);
    Logger.log(`   Mujeres: ${g.mujeres}`);
    Logger.log(`   Hombres: ${g.hombres}`);
    Logger.log(`   Desconocido: ${g.desconocido}`);
  }

  // Totales generales
  Logger.log("\n TOTALES GENERALES ");
  Logger.log(`Total Mujeres: ${totalMujeres}`);
  Logger.log(`Total Hombres: ${totalHombres}`);
  Logger.log(`Total Desconocido: ${totalDesconocido}`);
  Logger.log('Todos los resultados anteriores son un aproximado no es un 100% correcto tanto por tipos y en general ')

  return {
    porTipo: resultado,
    totales: {
      mujeres: totalMujeres,
      hombres: totalHombres,
      desconocido: totalDesconocido
    }
  };
}


/**
 * 4. TOTAL PAGADO POR NOMBRE
 */
function normalizarPrecio(valor) {
  // Si ya es número
  if (typeof valor === 'number') {
    //  Detectar si es un número "mal ya que se lee como mucho" (ej: 176179 en vez de 176.179)
    if (valor > 1000 && Number.isInteger(valor)) {
      return valor / 1000;
    }
    return valor;
  }

  let str = valor.toString().trim();

  // Caso con coma decimal
  if (str.includes(',')) {
    return parseFloat(str.replace(',', '.'));
  }

  return parseFloat(str) || 0;
}

function totalPorNombre(nombreBuscado) {
  const data = getData();
  const resultado = {};

  data.forEach(item => {
    const nombre = item.name.trim();
    const precio = normalizarPrecio(item.price_per_hour);
    const owner = item.owner_id.toString().trim();

    // Clave unica: nombre + ID
    const key = `${nombre}|${owner}`;

    if (!resultado[key]) {
      resultado[key] = {
        nombre: nombre,
        owner: owner,
        total: 0
      };
    }

    resultado[key].total += precio;
    resultado[key].total = Number(resultado[key].total.toFixed(2));
  });

  // Filtrar por nombre exanco (ignorando mayusculas/minusculas)
  const filtrado = Object.values(resultado).filter(persona =>
    persona.nombre.toLowerCase() === nombreBuscado.toLowerCase()
  );

  Logger.log(`\n TOTAL PAGADO POR "${nombreBuscado}" `);

   filtrado.forEach(p => {
    Logger.log(`• ${p.nombre} (ID: ${p.owner}): $${p.total.toFixed(3)}`);
  });

  return filtrado;
}

/**
 * 5. FECHA CON MAS Y MENOS VENTAS
 */
function ventasPorFecha() {
  const data = getData();
  const resultado = {};

  data.forEach(item => {
    const fecha = item.date_made;
    const precio = Number(item.price_per_hour);

    if (!resultado[fecha]) resultado[fecha] = 0;

    resultado[fecha] += precio;
  });

  const entries = Object.entries(resultado);

  let max = entries[0];
  let min = entries[0];

  entries.forEach(entry => {
    if (entry[1] > max[1]) max = entry;
    if (entry[1] < min[1]) min = entry;
  });

  Logger.log("\n VENTAS POR FECHA ");
  Logger.log(` Mayor venta: ${max[0]} → $${max[1]}`);
  Logger.log(` Menor venta: ${min[0]} → $${min[1]}`);

  return { max, min };
}

/**
 * MAIN FUNCION PARA QUE FUNCIONE NUESTRO CODIGO
 */
function main() {
  Logger.log("=========== REPORTE GENERAL ===========\n");

  obtenerTiposUnicos();
  sumaPorTipo();
  generoPorTipo();
  totalPorNombre('Priscilla');
  ventasPorFecha();

  Logger.log("\n=========== FIN DEL REPORTE ===========");
}