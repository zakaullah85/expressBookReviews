const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", async (req,res) => {
   try {
        let { userId, password } = req.body;
        let newUser = await new Promise((resolve, reject) => {
            if (userId && password) {
                var user = {
                    userId: userId,
                    password: password
                };

                users.push(user);
                resolve(user);
            } else {
                reject("Body Empty");
            }
        });

        res.status(200).json({ message: "The user " + userId + " has been registered" });
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooks()
    .then(booksList => {
        res.status(200).json(JSON.stringify(booksList));
    })
    .catch(error => {
        res.status(500).json({ message: 'Internal Server Error' });
    });
});

const getBooks = () => {
    return new Promise((resolve, reject) => {
        // Simulate an asynchronous operation
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject(new Error('Books not found'));
            }
        }, 1000); // Simulate a delay of 1 second
    });
};

// Function to simulate fetching a book by ISBN with a Promise
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        // Simulate an asynchronous operation
        setTimeout(() => {
            const book = books.find(book => book.isbn === isbn);
            if (book) {
                resolve(book);
            } else {
                reject(new Error('Book not found'));
            }
        }, 1000); // Simulate a delay of 1 second
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const { isbn } = req.params;
    getBookByISBN(isbn)
        .then(book => {
            res.status(200).json(book);
        })
        .catch(error => {
            if (error.message === 'Book not found') {
                res.status(404).json({ message: 'Book not found' });
            } else {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
 });
  
 
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    new Promise((resolve, reject) => {
        const foundbooks = books.filter(book => book.author.toLowerCase().includes(req.params.author.toLowerCase()));
        if (foundbooks.length > 0) {
            resolve(foundbooks);
        } else {
            reject("Books not found");
        }
    })
    .then(booksresult => {
        res.json(booksresult);
    })
    .catch(error => {
        res.status(500).json({ message: error });
    });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    new Promise((resolve, reject) => {
        const foundbooks = books.filter(book => book.title.toLowerCase().includes(req.params.title.toLowerCase()));
        if (foundbooks.length > 0) {
            resolve(foundbooks);
        } else {
            reject("Book not found");
        }
    })
    .then(booksResult => {
        res.json(booksResult);
    })
    .catch(error => {
        res.status(500).json({ message: error });
    });
});


//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    try {
        let bookReviews = await new Promise((resolve, reject) => {
            const foundbook = books.find(book => book.isbn === req.params.isbn)
            if (foundbook) {
                resolve(foundbook.reviews);
            } else {
                reject("Book not found");
            }
        });

        return res.json(bookReviews);
    } catch (error) {
        return res.status(500).json({message:error});
    }
});

module.exports.general = public_users;
