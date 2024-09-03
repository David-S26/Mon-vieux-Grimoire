const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [{ userId: String, grade: Number }],
    averageRating: { type: Number, required: true },
});
// Calcule la moyenne des note d'un seul livre // 
const averageRating = async(book) => {

    if (book.ratings && book.ratings.length > 0) {                                         
        const totalNotes = book.ratings.reduce((total, rating) => total + rating.grade, 0); 
        book.averageRating = totalNotes / book.ratings.length;                              
    } else {
        book.averageRating = 0; 
    }
    return book.averageRating; 
};

// MAJ + Save  de la note/moyen //
bookSchema.pre('save', (next) => {
    averageRating(this)
    next();
}); 

module.exports = mongoose.model('Book', bookSchema);