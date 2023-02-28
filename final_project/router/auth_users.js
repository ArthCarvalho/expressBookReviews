const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return username.match(/^[a-zA-Z\-]+$/);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(404).json({ message: "Error logging in." });
    }
    if(authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization;
    const { isbn } = req.params;
    const { rating } = req.query;
    const { text } = req.body;
    if(!rating) {
        return res.status(404).json({ message: "Review requires at least a rating." });
    }
    let book = books[isbn];
    if(!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    let isEdit = Object.keys(book.reviews).find(x => x === username);
    book.reviews[username] = { body: text, rating };
    return res.status(200).json({
        message: `Your review for the book ${book.title} has been ${isEdit ? 'updated' : 'added'}.`
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization;
    const { isbn } = req.params;
    let book = books[isbn];
    if(!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    if(!book.reviews[username]) {
        return res.status(404).json({ message: `You have not submitted any reviews for the book ${book.title}.` });
    }
    delete book.reviews[username];
    return res.status(200).json({ message: `Your review for the book ${book.title} has been deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
