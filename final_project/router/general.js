const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0) return true;
    return false;
}

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if(username && password) {
        if(!isValid(username)) {
            return res.status(404).json({ message: "Invalid user name." });
        }
        if(username === password) {
            return res.status(404).json({ message: "User name and password cannot be the same." });
        }
        if(doesExist(username)) {
            return res.status(404).json({ message: "User already exists!" });
        }
        users.push({ "username": username,"password": password });
        return res.status(200).json({ message: "User successfully registred. Now you can login." });
    }
    let missing = { "User Name": username && true, "Password": password && true };
    return res.status(404).json({
        message: `Unable to register user. Missing: ${Object.keys(missing).filter(key => {
            return missing[key] !== true;
        }).join(', ')}.`
    });
});

public_users.get('/', async (req, res) => 
    new Promise((resolve, reject) => {
        resolve(books);
    }).then(result => res.status(200).json(result))
);

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
    const { isbn } = req.params;
    if(isbn) {
        return new Promise((resolve, reject) => {
            resolve(books[isbn]);
        }).then(result => res.status(200).json(result));
    }
});
  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
    const { author } = req.params;
    return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let bookMatches = [];
        keys.forEach((key, index) => {
            if(books[key].author.includes(author)) {
                bookMatches.push(books[key]);
            }
        });
        resolve(bookMatches);
    }).then(result => res.status(200).json(result));
});

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
    const { title } = req.params;
    return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let bookMatches = [];
        keys.forEach((key, index) => {
            if(books[key].title.includes(title)) {
                bookMatches.push(books[key]);
            }
        });
        resolve(bookMatches);
    }).then(result => res.status(200).json(result));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;
    if(isbn) {
        res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
});

module.exports.general = public_users;
