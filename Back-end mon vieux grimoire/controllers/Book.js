const Book = require('../models/Book');
const fs = require('fs');
const mongoSanitize = require('mongo-sanitize');

// Création d'un livre //
exports.createBook = (req, res, next) => {
   

        let bookObject = JSON.parse(mongoSanitize(req.body.book));
        delete bookObject._id;
        delete bookObject._userId;
        
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
    
        book.save()
            .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
            .catch((error) => {
                console.log(error)
                res.status(400).json({ error })}
                );
    };

// Modifie un livre //
exports.modifyBook = (req, res, next) => {
    let bookObject = req.file ? {
        ...JSON.parse(mongoSanitize(req.body.book)),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...mongoSanitize(req.body) };

    delete bookObject._userId;

    Book.findOne({_id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        if (req.file) {
                            const imagePath = `./images/${book.imageUrl.split('/').pop()}`;
                            fs.unlink(imagePath, (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                        res.status(200).json({ message: "Livre modifié avec succès !"})
                    })
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Suppression //
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if(book.userId != req.auth.userId) { 
                res.status(403).json({message: 'Non-autorisé !'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];

                fs.unlink(`images/${filename}`, () => { 
                    Book.deleteOne({_id: req.params.id})
                        .then(() => res.status(200).json({message: 'Livre Supprimé !'}))
                        .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch(error => res.status(500).json({error}));
};

// Recherche d'un livre //
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

// Recherche de tous les livres //
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

// Notation d'un livre //
exports.ratingBook = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit se trouver entre 0 et 5' });
    }
    Book.findOne({ _id: req.params.id }) 
        .then((book) => {
            if (book.ratings.find(r => r.userId === req.auth.userId)) { 
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            } else {
                book.ratings.push(updatedRating); 
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length; 
                return book.save(); 
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
};


exports.getBestRatings = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
 
