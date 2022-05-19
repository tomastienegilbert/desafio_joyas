const express = require('express');
const guitarras = require('./data/guitarras.js');

const app = express();
app.listen(3000, () => {
  console.log("El servidor está inicializado en el puerto http://localhost:3000");
});

// Verbos HTTP disponibles en nuestra API REST:
// GET: Consultas a recursos.
// POST: Crear recursos.
// PUT: Actualizar recursos.
// DELETE: Eliminar recursos.

// HATEOASV1
const HATEOASV1 = () => {
  return guitarras.map((g) => {
    return {
      name: g.name,
      url: `http://localhost:3000/api/v1/guitarras/${g.id}`
    }
  });
};

// Filtros
const filterByBody = (body) => {
  return guitarras.filter((g) => g.body === body);
}

// Ordenar
const orderValues = (order) => {
  if (order === "asc") return guitarras.sort((a, b) => (a.value > b.value ? 1 : -1));
  if (order === "desc") return guitarras.sort((a, b) => (a.value < b.value ? 1 : -1));
  return false;
}

app.get('/api/v1/guitarras', (req, res) => {
  const { order } = req.query;
  if (order === "asc" || order === "desc") {
    return res.send({
      guitarras: orderValues(order)
    });
  }

  res.send({
    guitarras: HATEOASV1()
  });
});

const fieldsSelect = (guitarra, fields) => {
  // validando que la propiedad que estamos recorriendo se encuentre en el arreglo fields
  // validar que los campos recibidos sean propiedades del objeto guitarra
  for (propiedad in guitarra) {
    if (!fields.includes(propiedad)) delete guitarra[propiedad];
  }
  return guitarra;
}

app.get('/api/v1/guitarras/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;
    const guitarra = guitarras.find(g => g.id === parseInt(id));
    if (!guitarra) {
      return res.status(404).send({
        error: "404 Not Found",
        message: "Recurso no encontrado"
      });
    }

    if (fields) {
      return res.send({
        guitarra: fieldsSelect(guitarra, fields.split(","))
      })
    }

    res.send({ guitarra });
  } catch (e) {
    res.status(500).send(e);
  }
});

// http://localhost:3000/api/v2/body/Stratocaster
app.get('/api/v2/body/:body', (req, res) => {
  const { body } = req.params;
  const guitarrasByBody = filterByBody(body);
  res.send({
    name: body,
    guitarras: guitarrasByBody,
    count: guitarrasByBody.length
  })
});