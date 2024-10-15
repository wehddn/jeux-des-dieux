const admin = require('firebase-admin');
const serviceAccount = require('./jeux-des-dieux-firebase-adminsdk-foy72-8a047523f4.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jeux-des-dieux.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
