const express = require('express');
const fs = require('fs');  // Para ler o arquivo de texto
const path = require('path');  // Para resolver o caminho do arquivo

const routes = express.Router();



// Função para ler o arquivo acessos.txt
function lerAcessos(callback) {
  const filePath = path.join(__dirname, 'acessos.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo acessos.txt:', err);
      return callback(null);
    }

    try {
      const acessos = JSON.parse(data);  // Parse JSON do arquivo
      return callback(acessos);
    } catch (parseError) {
      console.error('Erro ao fazer parsing do arquivo acessos.txt:', parseError);
      return callback(null);
    }
  });
}
const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Erro ao parsear JSON'));
      }
    });
  });
};

const writeFile = (filename, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Rota de login
routes.post('/login', (req, res) => {
  const { user, password } = req.body;  // Captura os dados enviados no corpo da requisição

  // Chama a função para ler os acessos
  lerAcessos((acessos) => {
    if (!acessos) {
      return res.status(500).send("Erro ao ler o arquivo de acessos.");
    }

    // Verificar se o usuário existe como Administrador
    const admin = acessos.Administradores.find(
      admin => admin.Usuario === user && admin.Senha === password
    );

    if (admin) {
      return res.status(200).json({ message: "Login bem-sucedido!", tipoDeAcesso: admin.TipoDeAcesso, redirectTo: "/admin" });
    }

    // Verificar se o usuário existe como Médico
    const medico = acessos.Medicos.find(
      medico => medico.Usuario === user && medico.Senha === password
    );

    if (medico) {
      return res.status(200).json({ message: "Login bem-sucedido!", tipoDeAcesso: medico.TipoDeAcesso, redirectTo: "/medico" });
    }

    // Verificar se o usuário existe como Paciente
    const paciente = acessos.Pacientes.find(
      paciente => paciente.Usuario === user && paciente.Senha === password
    );

    if (paciente) {
      return res.status(200).json({ message: "Login bem-sucedido!", tipoDeAcesso: paciente.TipoDeAcesso, redirectTo: "/paciente" });
    }

    // Se as credenciais não forem encontradas
    return res.status(401).json({ message: "Credenciais inválidas." });
  });
});

// Rota para exibir todos os usernames e senhas
routes.get('/usuarios', (req, res) => {
  // Chama a função para ler os acessos
  lerAcessos((acessos) => {
    if (!acessos) {
      return res.status(500).send("Erro ao ler o arquivo de acessos.");
    }

    // Criar um array com todos os usuários e senhas
    const usuarios = {
      Administradores: acessos.Administradores.map(({ Usuario, Senha }) => ({ Usuario, Senha })),
      Medicos: acessos.Medicos.map(({ Usuario, Senha }) => ({ Usuario, Senha })),
      Pacientes: acessos.Pacientes.map(({ Usuario, Senha }) => ({ Usuario, Senha }))
    };

    // Retornar o array de usuários e senhas
    return res.status(200).json(usuarios);
  });
});

const filePath = path.join(__dirname, '..', 'src', 'acessos.txt');

routes.patch('/usuarios', (req, res) => {
  const { acao, tipo, usuario, dados } = req.body;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler o arquivo' });
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ error: 'Erro ao processar os dados do arquivo' });
    }
    
    if (acao === 'adicionar') {
      if (tipo === 'Medicos') {
        parsedData.Medicos.push(dados);
      } else if (tipo === 'Pacientes') {
        parsedData.Pacientes.push(dados);
      }
    } else if (acao === 'remover') {
      if (tipo === 'Medicos') {
        parsedData.Medicos = parsedData.Medicos.filter(m => m.Usuario !== usuario);
      } else if (tipo === 'Pacientes') {
        parsedData.Pacientes = parsedData.Pacientes.filter(p => p.Usuario !== usuario);
      }
    }
    
    fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar o arquivo' });
      // Envia os dados atualizados de volta ao cliente
      res.json(parsedData);
    });
  });
});

const atendimentoFilePath = path.join(__dirname, 'src', 'Atendimentos.txt');

// Endpoint para salvar atendimentos




module.exports = routes;