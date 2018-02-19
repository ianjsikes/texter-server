import twilio from 'twilio'
import format from 'string-template'

import { formatPhoneNumber } from './util'

export class Twilio {
  constructor() {
    this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  }

  async test() {
    await this.client.messages.create({
      to: '+13102372273',
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      body: 'This is a test',
      statusCallback: 'http://41cb3d19.ngrok.io/twilio',
    })
  }

  async sendMessage(message, recipient) {
    const body = format(message, recipient)

    return this.client.messages.create({
      to: formatPhoneNumber(recipient.phone),
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      statusCallback: 'http://6912ebe4.ngrok.io/twilio',
      body,
    })
  }
}
