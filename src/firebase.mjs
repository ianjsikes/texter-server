import Firebase from 'firebase'
import format from 'string-template'

import { formatPhoneNumber } from './util'

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
    console.log('MESSAGE', message)
    if (!message || !message.From || !message.To || !message.Body) {
      console.log('Invalid message!')
      return
    }
    await this.db.ref(`messages/${message.From}/${message.MessageSid}`).set({
      from: message.From,
      to: message.To,
      body: message.Body,
    })
  }

  async sendMessage(message, recipient, sid) {
    await this.db.ref(`messages/${formatPhoneNumber(recipient.phone)}/${sid}`).set({
      to: recipient.phone,
      body: format(message, recipient),
    })
  }

  async setMessageStatus(phone, sid, status) {
    await this.db.ref(`messages/${formatPhoneNumber(phone)}/${sid}`).update({ status })
  }
}
