'use strict';


//Config MYSQL - connection db
var db = require('../db_config/config'); //recupère la classe Db() donnant access a tous les elemnt de config tel que connection etc


//Toutes les méthodes de query / insert / delete / update  concernant les utilisateur call sur les routes sur app.js
var User = function () {
}; //class User

// GET
//getUserByFirstname


//callback to get data from query
function getQueryResult(){

}


User.prototype.getUserByFirstname = function (userToSearch,callback) {  //callback indique que l'on va mettre en parametre une fonction pour recupéré les donnée
    var connection = db.dbConnection(); //recupere la connection à la db créer dans config_db
    connection.query("SELECT * from myguests where myguests.firstname = '" + userToSearch + "'", function (err, rows, fields, next) {
        if(err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows); // results are coming here.
        return callback(rows);
    });

};

//TO DO
//Other method for USER API . . .

module.exports = new User();

