const express = require('express');
const app = express();
const port = 3000;
const moment = require('moment-timezone');
const cors = require('cors'); // Importar el módulo cors

const ZKLib = require('node-zklib');

app.use(cors());

app.get('/users', async (req, res) => {
  const zkInstance = new ZKLib('181.48.129.126', 4370, 50000, 4000, '0');
  await zkInstance.createSocket();
  const users = await zkInstance.getUsers();
  console.log(users)
  res.send(users);
});

app.get('/users-by-registers', async (req, res) => {
  const tienda = req.query.tienda
  try {
    const zkInstance = new ZKLib(tienda, 4370, 50000, 4000, '0');
    await zkInstance.createSocket();

    const user = await zkInstance.getUsers();
    const registers = await zkInstance.getAttendances();
    //  const fechaDeseada = new Date('2023-02-01'); // Cambia la fecha a tu mes deseado
    const fechaParam = req.query.fecha;

    // Divide la fechaParam en año y mes
    const [añoDeseado, mesDeseado] = fechaParam.split('-').map(Number);

    const resultadosFiltrados = registers.data.filter(item => {
      const recordTime = new Date(item.recordTime);
      return recordTime.getFullYear() === añoDeseado && recordTime.getMonth() + 1 === mesDeseado;
    });

    const usuariosConRegistros = user.data.map((usuario) => {

      const registrosUsuario = resultadosFiltrados.filter((registro) => {
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

  } catch (error) {
    console.log(error)
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});