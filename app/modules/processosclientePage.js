const fs = require("fs")
var url = require('url')
const path = require("path")

const { PDFDocument } = require('pdf-lib');
class indexPage {
  constructor(app, db, ctx) {
    this.app = app
    this.db = db
    this.ctx = ctx
    this.iniciarPagina()
  }
  async attributes() {

    let metricas = await this.db.exec('SELECT COUNT(tb_processos.id) as quantidade,tb_status.nome  as status FROM tb_processos INNER JOIN tb_status ON tb_status.id = tb_processos.status  ORDER BY tb_processos.id ASC')
    let infoCliente = await this.db.exec('SELECT tb_clientes.tel,tb_clientes.cpf,tb_clientes.nome,tb_clientes.id,JSON_ARRAYAGG(tb_imagens_clientes.path) AS caminhos FROM tb_clientes LEFT JOIN tb_imagens_clientes ON tb_imagens_clientes.cliente_id = tb_clientes.id WHERE tb_clientes.id = ?', [this.ctx.cookies.get("id_cliente")])

    let result = await this.db.exec("SELECT tb_processos.nome_processo,tb_processos.id,tb_processos.atualizacao,tb_processos.placa_carro,tb_status.nome FROM `tb_clientes` INNER JOIN tb_processos_relacionados ON tb_clientes.id = tb_processos_relacionados.id_cliente INNER JOIN tb_processos ON  tb_processos.id = tb_processos_relacionados.id_processo INNER JOIN tb_status ON tb_processos.status = tb_status.id WHERE tb_clientes.id = ?", [this.ctx.cookies.get("id_cliente")])
    let return_value = {
      "processos": result,
      "metricas": metricas[parseInt(metricas.length )- 1],
      "id_cliente": this.ctx.cookies.get("id_cliente"),
      "cliente": infoCliente[0]

    }
    return return_value
  }

  selectContratosPendentes(){
    this.app.post(process.env.ROOT+"/ProcessosCliente/selectContratosPendentes", async ctx => {
      
      let selectContratos = await this.db.exec('SELECT * FROM `tb_contratos_relacionados` WHERE id_cliente = ? AND data_assinatura = 0000-00-00 LIMIT 1', [this.ctx.cookies.get("id_cliente")])
      console.log(selectContratos)
     
      return ctx.response.body = { status: 200, message: "sucesso",contratos :selectContratos[0] }

    })
  }
  selectProcesso() {
    this.app.post(process.env.ROOT+"/ProcessosCliente/selectProcesso", async ctx => {
      let idProcesso = ctx.request.body.idProcesso
      let select_processos = await this.db.exec('SELECT tb_status.nome as status_nome,tb_status.cor,tb_processos.*,tb_processos_relacionados.id_cliente,JSON_ARRAYAGG(CONCAT(tb_imagens_processos.path,"|^|^|",tb_imagens_processos.row))AS arquivos_processos FROM tb_processos LEFT JOIN tb_processos_relacionados ON tb_processos_relacionados.id_processo = tb_processos.id LEFT JOIN tb_imagens_processos ON tb_imagens_processos.id_processo = tb_processos_relacionados.id_processo INNER JOIN tb_status ON tb_status.id = tb_processos.status WHERE tb_processos.id= ?', [idProcesso])
      ctx.response.body = { status: 200, message: "sucesso", processo: select_processos[0] }
    })
  }
  async signContrato() {
    this.app.post(process.env.ROOT+"/ProcessosCliente/selectProcesso", async ctx => {

      let id_contrato = 24
      let id_cliente = 15
      let SELECTHTML = await this.db.exec(`SELECT text FROM tb_contratos WHERE id = ?`, [id_contrato])
      let select = await this.db.exec(`SELECT tb_clientes.id,tb_clientes.cnh, tb_clientes.nome,CURRENT_DATE() as data_atual FROM tb_contratos_relacionados INNER JOIN tb_clientes ON tb_clientes.id = tb_contratos_relacionados.id_cliente WHERE tb_contratos_relacionados.id_contrato = ? AND tb_contratos_relacionados.id_cliente = ?`, [id_contrato, id_cliente])
      select = select[0]
      let assinatura = select.nome
      if (fs.existsSync(`app/assets/views/uploads/assinaturas/cliente_${id_cliente}/canvas_image.png`)) {
        assinatura = `<img width="300px" height="150px" src="http:\/\/localhost:3000\/uploads/assinaturas/cliente_${id_cliente}/canvas_image.png">`
      }

      let html = SELECTHTML[0]["text"].replace(/<img src="http:\/\/localhost:3000\/images\/signature.png">/g, assinatura).replace(/{Nome do Cliente}/g, select.nome).replace(/{Documento Cliente}/g, select.cnh).replace(/{Data Atual}/g, this.formatarData(select.data_atual))
      console.log(html)
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
        })

      })
      await pdfCreator.then()
      let destinationDir = `app/assets/views/uploads/contratos/cliente_${id_cliente}/contrato_${id_contrato}`
      fs.rmSync(destinationDir, { recursive: true, force: true });


      fs.mkdirSync(destinationDir, { recursive: true });

      writeFileSync(`app/assets/views/uploads/contratos/cliente_${id_cliente}/contrato_${id_contrato}/${"teste"}_${"teste"}.pdf`, pdfBuffer, 'binary')
    })
  }

  async saveAssinatura() {
    this.app.post(process.env.ROOT+"/ProcessosCliente/saveAssinatura", async ctx => {

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
        console.log(file)
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
    this.selectProcesso()
    this.saveAssinatura()
    this.selectContratosPendentes()
  }

}
module.exports = indexPage