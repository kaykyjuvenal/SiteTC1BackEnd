const express = require('express');
const fs = require('fs');  // Para ler o arquivo de texto
const path = require('path');  // Para resolver o caminho do arquivo

const routes = express.Router();




// Variável local para armazenar dados temporários em JSON
const acessosData = {
    "Medicos": [
      {
        "Usuario": "diana.green123",
        "Senha": "DianaPass123!",
        "TipoDeAcesso": "Medico"
      }
    ],
    "Pacientes": [
      {
        "Usuario": "bob.brown654",
        "Senha": "BobPass654!",
        "TipoDeAcesso": "Paciente"
      }
    ],
    "Administradores": [
      {
        "Usuario": "admin.user789",
        "Senha": "AdminPass789!",
        "TipoDeAcesso": "Administrador"
      }
    ]
  };


// Função para ler os dados
function lerAcessos(callback) {
  callback(acessosData);
}

// Função para salvar os dados
function salvarAcessos(novosAcessos, callback) {
  try {
    // Atualiza os dados da variável local
    Object.assign(acessosData, novosAcessos);  
    callback(null);
  } catch (erro) {
    callback(erro);
  }
}

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

// Rota para adicionar paciente
routes.post('/paciente', (req, res) => {
  const { user, password } = req.body;

  lerAcessos((acessos) => {
    if (!acessos) {
      return res.status(500).send("Erro ao ler o arquivo de acessos.");
    }

    const pacienteExistente = acessos.Pacientes.find(
      (paciente) => paciente.Usuario === user
    );

    if (pacienteExistente) {
      return res.status(400).json({ message: "Paciente já existe!" });
    }

    acessos.Pacientes.push({
      Usuario: user,
      Senha: password,
      TipoDeAcesso: 'Paciente'
    });

    salvarAcessos(acessos, (erro) => {
      if (erro) {
        return res.status(500).send("Erro ao salvar o novo paciente.");
      }
      return res.status(200).json({ message: "Paciente adicionado com sucesso!" });
    });
  });
});

// Rota para adicionar médico
routes.post('/medico', (req, res) => {
  const { user, password } = req.body;

  lerAcessos((acessos) => {
    if (!acessos) {
      return res.status(500).send("Erro ao ler o arquivo de acessos.");
    }

    const medicoExistente = acessos.Medicos.find(
      (medico) => medico.Usuario === user
    );

    if (medicoExistente) {
      return res.status(400).json({ message: "Médico já existe!" });
    }

    acessos.Medicos.push({
      Usuario: user,
      Senha: password,
      TipoDeAcesso: 'Medico'
    });

    salvarAcessos(acessos, (erro) => {
      if (erro) {
        return res.status(500).send("Erro ao salvar o novo médico.");
      }
      return res.status(200).json({ message: "Médico adicionado com sucesso!" });
    });
  });
});
module.exports = routes;