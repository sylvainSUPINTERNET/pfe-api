var express = require('express');
var app = express();
var http = require('http').Server(app);


// TWIG CONFIGURATION
var twig = require('twig');

app.set('view engine', 'twig');
app.set("view options", {layout: false});

// This section is optional and used to configure twig.
app.set("twig options", {
    strict_variables: false
});


//Test classic view + twig render
app.get('/', function (req, res, next) {
    res.render('home', {
        message: "Hello World"
    });
});


/*
 AAAAAAAAA   PPPPPPPP    IIIIII
 AAA   AAA   PPP  PPP      II
 AAA   AAA   PPPPPPPP      II
 AAAAAAAAA   PPPP          II
 AAA   AAA   PPPP          II
 AAA   AAA   PPPP        IIIIII    */




/*-----------------------------------------------------------------------------

 //exemple test route basic + utilisation DB + TWIG


 app.get('/testApi', function (req, res, next) {
 //loadConnection();
 connection.query('SELECT * from myguests', function (err, rows, fields) {
 if (!err) {
 console.log('data from my db: ', rows);
 res.render('testapi', {
 datas: rows
 });
 } else {
 console.log('Error while performing Query.');
 next(); //force l'arrete de ce middleware
 }
 });
 //endConnection();
 });

 -----------------------------------------------------------------------------*/




//Test vrai route api avec rendu json
//test api user

//On inclut le modèle User (comprenant toutes les méthodes API se référant à la table user)
var API_user = require('./models/user');


app.get('/v1/getUser/:firstname', function (req, res, next) {
    var userToSearch = req.params.firstname; //recupere la valeur du param

    var queryResult = '';

    //Securité - check type du parameter
    if (typeof userToSearch != "string") {
        res.send("error, parameter must be a string !")
    } else {
        API_user.getUserByFirstname(userToSearch, function (data) {  // function(data) c'est la callback qui va contenir la reponse de la query
            var queryResult = data;
            res.send(queryResult);  //affiche automatiquement en JSON
        });
    }
});


http.listen(8000, function () {
    console.log('listening on *:8000');
});
