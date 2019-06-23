const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore()

exports.getQuestions = functions.https.onRequest((request, response) => {
    var stuff = [];
    db.collection("/questions").get().then((querySnapshot)=>{
        querySnapshot.forEach((doc)=> {
            stuff.push(doc.data());
        });
        return response.send(stuff);
    }).catch(e=>response.send(e));
});