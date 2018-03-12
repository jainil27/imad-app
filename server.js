var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


var config ={
  user: 'jainil27',
  database: 'jainil27',
  host: 'db.imad.hasura-app.io', 
  port: '5432', 
  password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
  secret: 'RandomSecretValue',
  cookie: {maxAge:1000*60*60*24*30}
}));

var pool = new Pool(config);

function createTemplate(data){
  var title = data.title;
  var date = data.date;
  var heading = data.heading;
  var content = data.content;
  
  var htmlTemplate = `
  <html>
  <head>
      <link href=ui/style.css rel="stylesheet"/>
          <title>
           ${title}
          </title>
      </head>
      <body>
          <div>
        <a href="/">Home</a>
      </div>
      <hr/>
      <h3>
          ${heading}
      </h3>
      <div>
          ${date.toDateString()}
      </div>
      <div>
      <p>
           ${content}
      </p>
      </div>
      </body>
  </html>
  `;
  return htmlTemplate;
}


function hash(input, salt){
  //create a hash
  var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512 , 'sha512');
  return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
  ///we are usinng pbkdf2Sync algo rather than hash function by node bcz of it's salt value
  // working: input+salt --> hash --> hase--> hased X 10000 times to give 512bytes string

}

app.get('/hash/:input', function(req, res){
  var hashedString = hash(req.params.input, 'random-salt');
  res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   // username, password
   // {"username": "mohit", "password": "password"}
   // JSON
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username+' ');
      }
   });
});


app.post('/login', function(req,res){
  //login
  var username = req.body.username;
   var password = req.body.password;
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if(result.rows.length === 0){
            res.status(403).send("username/password is invalid");
          } 
          else{
              //match password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
             //Creating a password with salt and submitted password to match it with stored in database
              var hashedPassword = hash(password, salt); 
              if(hashedPassword === dbString){

                //make a sessio here
                req.session.auth = {userid: result.rows[0].id};
                //set cookie with a session id
                // internally it maps a session id with an object 'auth' onn the server
                // {auth:{userid}}

                res.send("User successfully Logged in "); //credentials correct
              }
              else{
                res.status(403).send("username/password is invalid");
              }
          }
      }
   });
});

app.get('/check-login', function(req,res){
  if (req.session && req.session.auth && req.session.auth.userid){
    res.send("You are logger in as "+ req.session.auth.userid.toString());
  }
  else{
    res.send(" You are not logged in");
  }
});

app.get('/logout', function(req,res){
  delete req.session.auth;
  res.send("Logged out Succesfully");
});

var counter=0;
app.get('/counter', function (req, res) {
  counter+=1;
  res.send(counter.toString());
});

// we have put the code of names here since article was executing first
 var names= [];
 app.get('/submit-name', function (req, res) { //url: submit-name?query regarding name
   var name = req.query.name; //also provided by xpress framework
   names.push(name);
   //JSON 
   res.send(JSON.stringify(names));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
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

app.get('/articles/:articleName', function (req, res){
 //aticleName == article-one
 //(articles[articleName]) == thw {} object of article one
 
/*to prevent sql injection as a user can do /articles/'; delete from articl where 'a'='a or any query like that we use libary funtion to use parameter inside the query
old code:  pool.query("select * from article where title='"+req.params.articleName+"'", function(err,result){  we pass parameter as an array as asecond argument */

 pool.query("select * from article where title=$1",[req.params.articleName], function(err,result){
  if(err){
    res.status(500).send(err.toString());
  }
  else{
    if(result.rows.length === 0){
      res.status(404).send('Article not found');
    }
    else{
        var articleData=result.rows[0]; 
        res.send(createTemplate(articleData)) ; 
    }
  }
 });
 });
 

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  //res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


/*
// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log('IMAD course app listening on port ${port}!');
});
*/