const verificarSenha = (req, res, next) => {
    const senha_banco = req.query.senha_banco;
    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }
    next();
};

module.exports = {verificarSenha}