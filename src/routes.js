const express = require('express');
const fs = require('fs');  // Para ler o arquivo de texto
const path = require('path');  // Para resolver o caminho do arquivo

const routes = express.Router();




// Variável local para armazenar dados temporários em JSON
const acessos = {
    "Medicos": [
      {
        "Usuario": "diana.green123",
        "Senha": "DianaPass123!",
        "TipoDeAcesso": "Medico",
        "imagem": ""
      }
    ],
    "Pacientes": [
      {
        "Usuario": "bob.brown654",
        "Senha": "BobPass654!",
        "TipoDeAcesso": "Paciente",
        "imagem": ""
      }
    ],
    "Administradores": [
      {
        "Usuario": "admin.user789",
        "Senha": "AdminPass789!",
        "TipoDeAcesso": "Administrador",
        "imagem": ""

      }
    ]
  };
  
  // Função para obter uma lista de fotos da API Unsplash
  async function fetchPhotosList() {
    const clientId = "UAyZcwpLMS7aeLdK1opXUn-5Jams-2O_j420soTVBIs"; // Substitua por sua própria chave
    const API_URL = `https://api.unsplash.com/photos/?client_id=${clientId}`;
  
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      const data = await response.json();
      return data; // Retorna a lista completa de fotos
    } catch (error) {
      console.error("Erro ao buscar lista de fotos:", error);
      return [];
    }
  }
  
  // Função para adicionar imagens aleatórias aos usuários
  async function addRandomImagesToUsers() {
    const photos = await fetchPhotosList();
  
    if (photos.length === 0) {
      console.error("Nenhuma imagem disponível para adicionar.");
      return;
    }
  
    const roles = Object.keys(acessos);
    
    for (const role of roles) {
      for (const user of acessos[role]) {
        const randomIndex = Math.floor(Math.random() * photos.length);
        const randomImage = photos[randomIndex]?.urls?.regular || "https://via.placeholder.com/150"; // Placeholder em caso de falha
        user.imagem= randomImage;
      }
    }
  }
  
  // Executar a função
  addRandomImagesToUsers();

// Função para ler os dados
function lerAcessos(callback) {
  callback(acessos);
}

// Função para salvar os dados
function salvarAcessos(novosAcessos, callback) {
  try {
    // Atualiza os dados da variável local
    Object.assign(acessos, novosAcessos);  
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
  addRandomImagesToUsers();
  lerAcessos((acessos) => {
    if (!acessos) {
      return res.status(500).send("Erro ao ler o arquivo de acessos.");
    }

    // Criar um array com todos os usuários e senhas
    const usuarios = {
      Administradores: acessos.Administradores.map(({ Usuario, Senha, imagem }) => ({ Usuario, Senha, imagem })),
      Medicos: acessos.Medicos.map(({ Usuario, Senha, imagem }) => ({ Usuario, Senha, imagem })),
      Pacientes: acessos.Pacientes.map(({ Usuario, Senha,imagem }) => ({ Usuario, Senha,imagem }))
    };

    // Retornar o array de usuários e senhas
    return res.status(200).json(usuarios);
  });
});


routes.patch('/usuarios', (req, res) => {
  const { acao, tipo, usuario, dados } = req.body;
    
    if (acao === 'adicionar') {
      if (tipo === 'Medicos') {
        parsedData.Medicos.push(dados);
      } else if (tipo === 'Pacientes') {
        parsedData.Pacientes.push(dados);
      }
    } else if (acao === 'remover') {
      if (tipo === 'Medicos') {
        parsedData.Medicos = acessos.Medicos.filter(m => m.Usuario !== usuario);
      } else if (tipo === 'Pacientes') {
        parsedData.Pacientes = acessos.Pacientes.filter(p => p.Usuario !== usuario);
      }
    }
    
      // Envia os dados atualizados de volta ao cliente
      res.json(parsedData);
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
// Rota para deletar médico
routes.post('/deleteMedico', (req, res) => {
  const { user } = req.body;

  // Filtra a lista de médicos para remover o médico com o usuário especificado
  const novoMedicos = acessos.Medicos.filter(medico => medico.Usuario !== user);

  // Verifica se algum médico foi removido
  if (novoMedicos.length === acessos.Medicos.length) {
    return res.status(404).json({ message: "Médico não encontrado." });
  }

  // Atualiza a lista de médicos
  acessos.Medicos = novoMedicos;
  return res.status(200).json({ message: "Médico removido com sucesso!" });
});

// Rota para deletar paciente
routes.post('/deletePaciente', (req, res) => {
  const { user } = req.body;

  // Filtra a lista de pacientes para remover o paciente com o usuário especificado
  const novoPacientes = acessos.Pacientes.filter(paciente => paciente.Usuario !== user);

  // Verifica se algum paciente foi removido
  if (novoPacientes.length === acessos.Pacientes.length) {
    return res.status(404).json({ message: "Paciente não encontrado." });
  }

  // Atualiza a lista de pacientes
  acessos.Pacientes = novoPacientes;
  return res.status(200).json({ message: "Paciente removido com sucesso!" });
});
module.exports = routes;