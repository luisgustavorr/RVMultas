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
      "id_cliente":query.cliente
    }
    return return_value

  }
  selectCliente() {
    this.app.post(process.env.ROOT+"/LoginCliente/selectCliente", async ctx => {
      let cpf = ctx.request.body.cpf
      let select_cliente = await this.db.exec('SELECT id FROM tb_clientes WHERE cpf = ?', [cpf])
      ctx.response.body = { status: 200, message: "sucesso", cliente: select_cliente[0] }
    })
  }

  iniciarPagina() {

    this.selectCliente()

  }
}
module.exports = indexPage
