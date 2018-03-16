import * as DB from './db'
import phoneFormatter from 'phone-formatter'
import dotenv from 'dotenv'

dotenv.config()

const db = new DB.Database(async (_) => {
  const allMembers = await db.member.listAll()

  let numMembers = 0
  for (const member of allMembers) {
    await db.member.update(member._id, {
      ...member,
      phone: phoneFormatter.normalize(member.phone),
    })
    numMembers++
  }

  console.log(`Done. Formatted ${numMembers} members.`)
})
