// @ts-check

import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import Mongo from 'mongodb'

import { FirebaseService } from './firebase'
import { hasKeys } from './util'
import * as DB from './db'

const app = new Koa()
const router = new Router()
const fb = new FirebaseService()

router.post('/incoming', async (ctx, next) => {
  console.log('incoming message: ', ctx.request.body)
  console.log('body type', typeof ctx.request.body)
  await fb.addIncomingMessage(ctx.request.body)
  ctx.status = 200
})

router.get('/', async (ctx, next) => {
  ctx.body = JSON.stringify(await fb.getAllData(), null, 2)
})

/**
 * CAMPAIGNS
 */

router.get('/campaigns', async (ctx, next) => {
  ctx.body = await DB.getAllCampaigns(ctx.db)
})

router.get('/campaigns/:id', async (ctx, next) => {
  ctx.body = await DB.getCampaign(ctx.db, ctx.params.id)
})

router.post('/campaigns', async (ctx, next) => {
  const body = ctx.request.body

  if (!hasKeys(['title', 'segmentId', 'message', 'sent'], body)) {
    ctx.throw(400, 'Invalid campaign object in request')
  }

  await DB.createCampaign(ctx.db, body)
  ctx.status = 200
})

router.patch('/campaigns/:id', async (ctx, next) => {
  const id = ctx.params.id
  const body = ctx.request.body

  await DB.editCampaign(ctx.db, id, body)
  ctx.status = 200
})

router.del('/campaigns/:id', async (ctx, next) => {
  const id = ctx.params.id

  await DB.deleteCampaign(ctx.db, id)
  ctx.status = 200
})

/**
 * SEGMENTS
 */

router.get('/segments', async (ctx, next) => {
  ctx.body = await DB.getAllSegments(ctx.db)
})

router.get('/segments/:id', async (ctx, next) => {
  ctx.body = await DB.getSegment(ctx.db, ctx.params.id)
})

router.post('/segments', async (ctx, next) => {
  const body = ctx.request.body

  if (!hasKeys(['name'], body)) {
    ctx.throw(400, 'Invalid segment object in request')
  }

  await DB.createSegment(ctx.db, body)
  ctx.status = 200
})

router.patch('/segments/:id', async (ctx, next) => {
  const id = ctx.params.id
  const body = ctx.request.body

  await DB.editSegment(ctx.db, id, body)
  ctx.status = 200
})

router.del('/segments/:id', async (ctx, next) => {
  const id = ctx.params.id

  await DB.deleteSegment(ctx.db, id)
  ctx.status = 200
})

/**
 * MEMBERS
 */

router.get('/segments/:segId/members', async (ctx, next) => {
  ctx.body = await DB.getAllMembers(ctx.db, ctx.params.segId)
})

router.get('/segments/:segId/members/:id', async (ctx, next) => {
  ctx.body = await DB.getMember(ctx.db, ctx.params.segId, ctx.params.id)
})

router.post('/segments/:segId/members', async (ctx, next) => {
  if (!hasKeys(['phone'], ctx.request.body)) {
    ctx.throw(400, 'Invalid member object in request')
  }

  await DB.createMember(ctx.db, ctx.params.segId, ctx.request.body)
  ctx.status = 200
})

router.patch('/segments/:segId/members/:id', async (ctx, next) => {
  await DB.editMember(ctx.db, ctx.params.segId, ctx.params.id, ctx.request.body)
  ctx.status = 200
})

router.del('/segments/:segId/members/:id', async (ctx, next) => {
  await DB.deleteMember(ctx.db, ctx.params.segId, ctx.params.id)
  ctx.status = 200
})

app.use(bodyParser())

/**
 * Logger middleware
 */
app.use(async (ctx, next) => {
  const start = Date.now()
  console.log('started...')
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

app.use(router.routes()).use(router.allowedMethods())
DB.initialize((db) => {
  app.context.db = db
  app.listen(3000)
  console.log(`Server started on port ${3000}`)
})
