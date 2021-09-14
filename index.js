var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "restapi"
});

con.connect(function (err) { // anslut till databasen
  if (err) throw err;
  console.log("Connected");
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = 5000

const crypto = require('crypto'); //använder NodeJS inbyggda krypteringsfunktioner.
const jwt = require('jsonwebtoken');

function hash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex')
}


app.use(express.json())

app.get('/', function (req, res) {
  res.send(`<html><body><h1>Dokumentation av det här APIet</h1></body></html>`);
});
app.get('/users', function (req, res) {
  var sql = "SELECT * FROM users"
  con.query(sql, function (err, result, fields) {
    if (err) throw err
    res.json(result)
  });
});

app.get('/users/:id', function (req, res) {
  console.log(req.params)
  var sql = `SELECT * FROM users WHERE id = '${req.params.id}' OR username = '${req.params.id}'`
  con.query(sql, function (err, result, fields) {
    if (err) {
      console.log(err)
      throw err
    }
    console.log(result)
    if (result && result.length > 0) {
      res.json(result[0])
    } else {
      res.SendStatus(200)
    }
  });


  app.post('/users', function (req, res) {

    if (req.body && req.body.username && req.body.first_name && req.body.last_name) {
      let sql = `INSERT INTO users (username, first_name, last_name, password)
    VALUES ("${req.body.username}", "${req.body.first_name}", "${req.body.last_name}", "${hash(req.body.password)}")`
      con.query(sql, function (err, result, fields) {
        if (err) throw err
        let user = req.body
        user.id = result.insertId
        console.log(result)
        res.json(user)
      });
    } else {
      res.sendStatus(422)
    }
  });
});

app.put('/users/:id', function (req, res) {
  //kod här för att hantera anrop…
  let sql = `UPDATE users 
  SET first_name = '${req.body.first_name}', 
    last_name = '${req.body.last_name}',
    username = '${req.body.username}',
    password = '${req.body.password}'
  WHERE id = ${req.params.id}`
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.sendStatus(200)
    //kod här för att hantera returnera data…
  });
});

app.delete('/users/:id', function (req, res) {
  let sql = `DELETE FROM users WHERE id = '${req.params.id}' OR username = '${req.params.id}'`
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.sendStatus(200)
  });
});

http.listen(port, function () {
  console.log('Server started. Listening on localhost:' + port);
});

app.post('/login', function (req, res) {
  let sql = `SELECT * FROM users WHERE username='${req.body.username}'`
  con.query(sql, function(err, result, fields) {
    if (err) throw err

    if (result && result.length > 0) {
      let passwordHash = hash(req.body.password)
      let user = result[0]

      if (user === passwordHash) {
        
        let tokenPayload = {
          sub: user.id,
          name: user.first_name
        }
        res.send(token)
      } else {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(404);
    }
  });
});