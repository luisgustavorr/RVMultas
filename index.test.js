// tests/index.test.js
const Koa = require('koa');
const request = require('supertest');
const router = require('./index');
const { describe, before, after, it } = require('node:test')
const assert = require('node:assert/strict');
describe('Server Runnning', () => {
  it('should respond with 200', async () => {
    const app = new Koa();
    app.use(router.routes());
    app.use(router.allowedMethods());
    const response = await request(app.callback()).get('/Contratos');
    it("Servidor Rodou", () => {
        assert.strictEqual(response.serverError, false)
      })
  });
});