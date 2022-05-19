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

// HATEOASV1
const HATEOASV1 = () => {
  joyas.map((j) => {
    return {
      name: j.name,
      href: `http://localhost:3000/api/v1/joyas/${j.id}`,
    };
  });
};

app.get('/api/v1/joyas', (req, res) => {
  res.send({
    joyas: HATEOASV1,
  });
});

app.get('/api/v1/joyas/:id', (req, res) => {
    const { id } = req.params;
    const joya = joyas.find(j => j.id === parseInt(id));
    if (!joya) {
        return res.status(404).send({
            message: 'La joya no existe',
        });
    } else {
      return res.send(joya);
    }
  });



//VERSIÓN 2

const HATEOASV2 = () => {
  joyas.map((j) => {
    return {
      joya: j.name,
      src: `http://localhost:3000/joya/${j.id}`,
    };
  });
};

app.get("/api/v2/joyas", (req, res) => {
  res.send({
    joyas: HATEOASV2(),
  });
});

// La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría.
const filterByCategory = (category) => {
  return joyas.filter((j) => j.category === category);
}

//Ruta de filtro
app.get('/api/v1/category/:category', (req, res) => {
  const { category } = req.params;
  const joyasByCategory = filterByCategory(category);
  res.send({
    name: category,
    joya: joyasByCategory.length
  })
});

//Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando el usuario consulte el id de una joya que no exista.

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


