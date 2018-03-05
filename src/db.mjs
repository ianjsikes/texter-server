// @ts-check
import Mongo from 'mongodb'

import { hasKeys } from './util'

export const COLS = {
  campaigns: 'campaigns',
  segments: 'segments',
  members: 'members',
}

const ID = (i) => new Mongo.ObjectID(i)

export class Database {
  constructor(callback) {
    Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
      if (err) {
        return console.log(err)
      }

      this.db = client.db('texter-db')

      this.campaign = new Campaign(this.db)
      this.member = new Member(this.db)
      this.segment = new Segment(this.db, this.member)

      await this.db.collection('members').createIndex({ segmentId: 1 })

      callback(this.db)
    })
  }
}

export const initialize = async (callback) => {
  Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
    if (err) {
      return console.log(err)
    }

    const db = client.db('texter-db')

    await db.collection('members').createIndex({ segmentId: 1 })

    callback(db)
  })
}

class Campaign {
  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.campaigns)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async create(data) {
    return this.collection.insertOne({ ...data, segmentId: ID(data.segmentId) })
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async delete(id) {
    return this.collection.deleteOne({ _id: ID(id) })
  }
}

/**
 * SEGMENTS
 */

class Segment {
  constructor(db, member) {
    this.db = db
    this.member = member
    this.collection = this.db.collection(COLS.segments)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    const metadata = await this.collection.findOne({ _id: ID(id) })
    const members = await this.member.list(id)
    return { ...metadata, members }
  }

  async create(data) {
    const { insertedId } = await this.collection.insertOne({ name: data.name })

    return this.member.createMany(insertedId, data.members)
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async delete(id) {
    await this.collection.deleteOne({ _id: ID(id) })
    await this.member.deleteMany(id)
    return
  }
}

/**
 * MEMBERS
 */

class Member {
  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.members)
  }

  async list(segmentId) {
    return this.collection.find({ segmentId: ID(segmentId) }).toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async getByPhone(phone) {
    return this.collection.findOne({ phone })
  }

  async create(segmentId, data) {
    const { insertedId } = this.collection.insertOne({ ...data, segmentId: ID(segmentId) })
    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async createMany(segmentId, members) {
    const taggedMembers = members.map((member) => ({
      ...member,
      segmentId: ID(segmentId),
    }))

    return this.collection.insertMany(taggedMembers)
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async delete(id) {
    return this.collection.deleteOne({ _id: ID(id) })
  }
}
