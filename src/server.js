const express = require('express');
const cors = require('cors');  // Importa o pacote cors
const routes = require('./routes');
const app = express();
const port = process.env.PORT ||3000;

// Primeiro aplica o CORS
app.use(cors());  // Aplica o CORS antes das rotas

// Configura para aceitar JSON
app.use(express.json());

// Usa as rotas depois de aplicar o CORS
app.use(routes);

app.get('/', (req,res) =>{
    res.send('Hello, world!');
});


app.listen(3000, ()=>{
    console.log("conectando porta padrão 3000")
});