// @ts-check

import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import Mongo from 'mongodb'
import dotenv from 'dotenv'
import cors from 'koa-cors'

import { FirebaseService } from './firebase'
import { hasKeys } from './util'
import * as DB from './db'
import { Twilio } from './twilio'

dotenv.config()
const app = new Koa()
const router = new Router()

router.post('/incoming', async (ctx, next) => {
  console.log('incoming message: ', ctx.request.body)
  console.log('body type', typeof ctx.request.body)
  await ctx.fb.addIncomingMessage(ctx.request.body)
  ctx.status = 200
})

router.get('/', async (ctx, next) => {
  ctx.body = JSON.stringify(await ctx.fb.getAllData(), null, 2)
})

/**
 * Handles twilio message status webhooks and updates the
 * corresponding message on Firebase
 */
router.post('/twilio', async (ctx, next) => {
  const message = ctx.request.body
  switch (message.MessageStatus) {
    case 'delivered':
    case 'undelivered':
    case 'failed':
      ctx.fb.setMessageStatus(message.To, message.MessageSid, message.MessageStatus)
      break
    default:
      break
  }
  ctx.status = 200
})

/**
 * =========
 * CAMPAIGNS
 * =========
 */

router.get('/campaigns', async (ctx, next) => {
  ctx.body = await ctx.database.campaign.list()
})

router.get('/campaigns/:id', async (ctx, next) => {
  ctx.body = await ctx.db.campaign.get(ctx.params.id)
})

router.post('/campaigns/:id/test', async (ctx, next) => {
  const campaign = await ctx.db.campaign.get(ctx.params.id)
  await ctx.twilio.sendMessage(campaign.message, ctx.request.body)
  ctx.status = 200
})

router.post('/campaigns/:id/launch', async (ctx, next) => {
  const sendMessage = async (ctx, message, member) => {
    const twilioResponse = await ctx.twilio.sendMessage(message, member)
    await ctx.fb.sendMessage(message, member, twilioResponse.sid)
    return
  }

  const campaign = await ctx.db.campaign.get(ctx.params.id)
  const segment = await ctx.db.segment.get(campaign.segmentId)
  const messages = segment.members.map((member) => sendMessage(ctx, campaign.message, member))

  await Promise.all(messages)
  ctx.status = 200
})

router.post('/campaigns', async (ctx, next) => {
  const body = ctx.request.body

  if (!hasKeys(['title', 'segmentId', 'message', 'sent'], body)) {
    ctx.throw(400, 'Invalid campaign object in request')
  }

  await ctx.db.campaign.create(body)
  ctx.status = 200
})

router.patch('/campaigns/:id', async (ctx, next) => {
  const id = ctx.params.id
  const body = ctx.request.body

  await ctx.db.campaign.update(id, body)
  ctx.status = 200
})

router.del('/campaigns/:id', async (ctx, next) => {
  const id = ctx.params.id

  await ctx.db.campaign.delete(id)
  ctx.status = 200
})

/**
 * SEGMENTS
 */

router.get('/segments', async (ctx, next) => {
  ctx.body = await ctx.db.segment.list()
})

router.get('/segments/:id', async (ctx, next) => {
  ctx.body = await ctx.db.segment.get(ctx.params.id)
})

router.post('/segments', async (ctx, next) => {
  const body = ctx.request.body

  if (!hasKeys(['name'], body)) {
    ctx.throw(400, 'Invalid segment object in request')
  }

  await ctx.db.segment.create(body)
  ctx.status = 200
})

router.patch('/segments/:id', async (ctx, next) => {
  const id = ctx.params.id
  const body = ctx.request.body

  await ctx.db.segment.update(id, body)
  ctx.status = 200
})

router.del('/segments/:id', async (ctx, next) => {
  const id = ctx.params.id

  await ctx.db.segment.delete(id)
  ctx.status = 200
})

/**
 * MEMBERS
 */

router.get('/segments/:segId/members', async (ctx, next) => {
  ctx.body = await ctx.db.member.list(ctx.params.segId)
})

router.get('/segments/:segId/members/:id', async (ctx, next) => {
  ctx.body = await ctx.db.member.get(ctx.params.id)
})

router.post('/segments/:segId/members', async (ctx, next) => {
  if (!hasKeys(['phone'], ctx.request.body)) {
    ctx.throw(400, 'Invalid member object in request')
  }

  await ctx.db.member.create(ctx.params.segId, ctx.request.body)
  ctx.status = 200
})

router.patch('/segments/:segId/members/:id', async (ctx, next) => {
  await ctx.db.member.update(ctx.params.id, ctx.request.body)
  ctx.status = 200
})

router.del('/segments/:segId/members/:id', async (ctx, next) => {
  await ctx.db.member.delete(ctx.params.id)
  ctx.status = 200
})

router.post('/segments/:segId/members/:id/messages', async (ctx, next) => {
  const { message } = ctx.request.body
  const member = await ctx.db.member.get(ctx.params.id)
  const { sid } = await ctx.twilio.sendMessage(message, member)
  await ctx.fb.sendMessage(message, member, sid)
  ctx.status = 200
})

app.use(cors())
app.use(bodyParser())

/**
 * Logger middleware
 */
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

app.use(router.routes()).use(router.allowedMethods())
const database = new DB.Database((db) => {
  // app.context.db = db
  app.context.db = database
  app.context.twilio = new Twilio()
  app.context.fb = new FirebaseService()
  app.listen(3000)
  console.log(`Server started on port ${3000}`)
})
