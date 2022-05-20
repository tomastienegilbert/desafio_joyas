const express = require('express');
const guitarras = require('./data/guitarras.js');

const app = express();
app.listen(3000, () => {
  console.log("El servidor está inicializado en el puerto http://localhost:3000");
});

app.get("/guitarra/:id", (req, res) => {
  const { id } = req.params;
  const guitarra = guitarras.find((g) => g.id == id);
  res.send(guitarra);
});

// Versionamiento de APIs
// Los versionamientos en las APIs existen para responder a nuevos requisitos que exigen los
// clientes de nuestro servicio, lo cual es muy normal de ver durante el funcionamiento de un
// sistema.
// Los versionamientos normalmente se representan por la “v” que podemos ver declarada
// como parámetro en la URL, seguida del número representativo de la versión.
// Ejemplo: https://pokeapi.co/api/v2/pokemon/ditto

const HATEOASV1 = () =>
  guitarras.map((g) => {
    return {
      name: g.name,
      href: `http://localhost:3000/guitarra/${g.id}`,
    };
  });

const HATEOASV2 = () => {
  guitarras.map((g) => {
    return {
      guitar: g.name,
      src: `http://localhost:3000/guitarra/${g.id}`,
    };
  });
  
app.get("/api/v1/guitarras", (req, res) => {
  res.send({
    guitarras: HATEOASV1(),
  });
});
}

// Estamos obteniendo el mismo modelo de datos con la diferencia de los nombres de las propiedades.
app.get("/api/v2/guitarras", (req, res) => {
  res.send({
    guitarras: HATEOASV2(),
  });
});

// En el caso de no realizar una nueva versión al momento de modificar el contrato de datos,
// podría significar un impacto gigantesco considerando que las aplicaciones clientes
// están programadas para esperar por ejemplo “A”, y si reciben de repente “B” podría
// afectar de forma importante toda la lógica del sistema.

// Filtros
// Guitarras filtradas por el cuerpo
const filtroByBody = (body) => {
  return guitarras.filter((g) => g.body === body);
};

app.get("/api/v3/body/:cuerpo", (req, res) => {
  const { cuerpo } = req.params;
  const guitarrasByBody = filtroByBody(cuerpo);
  res.send({
    cant: guitarrasByBody.length,
    guitarras: guitarrasByBody,
  });
});

// Ordenación de los datos
const orderValues = (order) => {
  if (order == "asc") return guitarras.sort((a, b) => (a.value > b.value ? 1 : -1));
  if (order == "desc") return guitarras.sort((a, b) => (a.value < b.value ? 1 : -1));
  return false;
};

// http://localhost:3000/api/v3/guitarras?order=asc
// http://localhost:3000/api/v3/guitarras?order=desc
app.get("/api/v3/guitarras", (req, res) => {
  const { order } = req.query;
  if (order == "asc" || order == "desc") {
    return res.send(orderValues(order));
  }
  res.send({ guitarras: HATEOASV2() });
});

// Selección de campos
const fieldsSelect = (guitarra, fields) => {
  for (propiedad in guitarra) {
    if (!fields.includes(propiedad)) delete guitarra[propiedad];
  }
  return guitarra;
};

// http://localhost:3000/api/v3/guitarra/1?fields=id,name,brand,color
app.get("/api/v3/guitarra/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  const guitarra = guitarras.find((g) => g.id == id);

  if (fields) return res.send({
    guitarra: fieldsSelect(guitarra, fields.split(","))
  });

  res.send({ guitarra });
});


// Paginación de datos
// La paginación de datos en una API REST se refiere a la devolución particionada de los
// recursos que están alojados en el lado del servidor.
// Por ejemplo, la Pokeapi aplica esta buena práctica, ya que al consultar el endpoint
// https://pokeapi.co/api/v2/pokemon/ recibimos 2 propiedades “next” y “previous”
app.get("/api/v4/guitarras", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || guitarras.length;

  const start = (page * limit) - limit;
  const end = page * limit;

  const data = HATEOASV4().slice(start, end);

  const nextPage = page + 1;
  const previousPage = page - 1;
  const hasNextPage = ((nextPage * limit) - limit) < guitarras.length;
  const hasPreviousPage = previousPage > 0;

  const url = 'http://localhost:3000/api/v4/guitarras';

  return res.send({
    count: data.length,
    next: hasNextPage ? `${url}?page=${nextPage}&limit=${limit}` : null,
    previous: hasPreviousPage ? `${url}?page=${previousPage}&limit=${limit}` : null,
    results: data,
  });
});

// Uso del payload para el manejo de errores con códigos de estado HTTP
// Los códigos de estado HTTP normalmente son generados por defecto sin tener que
// programarlos. El problema con esto, es que no controlamos el estado de la respuesta del
// servidor, por lo que el usuario podría recibir un código ambiguo y sin una descripción
// detallada sobre qué sucedió e incluso cómo podría resolver el problema.
app.get("/api/v4/guitarra/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  const guitarra = guitarras.find((g) => g.id == id);
  if (!guitarra) {
    return res.status(404).send({
      error: "404 Not Found",
      message: "Guitarra no encontrada",
    });
  }

  if (fields) return res.send({
    guitarra: fieldsSelect(guitarra, fields.split(","))
  });

  res.send({ guitarra });
});

const HATEOASV4 = () =>
  guitarras.map((g) => {
    return {
      guitar: g.name,
      src: `http://localhost:3000/api/v4/guitarra/${g.id}`,
    };
  });