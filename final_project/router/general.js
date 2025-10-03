const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    //Write your code here

    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ username: username, password: password })
            return res.status(200).json({ message: "User succesfully registered. Now you can login." });
        } else {
            return res.status(404).json({ message: "User already exist!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Write your code here

    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    //Write your code here

    let isbn = req.params.isbn;
    return res.status(200).json(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    //Write your code here

    let author = req.params.author;
    for (let isbn in books){
        if (books[isbn]["author"] === author){
            return res.json(books[isbn]);
        }
    }
    return res.status(400).json({ message: "Invalid author!" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    //Write your code here

    let title = req.params.title;
    for (let isbn in books){
        if (books[isbn]["title"] === title){
            return res.json(books[isbn]);
        }
    }
    return res.status(400).json({ message: "Invalid title!" });
    
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here

    let isbn = req.params.isbn;
    if(Object.keys(books).includes(isbn)){
        res.json(books[isbn]["reviews"]);
    }
    return res.status(400).json({ message: "Invalid ISBN" });
});

module.exports.general = public_users;
