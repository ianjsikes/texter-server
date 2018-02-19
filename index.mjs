import Koa from 'koa'

const app = new Koa()

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

app.use(async (ctx) => {
  ctx.body = 'Hello World'
})

app.listen(3000)
console.log(`Server started on port ${3000}`)
