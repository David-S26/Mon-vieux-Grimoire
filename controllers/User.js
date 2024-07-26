const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie le Mot de passe //
exports.signup = (req, res, next) => {
    const password = req.body.password;
    
    // Vérifie sa longeur 
    if (password.length < 7) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 7 caractères.' });
    }
    
    //Vérifie si le MDP contient des caractères spéciaux //
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/; 
    if (!password.match(passwordRegex)) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins un caractère spécial.' });
    }

    bcrypt.hash(password, 10) // Hashage du mots de passe 10 fois // 
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


// Vérification de l'utilisateur //
  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Paire login/mot de passe incorrecte!' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Paire login/mot de passe incorrecte!' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };