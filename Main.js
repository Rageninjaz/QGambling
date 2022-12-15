const { del } = require('express/lib/application');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express(); 
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const console = require('console');

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: "CMSC335DB", collection:"cardGambling"};

class cardGambling{
    param='';
    webServer;
    constructor(){
        let arg = process.argv.slice(2);
        if (arg.length!=1){
            console.log("Usage: cardGamblingMain.js port");
            process.exit(0);
        }
        this.param=arg[0];
        this.webServer='';
    }
    getParam(){
        return this.param;
    }
}

let cardG = new cardGambling();
var connectedClient;

app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render('../templates');
});

app.get("/login", (request, response) => {
    response.render('login.ejs', {message: ""});
});

app.get("/signup", (request, response) => {
    response.render('signup.ejs');
});

app.post('/validateLogin', async (request, response) => {
    try {
        await client.connect();
        delete request.body._id;
        
        filter = {username: `${request.body.username}`};
        var result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);
        
        if (result && request.body.password == result.password) {
            connectedClient = result.username;
            response.render('newGame.ejs', {chips: result.chips});
        } else {
            response.render('login.ejs', {message: "Incorrect Username or Password"});
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post('/processSignup', async (request, response) => {
    try {
        await client.connect();
        delete request.body._id;
        filter = {username: `${request.body.username}`};
        var result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);
        if (result) {
            response.render('login.ejs', {message: "Username Exists: Please Sign In or Create a new Account"});
        }
        request.body.chips = 25;
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(request.body);
        connectedClient = request.body.username;
        response.render('newGame.ejs', {chips: request.body.chips});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post('/betProcess', async (request, response) => {
    try {
        await client.connect();
        delete request.body._id;
        filter = {username: `${connectedClient}`};
        var result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);
        var update = { $set: { chips: (result.chips - request.body.wager)}}
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).updateOne(filter, update);
        response.render('startGame.ejs', {chips: (result.chips - request.body.wager), bet: request.body.wager});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post('/continueBetting', async (request, response) => {
    try {
        await client.connect();
        delete request.body._id;
        filter = {username: `${connectedClient}`};
        var update = { $set: { chips: request.body.chipCount}}
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).updateOne(filter, update);
        response.render('newGame.ejs', {chips: request.body.chipCount});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

const uri = `mongodb+srv://summerCamp:${password}@cluster0.bqefzbu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
http.createServer(app).listen(cardG.getParam());
console.log(`Server started on port ${cardG.getParam()}`);
const readLine = require('readline').createInterface({input: process.stdin, output: process.stdout});
var readL = function() {
    readLine.question('Type stop to shutdown the server: ', function(name){
        if(name=="stop"){
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log(`Invalid command: ${name}`);
        }
        readL();
    });
};
readL();
