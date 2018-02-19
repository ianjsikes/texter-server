import Mongo from 'mongodb'
import dotenv from 'dotenv'

import { hasKeys } from './util'

dotenv.config()

export const COLS = {
  campaigns: 'campaigns',
  segments: 'segments',
  segment: (id) => `segment-${id}`,
}

export const initialize = async (callback) => {
  Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
    if (err) {
      return console.log(err)
    }

    const db = client.db('texter-db')

    // db.createCollection(COLS.campaigns, {
    //   validator: {
    //     $jsonSchema: {
    //       bsonType: 'object',
    //       required: ['title', 'segmentId', 'message', 'sent'],
    //       minProperties: 4,
    //       properties: {
    //         title: {
    //           bsonType: 'string',
    //           description: 'must be a string and is required',
    //         },
    //         segmentId: {
    //           bsonType: 'string',
    //           description: 'must be a string and is required',
    //         },
    //         message: {
    //           bsonType: 'string',
    //           description: 'must be a string and is required',
    //         },
    //         sent: {
    //           bsonType: 'bool',
    //           description: 'must be a boolean and is required',
    //         },
    //       },
    //     },
    //   },
    // })

    callback(db)
  })
}

/**
 * CAMPAIGNS
 */

export const getAllCampaigns = async (db) => {
  const coll = db.collection(COLS.campaigns)
  return coll.find().toArray()
}

export const getCampaign = async (db, id) => {
  const coll = db.collection(COLS.campaigns)
  return coll.findOne({ _id: new Mongo.ObjectID(id) })
}

export const createCampaign = async (db, campaign) => {
  const coll = db.collection(COLS.campaigns)
  return coll.insertOne(campaign)
}

export const editCampaign = async (db, id, campaignPartial) => {
  const coll = db.collection(COLS.campaigns)
  return coll.updateOne({ _id: new Mongo.ObjectID(id) }, { $set: campaignPartial })
}

export const deleteCampaign = async (db, id) => {
  const coll = db.collection(COLS.campaigns)
  return coll.deleteOne({ _id: new Mongo.ObjectID(id) })
}

/**
 * SEGMENTS
 */

export const getAllSegments = async (db) => {
  const coll = db.collection(COLS.segments)
  return coll.find().toArray()
}

export const getSegment = async (db, id) => {
  const segments = db.collection(COLS.segments)
  const segment = db.collection(COLS.segment(id))

  const metadata = await segments.findOne({ _id: new Mongo.ObjectID(id) })
  const members = await segment.find().toArray()

  return { ...metadata, members }
}

export const createSegment = async (db, segment) => {
  const coll = db.collection(COLS.segments)
  const { insertedId } = await coll.insertOne({ name: segment.name })

  await db.collection(COLS.segment(insertedId)).insertMany(segment.members)
  return
}

export const editSegment = async (db, id, segmentPartial) => {
  const coll = db.collection(COLS.segments)
  return coll.updateOne({ _id: new Mongo.ObjectID(id) }, { $set: segmentPartial })
}

export const deleteSegment = async (db, id) => {
  const coll = db.collection(COLS.segments)
  await coll.deleteOne({ _id: new Mongo.ObjectID(id) })
  await db.collection(COLS.segment(id)).drop()
  return
}

/**
 * MEMBERS
 */

export const getAllMembers = async (db, segId) => {
  const coll = db.collection(COLS.segment(segId))
  return coll.find().toArray()
}

export const getMember = async (db, segId, id) => {
  const coll = db.collection(COLS.segment(segId))
  return coll.findOne({ _id: new Mongo.ObjectID(id) })
}

export const createMember = async (db, segId, member) => {
  const coll = db.collection(COLS.segment(segId))
  return coll.insertOne(member)
}

export const editMember = async (db, segId, id, memberPartial) => {
  const coll = db.collection(COLS.segment(segId))
  return coll.updateOne({ _id: new Mongo.ObjectID(id) }, { $set: memberPartial })
}

export const deleteMember = async (db, segId, id) => {
  const coll = db.collection(COLS.segment(segId))
  return coll.deleteOne({ _id: new Mongo.ObjectID(id) })
}
