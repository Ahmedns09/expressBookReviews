const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
    //Asynchronous operation using Promise

    const myPromise = new Promise((resolve, reject) => {
        axios.get('https://anskhzyan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb.json')
            .then(response => resolve(response.data))
            .catch(error => reject(error));
    });

    myPromise.then((data) => {
        return res.status(200).send(JSON.stringify(books, null, 4));
    })
        .catch((err) => {
            return res.status(500).json({ message: err });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    //Write your code here
    //Asynchronous operation using Promise
    let isbn = req.params.isbn;

    const myPromise1 = new Promise((resolve, reject) => {
        axios.get('https://anskhzyan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb.json')
            .then(response => resolve(response.data))
            .catch(error => reject(error));
    });

    myPromise1.then((data) => {
        const myPromise2 = new Promise((resolve, reject) => {
            if (data.hasOwnProperty(isbn)) {
                resolve(true);
            } else {
                reject("Invalid ISBN");
            }
        });

        myPromise2.then(() => {
            return res.status(200).json(data[isbn]);
        })
            .catch((err2) => {
                return res.status(400).json({ message: err2 });
            });

    })
        .catch((err1) => {
            return res.status(500).json({ message: err1.message || err1 });
        });
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    //Write your code here
    //Asynchronous operation using Async/Await
    async function fetchBook(data) {
        try{
            const response = await axios('https://anskhzyan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb.json');
            if(response.data){
                return response.data;
            }else{
                throw new Error("No books found!");
            }
        } catch(err){
            throw new Error("Failed to fetch books: "+err.message);
        }
    }

    try {
        let author = req.params.author;
        const data = await fetchBook();
        let booksByauthor = [];

        for (let isbn in data) {
            if (data[isbn]["author"] === author) {
                booksByauthor.push(data[isbn]);

            }
        }

        if (booksByauthor.length === 0) {
            return res.status(400).json({ message: "Invalid Author!" });
        }

        return res.status(200).json(booksByauthor);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    //Write your code here
    //Asynchronous operation using Async/Await
    async function fetchBook(data) {
        try{
            const response = await axios('https://anskhzyan-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb.json');
            if(response.data){
                return response.data;
            }else{
                throw new Error("No books found!");
            }
        } catch(err){
            throw new Error("Failed to fetch books: "+err.message);
        }
    }

    try {
        let title = req.params.title;
        const data = await fetchBook();
        let booksByTitle = [];

        for (let isbn in data) {
            if (data[isbn]["title"] === title) {
                booksByTitle.push(data[isbn]);
            }
        }

        if (booksByTitle.length === 0) {
            return res.status(400).json({ message: "Invalid title!" });
        }

        return res.status(200).json(booksByTitle);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here

    let isbn = req.params.isbn;
    if (Object.keys(books).includes(isbn)) {
        res.json(books[isbn]["reviews"]);
    }
    return res.status(400).json({ message: "Invalid ISBN" });
});

module.exports.general = public_users;
