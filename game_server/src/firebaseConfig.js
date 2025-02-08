const admin = require('firebase-admin');
const serviceAccount = require('./jeux-des-dieux-firebase-adminsdk-foy72-c25aeb4e27.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jeux-des-dieux.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
