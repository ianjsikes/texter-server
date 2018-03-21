import twilio from 'twilio'
import format from 'string-template'
import phoneFormatter from 'phone-formatter'
import request from 'request'

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

  async getLogs() {
    return new Promise((resolve, reject) => {
      const dayBefore = `${new Date(Date.now() - 86400000 * 2)
        .toISOString()
        .split('.')
        .splice(0, 1)
        .join('')}-07:00`

      request(
        {
          url: `https://${process.env.TWILIO_SID}:${
            process.env.TWILIO_AUTH_TOKEN
          }@api.twilio.com/2010-04-01/Accounts/${
            process.env.TWILIO_SID
          }/Messages.csv?DateSent%3E=${encodeURIComponent(dayBefore)}`,
        },
        (error, response, body) => {
          if (error) {
            reject(error)
          }

          resolve(body)
        }
      )
    })
  }
}
