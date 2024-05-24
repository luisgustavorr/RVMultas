const pdf = require('html-pdf')
let muhammara = require('muhammara')
const fs = require("fs")

const { createReadStream, createWriteStream,writeFileSync} = require('fs');
class contratosPage {
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
    let clientes_result = await this.db.exec("SELECT id,nome FROM tb_clientes ")
    let quantidade_contrato = await this.db.exec("SELECT COUNT(id) as quantidade FROM tb_contratos ")
    let return_value = {
      "data_contarato": result,
      "quantidade_contrato": quantidade_contrato,
      "data_clientes": clientes_result,
      "id_cliente":query.cliente

    }


    return return_value
  }
  insertContrato() {
    this.app.post("/Contratos/insertContrato", async ctx => {
      let texto = ctx.request.body.text
      let nome = ctx.request.body.nome
      let insertContratoQuery = await this.db.exec(`INSERT INTO tb_contratos (id, text, nome, data_criacao,usuario_id) VALUES (NULL, ?, ?, CURRENT_DATE(),? )`, [texto, nome,this.ctx.cookies.get("id_cliente")])
      ctx.response.body = { status: 200 }
    })
  }
  insertContratoRelacionado() {
    this.app.post("/Contratos/insertContratoRelacionado", async ctx => {
      let id_cliente = ctx.request.body.id_cliente
      let id_contrato = ctx.request.body.id_contrato
      let insertContratoQuery = await this.db.exec(`INSERT INTO tb_contratos_relacionados (id, id_cliente, id_contrato,data_emissao) VALUES (NULL, ?, ?,CURRENT_DATE())`, [id_cliente, id_contrato])
      ctx.response.body = { status: 200 }
    })
  }
  updateContrato() {
    this.app.post("/Contratos/updateContrato", async ctx => {
      let texto = ctx.request.body.textz
      let nome = ctx.request.body.nome
      let id_contrato = ctx.request.body.id_contrato
      let insertContratoQuery = await this.db.exec(`UPDATE tb_contratos SET text = ?, nome = ?,data_criacao = CURRENT_DATE() WHERE id = ?`, [texto, nome, id_contrato])
      ctx.response.body = { status: 200 }
    })
  }
  deleteContrato() {
    this.app.post("/Contratos/deleteContrato", async ctx => {
      let id_contrato = ctx.request.body.id_contrato
      let insertContratoQuery = await this.db.exec(`DELETE FROM tb_contratos WHERE id = ?`, [id_contrato])
      ctx.response.body = { status: 200 }
    })
  }
  selectEmissoesContrato() {
    this.app.post("/Contratos/selectEmissoesContrato", async ctx => {
      let id_contrato = ctx.request.body.id_contrato
      let select = await this.db.exec(`SELECT tb_contratos_relacionados.id,tb_contratos_relacionados.id_contrato as id_contrato,tb_contratos.nome,tb_clientes.id as id_cliente,tb_clientes.nome as nome_cliente,tb_contratos_relacionados.data_emissao,tb_contratos_relacionados.data_assinatura FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente INNER JOIN tb_contratos ON tb_contratos.id = tb_contratos_relacionados.id_contrato WHERE tb_contratos_relacionados.id_contrato =?`, [id_contrato])
      ctx.response.body = { status: 200, array: select }
      this.generatePDF()

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
    this.app.post("/Contratos/generatePDF", async ctx => {
      let nomeContrato = ctx.request.body.nomeContrato
      let id_contrato = ctx.request.body.idContrato
      let idCliente = ctx.request.body.idCliente
      let select = await this.db.exec(`SELECT tb_clientes.id,tb_clientes.cnh, tb_clientes.nome,CURRENT_DATE() as data_atual FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente WHERE tb_contratos_relacionados.id_contrato = ? AND tb_contratos_relacionados.id_cliente = ?`, [id_contrato, idCliente])
      select = select[0]
      let html = ctx.request.body.htmlAlvo.replace(/{Nome do Cliente}/g, select.nome).replace(/{Documento Cliente}/g, select.cnh).replace(/{Data Atual}/g, this.formatarData(select.data_atual))

      const options = {
        type: 'pdf',
        format: 'A4',
        orientation: 'portrait'
      }
      let pdfBuffer = ""
      let pdfCreator = new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
          if (err) return ctx.response.body = { status: 500 }
          resolve(buffer)
          pdfBuffer = buffer
        })

      })
      await pdfCreator.then()
      ctx.response.body = pdfBuffer
      let destinationDir = `app/assets/views/uploads/contratos/cliente_${select.id}/`
      fs.rmSync(destinationDir, { recursive: true, force: true });

 
        fs.mkdirSync(destinationDir, { recursive: true });
      
      writeFileSync(`app/assets/views/uploads/contratos/cliente_${select.id}/${nomeContrato}_${select.nome}.pdf`, pdfBuffer, 'binary')
    })
  }
  async assinarPDFPOST() {
    this.app.post("/Contratos/signPDF", async ctx => {
      let nomeContrato = ctx.request.body.nomeContrato
      let id_contrato = ctx.request.body.idContrato
      let idCliente = ctx.request.body.idCliente
      let select = await this.db.exec(`SELECT tb_clientes.cpf, tb_clientes.nome,CURRENT_DATE() as data_atual FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente WHERE tb_contratos_relacionados.id_contrato = ? AND tb_contratos_relacionados.id_cliente = ?`, [id_contrato, idCliente])
      select = select[0]
      // const inputPDFPath = `app/assets/views/uploads/contratos/${nomeContrato}_${select.nome}.pdf`;
      // const signatureText = `Assinado por: ${select.nome} (${select.cpf}) \r}
      // `;

      // this.assinarPDF(inputPDFPath,inputPDFPath,"[Assinatura do Contratante]", signatureText)
      ctx.response.body = { status: 200, message: "sucesso" }

    })

  }

  assinarPDF(inputFilePath, outputFilePath, findText, replaceText) {  
    console.log(inputFilePath)
    const pdfReader = muhammara.createReader(inputFilePath);
    const pdfWriter = muhammara.createWriter(outputFilePath);

    // Iterar pelas páginas do PDF
    for (let i = 0; i < pdfReader.getPagesCount(); ++i) {
        const page = pdfReader.parsePage(i);
        const text = page.getText();

        // Substituir a palavra no texto da página
        const modifiedText = text.replace(new RegExp(findText, 'g'), replaceText);

        // Criar uma nova página com o texto modificado
        const modifiedPage = pdfWriter.createPage(page.getWidth(), page.getHeight());
        const modifiedContentContext = pdfWriter.startPageContentContext(modifiedPage);
        modifiedContentContext.writeText(modifiedText, 0, 0);
        pdfWriter.writePage(modifiedPage);
    }

    // Finalizar a escrita do PDF
    pdfWriter.end();
}



  iniciarPagina() {
    this.insertContrato()
    this.updateContrato()
    this.deleteContrato()
    this.selectEmissoesContrato()
    this.insertContratoRelacionado()
    this.assinarPDFPOST()
  }
}
module.exports = contratosPage