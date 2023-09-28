const bancodedados = require('../bancodedados');

function encontrarConta(numero_conta) {
    return bancodedados.contas.find(conta => conta.numero === numero_conta);
};

function verificarCamposObrigatorios(campos, req, res) {
    const camposFaltantes = campos.filter(campo => !req.body[campo]);
    if (camposFaltantes.length > 0) {
        return camposFaltantes;
    }
    return null;
};

function validarValor(valor, res) {
    if (valor <= 0) {
        res.status(400).json({mensagem: "O valor deve ser positivo."});
        return false;
    }
    return true;
};

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    const camposFaltantes = verificarCamposObrigatorios(['numero_conta', 'valor'], req, res);
    if (camposFaltantes) {
        return res.status(400).json({mensagem: `Os seguintes campos são obrigatórios: ${camposFaltantes.join(', ')}`});
    };

    if (!validarValor(valor, res)) return;

    const conta = encontrarConta(numero_conta);

    if (!conta) {
        return res.status(404).json({mensagem: "Conta não encontrada."});
    }

    conta.saldo += valor;

    const transacao = {
        data: new Date().toISOString(),
        numero_conta,
        valor
    };

    bancodedados.depositos.push(transacao);

    return res.status(204).send();
};

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const camposFaltantes = verificarCamposObrigatorios(['numero_conta', 'valor', 'senha'], req, res);
    if (camposFaltantes) {
        return res.status(400).json({mensagem: `Os seguintes campos são obrigatórios: ${camposFaltantes.join(', ')}`});
    };

    if (!validarValor(valor, res)) return;

    const conta = encontrarConta(numero_conta);

    if(!conta){
        return res.status(404).json({mensagem: "Conta não encontrada."});
    };
    if(conta.usuario.senha !== senha){
        return res.status(404).json({mensagem: "Senha invalida."});
    };
    if(conta.saldo < valor){
        return res.status(404).json({mensagem: "Saldo insuficiente para saque"});
    };
    conta.saldo -= valor;

    const transacao = {
        data: new Date().toISOString(),
        numero_conta,
        valor: -valor
    };
    bancodedados.saques.push(transacao);

    return res.status(204).send();
};

const transferir = (req, res) =>{
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    
    const camposFaltantes = verificarCamposObrigatorios(['numero_conta_origem', 'numero_conta_destino', 'valor', 'senha'], req, res);
    if (camposFaltantes) {
        return res.status(400).json({mensagem: `Os seguintes campos são obrigatórios: ${camposFaltantes.join(', ')}`});
    };

    if (!validarValor(valor, res)) return;

    const contaOrigem = encontrarConta(numero_conta_origem);
    const contaDestino = encontrarConta(numero_conta_destino);

    if (!contaOrigem) {
        return res.status(404).json({mensagem: "Conta de origem não encontrada."});
    };
    if (contaOrigem.usuario.senha !== senha) {
        return res.status(400).json({mensagem: "Senha inválida."});
    };
    if (contaOrigem.saldo < valor) {
        return res.status(400).json({mensagem: "Saldo insuficiente."});
    };
    if (!contaDestino) {
        return res.status(404).json({mensagem: "Conta de destino não encontrada."});
    };

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const transacao = {
        data: new Date().toISOString(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    };
    bancodedados.transferencias.push(transacao);

    return res.status(204).send();

};

module.exports = {
    depositar,
    sacar,
    transferir
};
