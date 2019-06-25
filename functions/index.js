const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore()

exports.getQuestions = functions.https.onRequest((request, response) => {
    var stuff = [];
    return db.collection("/questions").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            stuff.push(doc.data());
        });
        return response.send(stuff);
    }).catch(e => response.send(e));
});

exports.updateUserResponse = functions.https.onRequest((request, response) => {
    if (request.data) {
        return db.collection("/userResponse").add(request.data)
            .then((d) => response.send(d.id)).catch((e) => response.send(e));
    } else {
        return response.send("no response");
    }
});

exports.updatePlayerResponse = functions.https.onRequest((request, response) => {
    if (request.data.id && request.data.name && request.data.score) {
        const respRef = db.collection('/userResponse').doc(request.data.id);
        const usrResponse = { name: request.data.name, score: request.data.score };
        return db.runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(respRef).then(doc => {
                if (!doc.data().responses) {
                    transaction.set({
                        responses: [usrResponse]
                    });
                } else {
                    const responses = doc.data().responses;
                    responses.push(usrResponse);
                    transaction.update(respRef, { responses: responses });
                }
                return doc.data().responses;
            });
        }).then(() => {
            console.log("Transaction successfully committed!");
            return response.send(200)
        }).catch((error) => {
            console.log("Transaction failed: ", error);
            return response.send(error)
        });
    } else {
        return response.send("no response");
    }
});

exports.getPlayerQuestionsAndResponses = functions.https.onRequest((request, response) => {
    if (request.id) {
        return db.collection("/userResponse").doc(request.id).get().then((doc) => {
            return response.send({ questions: doc.questions, responses: doc.responses });
        }).catch(e => response.send(e));
    } else {
        console.log('received invalid request: ' + request);
        return response.send(500);
    }
});
