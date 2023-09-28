const express = require('express');
const contas = require('./controladores/contasControladores')
const transacoes = require('./controladores/transacoesControladores')
const intermediadores = require('./intermediadores');
const rotas = express();


rotas.get('/contas', intermediadores.verificarSenha, contas.listarContas)
rotas.post('/contas', contas.criarContaBancaria)
rotas.put('/contas/:numeroConta/usuario', contas.atualizarUsuarioConta)
rotas.delete('/contas/:numeroConta', contas.deletarConta)
rotas.get('/contas/saldo', contas.saldo)
rotas.get('/contas/extrato', contas.extrato)

rotas.post('/transacoes/depositar', transacoes.depositar)
rotas.post('/transacoes/sacar', transacoes.sacar)
rotas.post('/transacoes/transferir', transacoes.transferir)

module.exports = rotas;