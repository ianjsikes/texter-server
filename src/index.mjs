import Koa from 'koa'

import { FirebaseService } from './firebase'

const app = new Koa()

app.use(async (ctx, next) => {
  const start = Date.now()
  console.log('started...')
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

const fb = new FirebaseService()

app.use(async (ctx) => {
  ctx.body = JSON.stringify(await fb.getAllData(), null, 2)
})
app.listen(3000)
console.log(`Server started on port ${3000}`)
