const express = require('express');
const app = express();
const port = 3000;
const moment = require('moment-timezone');
const cors = require('cors'); // Importar el módulo cors

const ZKLib = require('node-zklib');

// Habilitar CORS para todas las rutas
app.use(cors());

app.get('/users',async (req, res) => {
  const zkInstance = new ZKLib('192.168.169.183', 4370, 50000, 4000, '0');
    await zkInstance.createSocket();
    const users = await zkInstance.getUsers();
console.log(users)
    res.send(users);
});

app.get('/users-by-registers', async (req, res) => {
  const zkInstance = new ZKLib('192.168.169.183', 4370, 50000, 4000, '0');
  await zkInstance.createSocket();
  const user = await zkInstance.getUsers();
  const registers = await zkInstance.getAttendances();

  
  
  // Crear un nuevo array para almacenar los registers filtrados
  
  const usuariosConRegistros = user.data.map((usuario) => {
    
    const registrosUsuario = registers.data.filter((registro) => {
      return registro.deviceUserId === usuario.userId || registro.deviceUserId === usuario.userId;
    
    });
   
    const registrosPorDia = {};
    registrosUsuario.forEach((registro) => {
      const fechaRegistro = new Date(registro.recordTime).toLocaleDateString();
      if (!registrosPorDia[fechaRegistro]) {
        registrosPorDia[fechaRegistro] = [];
      }
      registrosPorDia[fechaRegistro].push(registro);
    });

    return { ...usuario, registrosDia: registrosPorDia };
  });
  
  res.send(usuariosConRegistros);
});


// app.get('/users-by-registers', async (req, res) => {
//   const zkInstance = new ZKLib('192.168.169.183', 4370, 50000, 4000, '0');
//   await zkInstance.createSocket();
//   const user = await zkInstance.getUsers();
//   const registers = await zkInstance.getAttendances();

  
  
//   // Crear un nuevo array para almacenar los registers filtrados
  
//   const usuariosConRegistros = user.data.map((usuario) => {
    
//     const registrosUsuario = registers.data.filter((registro) => {
//       return registro.deviceUserId === usuario.userId || registro.deviceUserId === usuario.userId;
    
//     });
   
//     const registrosPorDia = {};
//     registrosUsuario.forEach((registro) => {
//       const fechaRegistro = new Date(registro.recordTime).toLocaleDateString();
//       if (!registrosPorDia[fechaRegistro]) {
//         registrosPorDia[fechaRegistro] = [];
//       }
//       registrosPorDia[fechaRegistro].push(registro);
//     });

//     return { ...usuario, registrosDia: registrosPorDia };
//   });
  
//   res.send(usuariosConRegistros);
// });

  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});