import Firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyDj-Rsl-DnaqwZUeikJw2hcBGUO1FE20Do',
  authDomain: 'kenneth-texter.firebaseapp.com',
  databaseURL: 'https://kenneth-texter.firebaseio.com',
  projectId: 'kenneth-texter',
  storageBucket: '',
  messagingSenderId: '22836786973',
}

export function FirebaseService() {
  Firebase.initializeApp(config)
  this.db = Firebase.database()
  return this
}

FirebaseService.prototype.getAllData = async function() {
  return new Promise((resolve, reject) => {
    this.db.ref('messages').once('value', (snapshot) => {
      resolve(snapshot.val())
    })
  })
}
