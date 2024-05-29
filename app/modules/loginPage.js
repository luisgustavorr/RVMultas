const fs = require("fs")
const path = require("path")
class indexPage {
  constructor(app, db,ctx) {
    this.app = app
    this.db = db
    this.ctx = ctx
    this.iniciarPagina()
  }
  async attributes() {
    var url = require('url');
    var url_parts = url.parse(this.ctx.request.url, true);
    var query = url_parts.query;
    let return_value = {
      "id_cliente":query.cliente,
      "infos":2,
    }
    return return_value

  }
  selectCliente() {
    this.app.post(process.env.ROOT+"/Login/selectCliente", async ctx => {
      let user = ctx.request.body.user
      let senha = ctx.request.body.senha
      let select_cliente = await this.db.exec('SELECT id,privilegio FROM tb_usuarios WHERE nome = ? AND senha = ?', [user,senha])
      ctx.response.body = { status: 200, message: "sucesso", cliente: select_cliente[0] }

    })
  }
  async updateUltimoAcesso(){

    this.app.post(process.env.ROOT+"/Login/updateUltimoAcesso", async ctx => {

    let id_cliente = ctx.request.body.id_cliente

    let select_cliente = await this.db.exec('UPDATE tb_usuarios SET ultimo_acesso = NOW() WHERE id = ?', [id_cliente])
    ctx.response.body = { status: 200, message: "sucesso" }
    })
  }

  iniciarPagina() {

    this.selectCliente()
    this.updateUltimoAcesso()

  }
}
module.exports = indexPage
