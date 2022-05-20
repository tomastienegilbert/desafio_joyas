const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
const chalk = require('chalk')


//1) Crear una ruta para la devolución de todas las joyas aplicando HATEOAS.
//VERSIÓN 1
const HATEOASV1 = () => {
  return joyas.results.map(j => {
    return {
      id: j.id,
      name: j.name,
      model: j.model,
      category: j.category,
      metal: j.metal,
      cadena: j.cadena,
      medida: j.medida,
      value: j.value,
      stock: j.stock,
    }
  });
};

//Ruta HATEOAS V1: http://localhost:3000/api/v1/joyas/
app.get('/api/v1/joyas', (req, res) => {
    const datos = HATEOASV1();
     //7) Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o descendente usando Query Strings. http://localhost:3000/api/v2/joyas?value=asc
    const { orden } = req.query || null;
    if (orden === 'asc') {
      datos.sort((a, b) => a.value - b.value);
    } else if (orden === 'desc') {
      datos.sort((a, b) => b.value - a.value);
    }
    res.json(datos);
});

//2) Hacer una segunda versión de la API que ofrezca los mismos datos pero con los nombres de las propiedades diferentes. (1 punto)
//VERSIÓN 2
const HATEOASV2 = () => {
  return joyas.results.map(j => {
    return {
      ID: j.id,
      Joya: j.name,
      Categoria: j.category,
      Valor: j.value
    }
  });
};

//3. La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría. 
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


//Ruta HATEOASV2: http://localhost:3000/api/v2/joyas
app.get('/api/v2/joyas', (req, res) => {
    const datos = HATEOASV2();
    //6) Permitir hacer paginación de las joyas usando Query Strings. http://localhost:3000/api/v2/joyas?pagina=1
    const orden = req.query.orden || null;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 2;
    const fin = pagina * limite;
    const inicio = fin - limite;
    const paginacion = HATEOASV2().slice(inicio, fin);
    // res.send({
    //   count: paginacion.length,
    //   results: paginacion
    // });
    //7) Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o descendente usando Query Strings.
    if (orden === 'asc') {
      const paginacionOrdAsc = paginacion.sort((a, b) => a.Valor - b.Valor);
      res.send({
        count: paginacionOrdAsc.length,
        results: paginacionOrdAsc
      });
    } else if (orden === 'desc') {
      const paginacionOrdDesc = paginacion.sort((a, b) => b.Valor - a.Valor);
      res.send({
        count: paginacionOrdDesc.length,
        results: paginacionOrdDesc
      });
    } else {
      res.send({
        count: paginacion.length,
        results: paginacion
      });
    }
});

// 4) Crear una ruta que permita el filtrado por campos de una joya a consultar.
app.get('/api/v1/joyas/:id', (req, res) => {
  const { id } = req.params;
  const joya = joyas.results.find((j) => j.id === parseInt(id));
  // 5) Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando el usuario consulte el id de una joya que no exista.
  if (!joya) {
      return res.status(404).send('<h1>No existe la joya</h1>');
  } else {
    console.log(joya);
    return res.send(joya);
  }
});



app.listen(3000, () => {
  console.log(chalk.green.bold('Servidor iniciado en puerto 3000'));
});