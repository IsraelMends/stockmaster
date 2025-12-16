import express from 'express';

import cors from 'cors' //Permite que outros sites acessem minha API

import dotenv from 'dotenv' //Carrega as informações do arquivo .env

dotenv.config()

const app  = express();

app.use(cors());

app.use(express.json());

app.get('/', (req,res) =>{
    res.json({message:'API Funcionando'})
})

const PORT = process.env.PORT || 3333;

app.listen(PORT, () =>{
    //Função executada quando o servidor está ligado
    console.log(`HTTP Server is running in port ${PORT}`)
})