const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
const chalk = require('chalk')
app.listen(3000, () => {
  console.log(chalk.green.bold('El servidor está inicializado en el puerto http://localhost:3000'))
});

app.get('/', (req, res) => {
  res.send(joyas)
})

//console.log(joyas)

//Crear una ruta para la devolución de todas las joyas aplicando HATEOAS.
//VERSIÓN 1

const HATEOASV1 = () => {
  return joyas.results;
};

app.get('/api/v1/joyas', (req, res) => {
  res.send(HATEOASV1());
});

//Hacer una segunda versión de la API que ofrezca los mismos datos pero con los nombres de las propiedades diferentes. (1 punto)
//VERSIÓN 2
const HATEOASV2 = () => {
  return joyas.results.map((e) => {
    return {
      id: e.id,
      nombre: e.name,
      modelo: e.model,
      categoria: e.category,
      metal: e.metal,
      cadena: e.cadena,
      medida: e.medida,
      valor: e.value,
      stock: e.stock,
    };
  });
};

app.get("/api/v2/joyas", (req, res) => {
  res.send({
    joyas: HATEOASV2(),
  });
});

//Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando el usuario consulte el id de una joya que no exista.
app.get('/api/v1/joyas/:id', (req, res) => {
  const { id } = req.params;
  const joya = joyas.results.find((j) => j.id === parseInt(id));
  if (!joya) {
      return res.status(404).send('<h1>No existe la joya</h1>');
  } else {
    console.log(joya);
    return res.send(joya);
  }
});

// La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría.
app.get('/api/v1/joyas/categoria/:categoria', (req, res) => {
  const { categoria } = req.params;
  const joyasFiltradas = joyas.results.filter((j) => j.category === categoria);
  if (joyasFiltradas.length === 0) {
    return res.status(404).send('<h1>No hay joyas de esa categoría</h1>');
  } else {
    console.log(joyasFiltradas);
    return res.send(joyasFiltradas);
  }
});

//Permitir hacer paginación de las joyas usando Query Strings.
// app.get('/api/v1/joyas', (req, res) => {
//   const start = parseInt(req.query.offset) || 0;
//   const limit = parseInt(req.query.limit) || 2;
//   const end = start + limit;
//   const urlBase = 'http://localhost:3000/api/v1/joyas';
//   res.send({
//     count: data.length,
//     results: data,
//     previous: start - limit >= 0 ? `${urlBase}?offset=${start - limit}&limit=${limit}` : null,
//     next: `${urlBase}?offset${start + limit}&limit=${limit}`,
//   })
// });

//Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o descendente usando Query Strings (?orden=asc o ?orden=desc).
app.get('/api/v1/joyas', (req, res) => {
  const { orden }= req.query
  if (orden === 'asc' || orden === 'desc') {
    const joyasOrdenadas = joyas.results.sort((a, b) => {
      if (orden === 'asc') {
        return a.value - b.value;
      } else {
        return b.value - a.value;
      }
    });
    console.log(joyasOrdenadas);
    return res.send({joyasOrdenadas});
  }
  res.send(HATEOASV1());
});



// CON PARÁMETROS: Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o descendente usando Query Params.
// app.get('/api/v1/joyas/orden/:orden', (req, res) => {
//   const { orden } = req.params;
//   const joyasOrdenadas = joyas.results.sort((a, b) => {
//     if (orden === 'asc') {
//       return a.value - b.value;
//     } else {
//       return b.value - a.value;
//     }
//   });