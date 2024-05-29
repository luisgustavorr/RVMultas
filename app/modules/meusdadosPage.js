class indexPage {
  constructor(app, db, ctx) {
    this.app = app
    this.db = db
    this.ctx = ctx
    this.iniciarPagina()
  }
  async attributes() {
    var url = require('url');
    var url_parts = url.parse(this.ctx.request.url, true);
    var query = url_parts.query;
    let result = await this.db.exec("SELECT `tb_usuarios`.*, COUNT(tb_processos.id) AS processoMes FROM `tb_usuarios` LEFT JOIN tb_processos ON tb_processos.funcionario_id = tb_usuarios.id AND MONTH(tb_processos.criacao) = MONTH(NOW()) AND YEAR(tb_processos.criacao) = YEAR(NOW()) GROUP BY tb_usuarios.id ")
    let return_value = {
      "usuarios": result,
      "id_cliente": query.cliente
    }
    return return_value
  }
  
  async insertFuncionario() {
    this.app.post(process.env.ROOT+"/MeusDados/insertFuncionario", async ctx => {

      let nome = ctx.request.body.nome
      let senha = ctx.request.body.senha
      let email = ctx.request.body.email
      let privilegio = ctx.request.body.privilegio
      let result = await this.db.exec('INSERT INTO `tb_usuarios` (`id`, `nome`, `senha`, `ultimo_acesso`, `email_recuperacao`, `privilegio`) VALUES (NULL, ?, ?, 0000-00-00, ?, ?);', [nome, senha, email, privilegio])
      ctx.response.body = { status: 200, message: "sucesso", newObject: JSON.stringify(await this.attributes()) }

    })
  }
  async updateFuncionario() {
    this.app.post(process.env.ROOT+"/MeusDados/updateFuncionario", async ctx => {

      let nome = ctx.request.body.nome
      let senha = ctx.request.body.senha
      let email = ctx.request.body.email
      let privilegio = ctx.request.body.privilegio
      let id_cliente = ctx.request.body.id_cliente
      let result = await this.db.exec('UPDATE `tb_usuarios` SET `nome` = ?, `senha` = ?, `email_recuperacao` = ?, `privilegio` = ? WHERE `tb_usuarios`.`id` = ?;', [nome, senha, email, privilegio,id_cliente])
      ctx.response.body = { status: 200, message: "sucesso", newObject: JSON.stringify(await this.attributes()) }

    })
  }
  async changeNameOrEmail(){
    this.app.post(process.env.ROOT+"/MeusDados/changeNameOrEmail", async ctx => {
      let column = ctx.request.body.column
      let value = ctx.request.body.value
      let result = await this.db.exec('UPDATE tb_usuarios SET '+column+' = ? WHERE tb_usuarios.id = ?;', [value,parseInt( this.ctx.cookies.get("id_cliente"))])
      ctx.response.body = { status: 200, message: "sucesso", newObject: JSON.stringify(await this.attributes()) }

    })
  }

  iniciarPagina() {
    this.insertFuncionario()
    this.updateFuncionario()
    this.changeNameOrEmail()
  }

}
module.exports = indexPage