#  Analisis de Datos de Barcos con Google Apps Script

##  Descripcion

Este proyecto implementa un conjunto de funciones en **Google Apps Script** para analizar datos almacenados en una hoja de calculo de Google Sheets.

El objetivo es procesar informacion de barcos y generar reportes claros a partir de los datos, aplicando tecnicas de:

* Lectura de datos
* Agrupacion
* Filtrado
* Limpieza de datos
* Manejo de errores reales en datasets

---

##  Estructura de los datos

Los datos se obtienen desde una hoja llamada:

```text
boats
```

Cada registro contiene los siguientes campos:

| Campo          | Descripcion         |
| -------------- | ------------------- |
| id             | Identificador unico |
| name           | Nombre del cliente  |
| type           | Tipo de barco       |
| owner_id       | ID del cliente      |
| date_made      | Fecha del registro  |
| price_per_hour | Precio por hora     |

---

##  Funcionalidades

### 1. Obtener tipos unicos

Extrae todos los tipos de barcos sin repetir usando una estructura `Set`.

---

### 2. Suma total por tipo

Agrupa los registros por tipo de barco y calcula el total de ingresos.

---

### 3. Genero por tipo (aproximado)

Clasifica los nombres en:

* Mujeres
* Hombres
* Desconocido

La clasificacien se basa en la ultima letra del nombre segun una probabilidad.

>  Nota super importante: Este metodo es aproximado y no garantiza la precision total tambien por eso mismo estan los deconocidos ya que no pude clasificar a todos.

Tambien calcula:

* Totales generales de hombres, mujeres y desconocidos porque al principio de la actividad no habia entendido y por eso los sume en general

---

### 4. Total pagado por nombre

Calcula cuanto ha pagado cada persona.

Se utiliza una clave unica para evitar errores:

```text
nombre + owner_id
```

Esto permite diferenciar personas con el mismo nombre.

Ejemplo:

```text
Priscilla (ID: 47) 
Priscilla (ID: 47) → cumo son dos debe de acumularse correctamente
Priscilla (ID: 2) → se considera otra persona
```

---

### 5. Ventas por fecha

Determina:

* La fecha con mayor ingreso
* La fecha con menor ingreso

---

## Problema encontrado (en la forma de traer los datos)

Durante el desarrollo se detecto un gran problema en los datos:

Los valores de precios (`price_per_hour`) no tenian un formato consistente ya que variaban muchas veces el como se leian. 

Por Ejemplo:

```text
176.179   → se interpretaba como 176179
278.23    → se interpretaba correctamente
```

lo cual nos provocaba:        

* Sumas incorrectas
* Resultados inflados osea que muy grandes
* Datos inconsistentes

---

## Solucion implementada

Se creo una funcion para poder normalizar los precios:

```javascript
function normalizarPrecio(valor) {
  if (typeof valor === 'number') {
    if (valor > 1000 && Number.isInteger(valor)) {
      return valor / 1000;
    }
    return valor;
  }

  let str = valor.toString().trim();

  if (str.includes(',')) {
    return parseFloat(str.replace(',', '.'));
  }

  return parseFloat(str) || 0;
}
```

Esta funcion:

* Corrige los numeros mal interpretados
* Detecta valores "inflados"
* Mantiene los decimales correctamente

---

##  Ejecucion

El sistema se ejecuta mediante la funcion principal:

```javascript
function main()
```

Esta funcion ejecuta todos los analisis y muestra los resultados en el Logger.

---

## 🖥️ Ejemplo de salida

```text
TIPOS DE BARCOS
• speed
• fishing

TOTAL POR TIPO
• speed: $500

GENERO POR TIPO
• speed
   Mujeres: 3
   Hombres: 2

TOTAL PAGADO POR "Priscilla"
• Priscilla (ID: 47): $376.179
```

---

## Tecnologias que se utilizaron

* Google Apps Script
* JavaScript
* Google Sheets

---

##  Autora

**Yuliana Suhey Carrera Brito**
**22760731**

---


