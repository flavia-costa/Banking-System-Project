const bancodedados = require('../bancodedados');

function gerarNumeroConta() {
    return bancodedados.contas.length + 1;
}

const listarContas = (req, res) =>{
    const senha_banco = req.query.senha_banco;
    if (senha_banco !== bancodedados.banco.senha) {
        return res.status(400).json({mensagem: "A senha do banco informada é inválida."});
    }
    return res.status(200).json(bancodedados.contas);
};

const criarContaBancaria = (req, res) => {
    const{ nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({mensagem: "Todos os campos são obrigatórios."});
    }

    const contaExistente = bancodedados.contas.find(conta =>
        conta.usuario.cpf === cpf || conta.usuario.email === email
    );

    if (contaExistente) {
        return res.status(400).json({mensagem: "Já existe uma conta com o CPF ou e-mail informado."});
    }

    const novaConta = {
        numero: gerarNumeroConta().toString(),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha,
        },
    };
    bancodedados.contas.push(novaConta);
    return res.status(201).json(novaConta);
};

const atualizarUsuarioConta = (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    let contaAtualizar = null;
    for (const conta of bancodedados.contas) {
        if (conta.numero === numeroConta) {
            contaAtualizar = conta;
        } else {
            if (conta.usuario.cpf === cpf || conta.usuario.email === email) {
                return res.status(400).json({ mensagem: "O CPF ou e-mail informado já existe cadastrado." });
            }
        }
    }

    if (!contaAtualizar) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    }

    contaAtualizar.usuario.nome = nome;
    contaAtualizar.usuario.cpf = cpf;
    contaAtualizar.usuario.data_nascimento = data_nascimento;
    contaAtualizar.usuario.telefone = telefone;
    contaAtualizar.usuario.email = email;
    contaAtualizar.usuario.senha = senha;

    return res.status(204).send();
};


const deletarConta = (req, res) =>{
    const { numeroConta } = req.params;
    const index = bancodedados.contas.findIndex((conta) => {
        return conta.numero === numeroConta;
    });

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    };

    const conta = bancodedados.contas[index];

    if (conta.saldo !== 0) {
        return res.status(403).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }
    bancodedados.contas.splice(index, 1);

    return res.status(204).send();
};

const saldo = (req, res) => {
    const numero_conta = req.query.numero_conta;
    const senha = req.query.senha;

    if (!numero_conta || !senha) {
        return res.status(400).json({mensagem: "O número da conta e a senha são obrigatórios."});
    }

    const conta = bancodedados.contas.find(conta => conta.numero === numero_conta);
    
    if (!conta) {
        return res.status(404).json({ mensagem: "Conta bancária não encontrada."});
    }
    if (conta.usuario.senha !== senha) {
        return res.status(400).json({mensagem: "Senha inválida."});
    }

    return res.status(200).json({saldo: conta.saldo});
};

const extrato = (req, res) => {
    const numero_conta = req.query.numero_conta;
    const senha = req.query.senha;

    if (!numero_conta || !senha) {
        return res.status(400).json({mensagem: "O número da conta e a senha são obrigatórios."});
    }

    const conta = bancodedados.contas.find(conta => conta.numero === numero_conta);
    
    if (!conta) {
        return res.status(404).json({ mensagem: "Conta bancária não encontrada."});
    }

    if (conta.usuario.senha !== senha) {
        return res.status(400).json({mensagem: "Senha inválida."});
    }

    const depositos = bancodedados.depositos.filter(dep => dep.numero_conta === numero_conta);
    const saques = bancodedados.saques.filter(saq => saq.numero_conta === numero_conta);
    const transferenciasEnviadas = bancodedados.transferencias.filter(trans => trans.numero_conta_origem === numero_conta);
    const transferenciasRecebidas = bancodedados.transferencias.filter(trans => trans.numero_conta_destino === numero_conta);

    return res.status(200).json({
        depositos,
        saques,
        transferenciasEnviadas,
        transferenciasRecebidas
    });
};



module.exports={
    listarContas,
    criarContaBancaria,
    atualizarUsuarioConta,
    deletarConta,
    saldo,
    extrato
};