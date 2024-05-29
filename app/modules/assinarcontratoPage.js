const pdf = require('html-pdf')
let muhammara = require('muhammara')
const Encrypter = require("./encrypter")
const fs = require("fs")
const path = require("path")
const { createReadStream, createWriteStream, writeFileSync } = require('fs');
const { PDFDocument } = require('pdf-lib');
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
    this.query = query
    let metricas = await this.db.exec('SELECT COUNT(tb_processos.id) as quantidade,tb_status.nome  as status FROM tb_processos INNER JOIN tb_status ON tb_status.id = tb_processos.status WHERE MONTH(CURRENT_DATE) = MONTH(tb_processos.criacao)  GROUP BY tb_processos.status   ORDER BY COUNT(tb_processos.id) DESC LIMIT 2;')
    let infoCliente = await this.db.exec('SELECT tb_clientes.tel,tb_clientes.cpf,tb_clientes.nome,tb_clientes.id,JSON_ARRAYAGG(tb_imagens_clientes.path) AS caminhos FROM tb_clientes LEFT JOIN tb_imagens_clientes ON tb_imagens_clientes.cliente_id = tb_clientes.id WHERE tb_clientes.id = ?', [this.query.client_id])
    let id_contrato = this.query.token
    console.log(this.query.token)

    let enc = new Encrypter("G4l01313")
    id_contrato = enc.dencrypt(id_contrato)
    console.log(id_contrato)
    let result = await this.db.exec("SELECT * FROM tb_contratos_relacionados  WHERE tb_contratos_relacionados.id_cliente = ? AND tb_contratos_relacionados.id_contrato = ?", [this.query.client_id, id_contrato])
    fs.readdir(`app/assets/views/uploads/contratos/cliente_${this.query.client_id}/contrato_${result[0].id_contrato}/`, (err, files) => {
      files.forEach(file => {
        result[0]["caminho"] = `/uploads/contratos/cliente_${this.query.client_id}/contrato_${result[0].id_contrato}/${file}`

      });
    });
    let return_value = {
      "contrato": result[0],
      "metricas": metricas,
      "id_cliente": this.query.client_id,
      "cliente": infoCliente[0]

    }
    return return_value
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
  async signContrato() {
    this.app.post(process.env.ROOT+"/AssinarContrato/assinarContrato", async ctx => {
      console.log(this.query)
      let id_contrato = this.query.token
      console.log(this.query.token)

      let enc = new Encrypter("G4l01313")
      id_contrato = await enc.dencrypt(id_contrato)
      let id_cliente = this.query.client_id
      let SELECTHTML = await this.db.exec(`SELECT text,nome FROM tb_contratos WHERE id = ?`, [id_contrato])
      console.log(SELECTHTML)
      let select = await this.db.exec(`SELECT tb_clientes.id,tb_clientes.cnh, tb_clientes.nome,tb_contratos_relacionados.data_emissao as data_atual FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente WHERE tb_contratos_relacionados.id_contrato = ? AND tb_contratos_relacionados.id_cliente = ?`, [id_contrato, id_cliente])
      select = select[0]
      let assinatura = ctx.request.body.assinatura
      if (fs.existsSync(`app/assets/views/uploads/assinaturas/cliente_${id_cliente}/canvas_image.png`)) {
        assinatura = `<img style="border-bottom:1px solid black; margin-top:20px;" width="150px" height="100px" src="http:\/\/localhost:3000\/uploads/assinaturas/cliente_${id_cliente}/canvas_image.png">`
      }

      let html = SELECTHTML[0]["text"].replace(/<img src="http:\/\/localhost:3000\/images\/signature.png">/g, assinatura).replace(/{Nome do Cliente}/g, select.nome).replace(/{Documento Cliente}/g, select.cnh).replace(/{Data Atual}/g, this.formatarData(select.data_atual))
      const cssFilePath = 'app/assets/views/style/styleQuill.css';
      const cssBuffer = fs.readFileSync(cssFilePath);
      const cssContent = cssBuffer.toString();
      html = html+"<style>"+cssContent+"</style>"
      
      const options = {
        type: 'pdf',
        format: 'A4',
        orientation: 'portrait'
      }
      let pdfBuffer = ""
      let pdfCreator = new Promise((resolve, reject) => {

        pdf.create(html, options).toBuffer((err, buffer) => {
          resolve(buffer)
          pdfBuffer = buffer
          let assinaturaPath = `app/assets/views/uploads/assinaturas/cliente_${id_cliente}/canvas_image.png`
          fs.rmSync(assinaturaPath, { recursive: true, force: true });
        })

      })
      await pdfCreator.then()
      let destinationDir = `app/assets/views/uploads/contratos/cliente_${id_cliente}/contrato_${id_contrato}`
      fs.rmSync(destinationDir, { recursive: true, force: true });


      fs.mkdirSync(destinationDir, { recursive: true });
      let updateDATAASSINATURA = await this.db.exec(`UPDATE tb_contratos_relacionados SET data_assinatura = NOW() WHERE id_contrato = ? AND id_cliente = ?`, [id_contrato, id_cliente])

      writeFileSync(`app/assets/views/uploads/contratos/cliente_${id_cliente}/contrato_${id_contrato}/${SELECTHTML[0].nome}_${select.nome}.pdf`, pdfBuffer, 'binary')

      ctx.response.body = { status: 200, message: "sucesso" }
    
    })
  }

  async saveAssinatura() {
    this.app.post(process.env.ROOT+"/AssinarContrato/saveAssinatura", async ctx => {

      let files = ctx.request.files
      Object.keys(files).forEach(element => {
        let file = files[element]
        let fileName = file.originalFilename
        let destinationDir = `app/assets/views/uploads/assinaturas/cliente_${this.ctx.cookies.get("id_cliente")}/`;
        let destinationPath = path.join(destinationDir, fileName);

        if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
        }

        const writeStream = fs.createWriteStream(destinationPath)
        writeStream.on('error', (error) => {
          console.error('Erro ao salvar o arquivo:', error);
        });
        const readStream = fs.createReadStream(file.filepath);
        readStream.pipe(writeStream);

        writeStream.on('finish', async () => {
          console.log('Arquivo salvo com sucesso.');
          writeStream.end();
        });
        //insert path in tb_imagens
      });
      ctx.response.body = { status: 200, message: "sucesso" }

    })
  }
  iniciarPagina() {
    this.saveAssinatura()
    this.signContrato()
  }

}
module.exports = indexPage