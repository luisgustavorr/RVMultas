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
    // this.assinarContrato()
  }
  async attributes() {

    let metricas = await this.db.exec('SELECT COUNT(tb_processos.id) as quantidade,tb_status.nome  as status FROM tb_processos INNER JOIN tb_status ON tb_status.id = tb_processos.status WHERE MONTH(CURRENT_DATE) = MONTH(tb_processos.criacao)  GROUP BY tb_processos.status   ORDER BY COUNT(tb_processos.id) DESC LIMIT 2;')
    let infoCliente = await this.db.exec('SELECT tb_clientes.tel,tb_clientes.cpf,tb_clientes.nome,tb_clientes.id,JSON_ARRAYAGG(tb_imagens_clientes.path) AS caminhos FROM tb_clientes LEFT JOIN tb_imagens_clientes ON tb_imagens_clientes.cliente_id = tb_clientes.id WHERE tb_clientes.id = ?', [this.ctx.cookies.get("id_cliente")])

    let result = await this.db.exec("SELECT tb_processos.nome_processo,tb_processos.id,tb_processos.atualizacao,tb_processos.placa_carro,tb_status.nome FROM `tb_clientes` INNER JOIN tb_processos_relacionados ON tb_clientes.id = tb_processos_relacionados.id_cliente INNER JOIN tb_processos ON  tb_processos.id = tb_processos_relacionados.id_processo INNER JOIN tb_status ON tb_processos.status = tb_status.id WHERE tb_clientes.id = ?", [this.ctx.cookies.get("id_cliente")])
    let return_value = {
      "processos": result,
      "metricas": metricas,
      "id_cliente": this.ctx.cookies.get("id_cliente"),
      "cliente": infoCliente[0]

    }
    return return_value
  }


  selectProcesso() {
    this.app.post("/ProcessosCliente/selectProcesso", async ctx => {
      let idProcesso = ctx.request.body.idProcesso
      let select_processos = await this.db.exec('SELECT tb_processos.*,tb_processos_relacionados.id_cliente,JSON_ARRAYAGG(CONCAT(tb_imagens_processos.path,"|^|^|",tb_imagens_processos.row))AS arquivos_processos FROM tb_processos LEFT JOIN tb_processos_relacionados ON tb_processos_relacionados.id_processo = tb_processos.id LEFT JOIN tb_imagens_processos ON tb_imagens_processos.id_processo = tb_processos_relacionados.id_processo WHERE tb_processos.id= ?', [idProcesso])
      ctx.response.body = { status: 200, message: "sucesso", processo: select_processos[0] }
    })
  }
  async assinarContrato (){
    let pathToPDF = `app/assets/views/uploads/contratos/cliente_${this.ctx.cookies.get("id_cliente")}/ContratodeTeste_Luis Editada.pdf`
    const pdfDoc = await PDFDocument.load(fs.readFileSync(pathToPDF));
    const img = await pdfDoc.embedPng(fs.readFileSync(`app/assets/views/uploads/assinaturas/cliente_${this.ctx.cookies.get("id_cliente")}/`));
    const imagePage = pdfDoc.insertPage(0);
    imagePage.drawImage(img, {
      x: 0,
      y: 0,
      width: imagePage.getWidth(),
      height: imagePage.getHeight()
    });
    const pdfBytes = await pdfDoc.save();
    const newFilePath = `${path.basename(pathToPDF, '.pdf')}-result.pdf`;
    fs.writeFileSync(newFilePath, pdfBytes);
  }
  async saveAssinatura() {
    this.app.post("/ProcessosCliente/saveAssinatura", async ctx => {

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
      ctx.response.body = { status: 200, message: "sucesso"}

    })
  }
  iniciarPagina() {
    this.selectProcesso()
    this.saveAssinatura()
  }

}
module.exports = indexPage