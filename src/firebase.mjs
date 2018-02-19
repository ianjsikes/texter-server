import Firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyDj-Rsl-DnaqwZUeikJw2hcBGUO1FE20Do',
  authDomain: 'kenneth-texter.firebaseapp.com',
  databaseURL: 'https://kenneth-texter.firebaseio.com',
  projectId: 'kenneth-texter',
  storageBucket: '',
  messagingSenderId: '22836786973',
}

export class FirebaseService {
  constructor() {
    Firebase.initializeApp(config)
    this.db = Firebase.database()
  }

  async getAllData() {
    return new Promise((resolve, reject) => {
      this.db.ref('messages').once('value', (snapshot) => {
        resolve(snapshot.val())
      })
    })
  }

  async addIncomingMessage(message) {
    if (!message || !message.From || !message.To || !message.Body) {
      console.log('Invalid message!')
      return
    }
    const newMessageRef = this.db.ref(`messages/${message.From}`).push()
    newMessageRef.set({
      from: message.From,
      to: message.To,
      body: message.Body,
    })
  }
}
