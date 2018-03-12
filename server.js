var express = require('express');
var morgan = require('morgan');
var path = require('path');
//const { Pool, Client } = require('pg')
var Pool= require('pg').Pool;

var config={
  user: 'jainil27',
  database: 'jainil27',
  host: 'db.imad.hasura.io',
  port: '5432',
  password: process.env.DB_PASSWORD
};

var pool = new Pool(config);

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/first', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'first.html'));
});

app.get('/first', function(req,res){
    res.send("Jainil Desai");
});

app.get('/second', function(req,res){
    res.send("Dipan Desai");
});

app.get('/third', function(req,res){
    res.send("Kavita Desai");
});

app.get('/test-db',function(req,res)
{
  //make a query
    //return a response
  pool.query('select * from test',function(err,result) 
    { 
    if(err)
        {
      res.status(500).send(err.toString());
    }
    else
        {
      res.send(JSON.stringify(result.rows)); 
    }
  });

});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
