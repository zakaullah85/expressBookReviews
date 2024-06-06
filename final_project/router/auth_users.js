const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    "userId": "zakaullah85@gmail.com",
    "password": "1234567"
  }
]

const isValid = (username)=>{ //returns boolean
 // Check if the username is not empty
    if (!username) {
        return false;
    }

    // Check if the username is at least 3 characters long
    if (username.length < 3) {
        return false;
    }

     const existingUser = users.find(user => user.userId === username);
    // If all checks pass, the username is valid
    return existingUser !== undefined;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    if (users.find(user => user.userId === username && user.password === password)) {
       return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    let { username, password } = req.body;
    if(isValid(username))
    {
        if(authenticatedUser(username,password))
        {
            let accessToken = jwt.sign({
                data: username
            }, 'access', { expiresIn: 60 * 60 });
    
            req.session.authorization = {
                accessToken
            };
            return res.status(200).json({ message: "User has successfully logged in." });
        }else{
            return res.status(400).json({ message: "Invalid useranme or password" })
        }
    }else{
        return res.status(400).json({message: "Invalid username or password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    try {
        let { comment, rating } = req.body;
        let username = req.user.data;
        let book = await new Promise((resolve, reject) => {

            let book = books.find(book => book.isbn === req.params.isbn);

            if (!book) {
                reject("Book not found");
            }
            const review = {
                id: Date.now().toString(),
                userId: username,
                comment: comment,
                rating: rating
            };

            book.reviews.push(review);
            resolve(book);

        });
        return res.status(500).json({ message: "Review has been added for ISBN : " + req.params.isbn + " and title: " + book.title });

    } catch (error) {
        return res.status(500).json({ message: error });
    }
});

// delete book reviews
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    const { isbn } = req.params;
    const userId = req.user.data;
    try {
        const book = await new Promise((resolve, reject) => {
            const foundBook = books.find(book => book.isbn === isbn);
            if (foundBook) {
               
                if (foundBook.reviews.length ===0) {
                    resolve("No reviews found");
                }

                foundBook.reviews = [];
                resolve(foundBook);
            } else {
                reject('Book not found');
            }
        });


        res.status(200).json(book);
    } catch (error) {
        res.status(404).send(error);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
