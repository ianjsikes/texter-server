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
      statusCallback: 'https://texter-server.now.sh/twilio',
    })
  }

  async sendMessage(message, recipient) {
    const body = format(message, recipient)

    return this.client.messages.create({
      to: formatPhoneNumber(recipient.phone),
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      statusCallback: 'https://texter-server.now.sh/twilio',
      body,
    })
  }
}
