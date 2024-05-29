const pdf = require('html-pdf')
const fs = require("fs")
const { createReadStream, createWriteStream, writeFileSync } = require('fs');
class contratosPage {
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

    let result = await this.db.exec(`SELECT 
    tb_contratos.id,
    tb_contratos.nome,
    tb_contratos.text,
    tb_contratos.data_criacao,
    tb_clientes.nome as nome_cliente,

    CASE
        WHEN COUNT(tb_contratos_relacionados.id) >= 1 THEN COUNT(tb_contratos_relacionados.id)
        ELSE 0
    END AS numero_relacionamentos
FROM 
    tb_contratos 
LEFT JOIN 
    tb_contratos_relacionados ON tb_contratos.id = tb_contratos_relacionados.id_contrato
LEFT JOIN 
    tb_clientes ON tb_contratos_relacionados.id_cliente= tb_clientes.id
GROUP BY 
    tb_contratos.id

ORDER BY 
    tb_contratos.id DESC;`)
    let clientes_result = await this.db.exec("SELECT id,nome,tel FROM tb_clientes ")
    let quantidade_contrato = await this.db.exec("SELECT COUNT(id) as quantidade FROM tb_contratos ")
    let return_value = {
      "data_contarato": result,
      "quantidade_contrato": quantidade_contrato,
      "data_clientes": clientes_result,
      "id_cliente": query.cliente

    }


    return return_value
  }
  insertContrato() {
    this.app.post(process.env.ROOT+"/Contratos/insertContrato", async ctx => {
      let texto = ctx.request.body.text
      let nome = ctx.request.body.nome
      let insertContratoQuery = await this.db.exec(`INSERT INTO tb_contratos (id, text, nome, data_criacao,usuario_id) VALUES (NULL, ?, ?, CURRENT_DATE(),? )`, [texto, nome, this.ctx.cookies.get("id_cliente")])
      ctx.response.body = { status: 200 }
    })
  }
  insertContratoRelacionado() {
    this.app.post(process.env.ROOT+"/Contratos/insertContratoRelacionado", async ctx => {
      let token = ""
      let cadastrarContratoVinculado =await new Promise((resolve, reject) => {

        require('crypto').randomBytes(16, async (err, buffer) => {
          token = buffer.toString('hex');
          let id_cliente = ctx.request.body.id_cliente
          token = id_cliente.toString() + token

          let id_contrato = ctx.request.body.id_contrato
          let selectContratos = await this.db.exec(`DELETE FROM tb_contratos_relacionados WHERE id_cliente = ? AND id_contrato = ? `, [id_cliente, id_contrato])
     
            await this.db.exec(`INSERT INTO tb_contratos_relacionados (id, id_cliente, id_contrato,data_emissao,token) VALUES (NULL, ?, ?,CURRENT_DATE(),?)`, [id_cliente, id_contrato, token])
            resolve()
        

        });
      })
      return ctx.response.body = { status: 200,promisseResult:cadastrarContratoVinculado }

    })
  }
  updateContrato() {
    this.app.post(process.env.ROOT+"/Contratos/updateContrato", async ctx => {
      let texto = ctx.request.body.text
      let nome = ctx.request.body.nome
      let id_contrato = ctx.request.body.id_contrato
      let insertContratoQuery = await this.db.exec(`UPDATE tb_contratos SET text = ?, nome = ?,data_criacao = CURRENT_DATE() WHERE id = ?`, [texto, nome, id_contrato])
      ctx.response.body = { status: 200 }
    })
  }
  deleteContrato() {
    this.app.post(process.env.ROOT+"/Contratos/deleteContrato", async ctx => {
      let id_contrato = ctx.request.body.id_contrato
      let insertContratoQuery = await this.db.exec(`DELETE FROM tb_contratos WHERE id = ?`, [id_contrato])
      ctx.response.body = { status: 200 }
    })
  }
  selectEmissoesContrato() {
    this.app.post(process.env.ROOT+"/Contratos/selectEmissoesContrato", async ctx => {
      let id_contrato = ctx.request.body.id_contrato
      let select = await this.db.exec(`SELECT tb_contratos_relacionados.id,tb_contratos_relacionados.id_contrato as id_contrato,tb_contratos.nome,tb_clientes.id as id_cliente,tb_clientes.nome as nome_cliente,tb_contratos_relacionados.data_emissao,tb_contratos_relacionados.data_assinatura FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente INNER JOIN tb_contratos ON tb_contratos.id = tb_contratos_relacionados.id_contrato WHERE tb_contratos_relacionados.id_contrato =?`, [id_contrato])
      ctx.response.body = { status: 200, array: select }

    })
  }
  formatarData(target_data) {
    let data = new Date(target_data);
    let dia = data.getDate();
    let mes = data.getMonth() + 1;
    dia = dia < 10 ? '0' + dia : dia;
    mes = mes < 10 ? '0' + mes : mes;
    let ano = data.getFullYear();
    let dataFormatada = dia + '/' + mes + '/' + ano;
    return dataFormatada

  }
  async generatePDF() {
    return this.app.post(process.env.ROOT+"/Contratos/generatePDF", async ctx => {
      let nomeContrato = ctx.request.body.nomeContrato
      let id_contrato = ctx.request.body.idContrato
      let idCliente = ctx.request.body.idCliente
      console.log(`_${id_contrato}__${idCliente}_`)
      let select = await this.db.exec(`SELECT tb_clientes.id,tb_contratos.text,tb_clientes.cnh, tb_clientes.nome,CURRENT_DATE() as data_atual FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente INNER JOIN tb_contratos ON tb_contratos.id = tb_contratos_relacionados.id_contrato WHERE tb_contratos_relacionados.id_contrato = ${id_contrato} AND tb_contratos_relacionados.id_cliente = ${idCliente}`)
      select = select[0]
      console.log(select)

      let html = ctx.request.body.htmlAlvo.replace(/{Nome do Cliente}/g, select.nome).replace(/{Documento Cliente}/g, select.cnh).replace(/{Data Atual}/g, this.formatarData(select.data_atual))
      const cssFilePath = 'app/assets/views/style/styleQuill.css';
      const cssBuffer = fs.readFileSync(cssFilePath);
  
      // Converte o buffer para uma string
      const cssContent = cssBuffer.toString();
      html = html+"<style>"+cssContent+"</style>"
      const options = {
        type: 'pdf',
        format: 'A4',
        orientation: 'portrait'
      }
      let pdfBuffer = ""

      let pdfCreator = new Promise(async (resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
          if (err) return ctx.response.body = { status: 500 }
          resolve(buffer)
          pdfBuffer = buffer
        })
      //  await gerarPDF(html,`${nomeContrato}_${select.nome}`)
        // resolve()
      })
      await pdfCreator.then()
      let destinationDir = `app/assets/views/uploads/contratos/cliente_${select.id}/contrato_${id_contrato}`
      fs.rmSync(destinationDir, { recursive: true, force: true });


      fs.mkdirSync(destinationDir, { recursive: true });

      writeFileSync(`app/assets/views/uploads/contratos/cliente_${select.id}/contrato_${id_contrato}/${nomeContrato}_${select.nome}.pdf`, pdfBuffer, 'binary')
      return ctx.response.body = { status: 200, message: "sucesso" }

    })
  }

  // Caminhos para os arquivos

  // Substituir a imagem no PDF


 



  iniciarPagina() {
    this.insertContrato()
    this.updateContrato()
    this.deleteContrato()
    this.selectEmissoesContrato()
    this.insertContratoRelacionado()
    this.generatePDF()
  }
}
module.exports = contratosPage