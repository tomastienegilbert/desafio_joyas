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
      return res.status(404).send({
          message: 'La joya no existe',
      });
  } else {
    return res.send(joya);
  }
});

// La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría.
const filterByCategory = (category) => {
  return joyas.filter((j) => j.category === category);
};

//Ruta de filtro
app.get('/api/v1/category/:category', (req, res) => {
  const { category } = req.params;
  const joyasByCategory = filterByCategory(category);
  res.send({
    cant: joyasByCategory.length,
    joyas: joyasByCategory,
  });
});
//   const { category } = req.params;
//   const joyasByCategory = filterByCategory(category);
//   res.send({
//     name: category,
//     joya: joyasByCategory.length
//   })
// });

app.get('/api/v1/joyas/:id', (req, res) => {
  const { id } = req.params;
  const joya = joyas.find((j) => j.id === id);
  if (!joya) {
    res.status(404).send({
      error: `No existe la joya con id ${id}`
    });
  } else {
    res.send({
      name: joya.name,
      category: joya.category,
      value: joya.value,
      metal: joya.metal
    });
  }
});

//Permitir hacer paginación de las joyas usando Query Strings.

//Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o descendente usando Query Strings.


