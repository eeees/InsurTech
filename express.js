const express = require('express');
const request = require("request");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
var jwt = require('jsonwebtoken');
var auth = require('./lib/auth');

var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "192.168.30.49",
    user: "team4",
    password: "team4",
    database: "team4",
  });
connection.connect();

/*
let DrugrunPy = new Promise(function(success, nosuccess) {
  const { spawn } = require('child_process');
  const pyprog = spawn('python', ['./Drug.py']);
  pyprog.stdout.on('data', function(data){
    success(data);
  });
  pyprog.stderr.on('data', (data)=> {
    nosuccess(data);
  });
});

let PayrunPy = new Promise(function(success, nosuccess) {

  const { spawn } = require('child_process');
  const pyprog = spawn('python', ['./Pay.py']);
  pyprog.stdout.on('data', function(data){
    success(data);
  });
  pyprog.stderr.on('data', (data)=> {
    nosuccess(data);
  });
});

let InspectionrunPy = new Promise(function(success, nosuccess) {

  const { spawn } = require('child_process');
  const pyprog = spawn('python', ['./Inspection.py']);
  pyprog.stdout.on('data', function(data){
    success(data);
  });
  pyprog.stderr.on('data', (data)=> {
    nosuccess(data);
  });
});
*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
//login session settings
app.use(cookieParser());
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

app.set('views', __dirname + '/views');
app.set('view engine','ejs');
////////////////////////////////////////////////////
app.get('/pay', (req, res)=>{
  PayrunPy.then(function(fromPayRunpy){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    console.log(fromPayRunpy);
    res.end(fromPayRunpy);
  });
})

app.get('/drug', (req, res)=>{
  DrugrunPy.then(function(fromDrugRunpy){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    console.log(fromDrugRunpy);
    res.end(fromDrugRunpy);
  });
})

app.get('/inspection', (req, res)=>{
  InspectionrunPy.then(function(fromInspectionRunpy){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    console.log(fromInspectionRunpy);
    res.end(fromInspectionRunpy);
  });
})

app.get('/', function(req, res) {
    res.render('index');
})

app.get('/index', function(req,res){
    res.render('index');
});

app.get('/login', function(req,res){
    //res.render('login');
    let session = req.session;

    res.render('login', {
        session : session
    });
});

app.get('/register', function(req,res){
    res.render('register');
});

app.get('/result', function(req,res){
    res.render('result');
});

app.get('/receipt', function(req,res){
    res.render('receipt');
});

app.get('/accountCheck', function(req,res){
    res.render('accountCheck');
});

app.get('/privacy', function(req, res) {
    res.render('privacy');
});

app.get('/selling', function(req, res) {
    res.render('selling');
});

app.get('/check', function(req, res) {
    res.render('check');
});

app.get('/authTest', auth ,function(req, res){
  console.log(req.decoded);
  //토큰에 있는 데이터 확인
  res.json("로그인 성공! / 컨텐츠를 볼 수 있습니다.")
})

app.post('/register', function(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var bank = req.body.bank;
    var account = req.body.account;

    var userInsertSql = "INSERT INTO user (`username`, `email`, `password`, `bank`, `account`) VALUES (?, ?, ?, ?, ?);";

    connection.query(userInsertSql, [username, email, password, bank, account], function (error, results, fields) {
        if (error) throw error;
        else {
            res.json(1);
        }
    });
    console.log(req.body);
});

app.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    var userCheckSql = "SELECT * FROM user WHERE email=?"
    connection.query(userCheckSql, [email], function (error, results, fields) {
        if (error) throw error;
        else {
          if(results.length == 0) {
              console.log("아이디나 비밀번호가 틀렸습니다.");
              res.json(2);
          }
          else {
            var storedPassword = results[0].password;
            if(password == storedPassword){
              var tokenKey = "fintech1234!" // 토큰키 추가
              jwt.sign(
                {
                  userId: results[0].user_id,
                  userEmail: results[0].email,
                },
                tokenKey,
                {
                  expiresIn: "7d",
                  issuer: "fintech.admin",
                  subject: "user.login.info",
                },
                function (err, token) {
                  console.log("로그인 성공", token);
                  var userData = {
                    userId : results[0].user_id,
                    token : token
                  }
                  res.json(userData);
                }
              );
            }
            else {
              //로그인 불가
              res.json(2);
            }
          }
        }
     });
});

app.post('/result', function(req, res) {
  var user_id = req.body.userId;
  var ins1 = req.body.ins1;
  var ins2 = req.body.ins2;
  var ins3 = req.body.ins3;
  var ins4 = req.body.ins4;
  var ins5 = req.body.ins5;
  var ins6 = req.body.ins6;

  var insInsertSql = "INSERT INTO institution (`user_id`, `seoul_univ_hospital`, `severance_hospital`, `seoul_samsung_hospital`, `samsung_biologics`, `celltrion`, `sk_biopharm`) VALUES (?, ?, ?, ?, ?, ?);";

    connection.query(insInsertSql, [user_id, ins1, ins2, ins3, ins4, ins5, ins6], function (error, results, fields) {
        if (error) throw error;
        else {
            res.json(1);
            res.render('result');
        }
    });

  console.log(req.body);
});

app.listen(3000);