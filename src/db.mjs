import Mongo from 'mongodb'

import { hasKeys } from './util'

export const COLS = {
  campaigns: 'campaigns',
  segments: 'segments',
  members: 'members',
}

const ID = (i) => new Mongo.ObjectID(i)

export const initialize = async (callback) => {
  Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
    if (err) {
      return console.log(err)
    }

    const db = client.db('texter-db')

    await db.collection('members').createIndex({ segmentId: 1 })

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
  return coll.findOne({ _id: ID(id) })
}

export const createCampaign = async (db, campaign) => {
  const coll = db.collection(COLS.campaigns)
  return coll.insertOne({ ...campaign, segmentId: ID(campaign.segmentId) })
}

export const editCampaign = async (db, id, campaignPartial) => {
  const coll = db.collection(COLS.campaigns)
  return coll.updateOne({ _id: ID(id) }, { $set: campaignPartial })
}

export const deleteCampaign = async (db, id) => {
  const coll = db.collection(COLS.campaigns)
  return coll.deleteOne({ _id: ID(id) })
}

/**
 * SEGMENTS
 */

export const getAllSegments = async (db) => {
  const coll = db.collection(COLS.segments)
  return coll.find().toArray()
}

export const getSegment = async (db, id) => {
  const segmentsCol = db.collection(COLS.segments)
  const membersCol = db.collection(COLS.members)

  const metadata = await segmentsCol.findOne({ _id: ID(id) })
  const members = await membersCol.find({ segmentId: ID(id) }).toArray()

  return { ...metadata, members }
}

export const createSegment = async (db, segment) => {
  const coll = db.collection(COLS.segments)
  const { insertedId } = await coll.insertOne({ name: segment.name })

  const taggedMembers = segment.members.map((member) => ({
    ...member,
    segmentId: ID(insertedId),
  }))

  await db.collection(COLS.members).insertMany(taggedMembers)
  return
}

export const editSegment = async (db, id, segmentPartial) => {
  const coll = db.collection(COLS.segments)
  return coll.updateOne({ _id: ID(id) }, { $set: segmentPartial })
}

export const deleteSegment = async (db, id) => {
  const coll = db.collection(COLS.segments)
  await coll.deleteOne({ _id: ID(id) })
  await db.collection(COLS.members).deleteMany({ segmentId: ID(id) })
  return
}

/**
 * MEMBERS
 */

export const getAllMembers = async (db, segId) => {
  const coll = db.collection(COLS.members)
  return coll.find({ segmentId: ID(segId) }).toArray()
}

export const getMember = async (db, segId, id) => {
  const coll = db.collection(COLS.members)
  return coll.findOne({ _id: ID(id), segmentId: ID(segId) })
}

export const createMember = async (db, segId, member) => {
  const coll = db.collection(COLS.members)
  return coll.insertOne({ ...member, segmentId: ID(segId) })
}

export const editMember = async (db, segId, id, memberPartial) => {
  const coll = db.collection(COLS.members)
  return coll.updateOne({ _id: ID(id), segmentId: ID(segId) }, { $set: memberPartial })
}

export const deleteMember = async (db, segId, id) => {
  const coll = db.collection(COLS.members)
  return coll.deleteOne({ _id: ID(id), segmentId: ID(segId) })
}
