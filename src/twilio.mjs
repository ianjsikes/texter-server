import twilio from 'twilio'
import format from 'string-template'
import phoneFormatter from 'phone-formatter'

export class Twilio {
  constructor() {
    this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  }

  async sendMessage(message, recipient) {
    const body = format(message, recipient)

    return this.client.messages.create({
      to: phoneFormatter.format(recipient.phone, '+1NNNNNNNNNN'),
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      statusCallback: 'https://texter-server.now.sh/twilio',
      body,
    })
  }
}
