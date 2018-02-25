"use strict";

const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.static('public'));
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
const ObjectID = require('mongodb').ObjectID;

const peupler = require("./mes_modules/peupler");
//const tableau = require('./tableau');

/* on associe le moteur de vue au module «ejs» */
app.set('view engine', 'ejs'); // générateur de template

let db // variable qui contiendra le lien sur la BD
MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresse', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresse')
// lancement du serveur Express sur le port 8081
 app.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})

app.get('/', (req, res) => {
 console.log('la route route get / = ' + req.url)
 
 var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)
 // transfert du contenu vers la vue index.ejs (renders)
 // affiche le contenu de la BD
 res.render('accueil.ejs')
 }) 
})

app.get('/vider', (req, res) => {
	db.collection('adresse').remove({}, (err, resultat) => {
		if (err) return console.log(err)
		 	res.redirect("/adresse")
		
	})
})

app.get('/adresse', (req, res) => {
 console.log('la route route get / = ' + req.url)
 
 var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)
 // transfert du contenu vers la vue index.ejs (renders)
 // affiche le contenu de la BD
 res.render('adresse.ejs', {adresse: resultat})
 }) 
})

app.post('/ajouter', (req, res) => {
	console.log(req.body._id)
	if(req.body._id ==""){
		console.log("nouveau");
		let objet ={
			nom:req.body.nom,
			prenom:req.body.prenom,
			courriel: req.body.courriel,
			telephone:req.body.telephone
		}
		db.collection('adresse').save(objet, (err, result) => {
		if (err) return console.log(err)
			console.log('sauvegarder dans la BD')
			res.redirect('/adresse')
		})
	}else{
		console.log("modifier");
		let objet = {
			_id: ObjectID(req.body._id),
			nom:req.body.nom,
			prenom:req.body.prenom,
			courriel: req.body.courriel,
			telephone:req.body.telephone
		}
		db.collection('adresse').save(objet, (err, result) => {
		if (err) return console.log(err)
		console.log('sauvegarder dans la BD')
		res.redirect('/adresse')
	})
	}
	
})

app.get('/detruire/:id', (req, res) => {
	let id = req.params.id
	console.log(id)
	 db.collection('adresse').findOneAndDelete({"_id" :ObjectID(req.params.id)} ,(err, resultat) => {
	 if (err) return res.send(500, err)
		if (err) return console.log(err)
		 	res.redirect("/adresse")
	}) 
})

app.post('/modifier', (req, res) => {
	console.log('req.body' + req.body)
	if (req.body['_id'] != " ") { 
		console.log('sauvegarde') 
		var oModif = {
			"_id": ObjectID(req.body['_id']), 
			nom: req.body.nom,
			prenom:req.body.prenom, 
			telephone:req.body.telephone,
			courriel:req.body.courriel
		}
		var util = require("util");
		console.log('util = ' + util.inspect(oModif));
	}
	else {
		console.log('insert')
		console.log(req.body)
		var oModif = {
			nom: req.body.nom,
			prenom:req.body.prenom, 
			telephone:req.body.telephone,
			courriel:req.body.courriel
		}
	}
})

app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle
	console.log("trier")
	let ordre = (req.params.ordre == 'asc' ? 1:-1)
	let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){
		ordre = (req.params.ordre == 'asc' ? "desc":"asc")
 		res.render('adresse.ejs', {adresse: resultat, cle, ordre})
 	})
})

app.get('/peupler', (req,res) =>{
	//res.resultat = peupler_bd()
	console.log('peupler')
	let tab = peupler();
	//console.log(tab)
	for(let i=0; i<10; i++) {
		let tabTemp = tab[i];
		let personne = {
			nom:tab[i][0],
			prenom:tab[i][1],
			telephone:tab[i][2],
			courriel:tab[i][3]
		}
		console.log(personne)
		db.collection('adresse').save(personne, (err, result) => {
		if (err) return console.log(err)
			console.log('sauvegarder dans la BD')
		})
	}
	res.redirect('/adresse')
})

app.post('/rechercher', (req, res) => {
	//res.resultat = peupler_bd()
	console.log('rechercher')
	var rechercher = req.body.rechercher;
	console.log(rechercher)
	let cursor = db.collection('adresse').find({
		$or: [
			{nom:{'$regex' : rechercher + '', '$options' : 'i'}},
			{prenom:{'$regex' : rechercher + '', '$options' : 'i'}},
			{telephone:{'$regex' : rechercher + '', '$options' : 'i'}},
			{courriel:{'$regex' : rechercher + '', '$options' : 'i'}}
		]
	}).toArray(function(err, resultat) {
		res.render('adresse.ejs', {adresse: resultat})
	})
})

app.get('/profil/:id', (req, res) => {
	let id = ObjectID(req.params.id)
	console.log("profil")
	let cursor = db.collection('adresse').find({"_id":id}).toArray(function(err, resultat){
 		res.render('composants/profil.ejs', {adresse: resultat})
 	})
})