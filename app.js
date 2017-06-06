var express = require('express');
var app = express();
var http = require('http').Server(app);
var session = require('express-session');


var path = require('path');

var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());


// TWIG CONFIGURATION
var twig = require('twig');

app.set('view engine', 'twig');
app.set("view options", {layout: false});

// This section is optional and used to configure twig.
app.set("twig options", {
    strict_variables: false
});



// ##################### ----------------------- #####################
// ##################### TOKEN / SECURITY SYSTEM #####################
// ##################### ----------------------- #####################

var security = require('./security/security');
//SECURITY token
//Creation d'une session pour stocker notre token et le vérifier sur chaque route
app.use(session({secret: 'mySecretSession'}));
var current_session;


//Verification de l'existance du token sur toutes les routes de l'api !
app.use('/api/*', function (req, res, next) {
    if (!req.session.token) {
        res.redirect('/signUp');
    } else {
        next();
    }
});


//Inscription
app.get('/signUp', function (req, res) {
    var pathCheckSignUp = '/signUp';


    res.render('registration/signUp', {
        message: "Inscription page",
        pathCheckSignUp: pathCheckSignUp
    });
});

app.post('/signUp', function (req, res, next) {

    var firstname = req.body.firstname;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    var checkSignUpMessage = security.verificationSignUp(firstname, password, confirmPassword);

    security.checkUserExist(firstname, function (data) {
        console.log(data.length);
        if (data.length == 1) {
            res.send("Firstname is already exist !");
            next();
        } else {
            if (checkSignUpMessage == "") {//pas d'erreur sur les données envoyées
                if (security.generateToken(firstname, password)) //si le token a correctemet était crée
                    var newToken = security.generateToken(firstname, password);  //c'est un objet comprenant firstname, token_str, date de creation
                security.createUser(firstname, password, newToken["token"]);
            } else {
                console.log("Erreur credentials signup ! token dosnt generate correctly !");
            }


            //get current user's token
            current_session = req.session;
            current_session.token = newToken["token"];
            console.log(current_session);

            res.send("votre token : " + newToken["token"]);

        }
    });

});

//Login
app.get('/signIn', function (req, res) {
    var pathCheckSignIn = '/signIn';

    res.render('registration/signIn', {
        message: "Login page",
        pathCheckSignIn: pathCheckSignIn
    });
});

app.post('/signIn', function (req, res) {

    var firstname = req.body.firstname;
    var password = req.body.password;


    security.loginUser(firstname, password, function (data) {  // function(data) c'est la callback qui va contenir la reponse de la query
        var queryResult = data;

        var pathCheckSignIn = '/signIn'; //twig redirection if 0 user find for the login try


        if (queryResult.length == 1) {
            req.session.token = queryResult[0].token;
            res.redirect('/api/doc');
        } else {
            res.render('registration/signIn', {
                message: "Login page",
                error:"Bad credentials",
                pathCheckSignIn: pathCheckSignIn
            });
        }
    });

});

//Logout
app.get('/signOut', function (req, res) {
    //Delete session and token + redirect to signIn page (signUp accessible + signIn);
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/signIn');
        }
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


//On inclut le modèle User (comprenant toutes les méthodes API se référant à la table user)
var API_user = require('./models/user');



//documentation
app.get('/api/doc', function (req, res, next) {
    res.render('api/api_doc', {
        message: "API Documentation"
    });
});



app.get('/api/getUser/:firstname', function (req, res, next) {
    var userToSearch = req.params.firstname; //recupere la valeur du param

    var queryResult = '';

    //Securité - check type du parameter
    if (typeof userToSearch != "string") {
        res.send("error, parameter must be a string !")
    } else {
        API_user.getUserByFirstname(userToSearch, function (data) {  // function(data) c'est la callback qui va contenir la reponse de la query
            queryResult = data;
            res.send(queryResult);  //affiche automatiquement en JSON
        });
    }
});

app.get('/api/getUsers', function (req, res, next) {
    var queryResult = '';

    API_user.getUsers(function (data) {  // function(data) c'est la callback qui va contenir la reponse de la query
        queryResult = data;
        res.send(queryResult);  //affiche automatiquement en JSON
    });
});


// ... continuer les routes api ...


http.listen(8000, function () {
    console.log('listening on *:8000');
});
