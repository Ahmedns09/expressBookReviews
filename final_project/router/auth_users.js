const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    let userwithsamename = users.filter((user) => user.username === username);
    if (userwithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    let validUsers = users.filter(user => user.username === username && user.password === password);

    if (validUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 5 });
        req.session.authorization = { accessToken, username };
        res.send("User successfully logged in!");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //Write your code here

    const givenISBN = req.params.isbn;
    const newReview = req.query.rev;

    if (Object.keys(books).some((key) => key === givenISBN)) {

        const username = req.session.authorization['username'];

        if (Object.keys(books[givenISBN]["reviews"]).some((key) => key === username)) {
            books[givenISBN]["reviews"][username] = newReview;
            res.json("Your review is updated.");
        } else {
            books[givenISBN]["reviews"][username] = newReview;
            return res.json("Your review is added.");
        }
    } else {
        res.status(400).json({ message: "Invalid ISBN" });
    }
});


//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbnGiven = req.params.isbn;

    if (!req.session?.authorization?.username) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!books.hasOwnProperty(isbnGiven)) {
        return res.status(404).json({ message: "Invalid ISBN" });
    }

    const username = req.session.authorization.username;
    const reviews = books[isbnGiven].reviews;

    if (reviews.hasOwnProperty(username)) {
        delete reviews[username];
        return res.json({ message: "Your review has been deleted." })
    } else {
        return res.status(404).json({ message: "No review found for this user!" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
