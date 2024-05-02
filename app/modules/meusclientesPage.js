const fs = require("fs")
const path = require("path")
class indexPage {
  constructor(app, db) {
    this.app = app
    this.db = db
    this.iniciarPagina()
  }
  async attributes() {
    let metricas = await this.db.exec('SELECT COUNT(tb_processos.id) as quantidade,tb_status.nome  as status FROM tb_processos INNER JOIN tb_status ON tb_status.id = tb_processos.status WHERE MONTH(CURRENT_DATE) = MONTH(tb_processos.criacao)  GROUP BY tb_processos.status   ORDER BY COUNT(tb_processos.id) DESC LIMIT 2;')

    let result = await this.db.exec("SELECT tb_clientes.id,tb_clientes.vencimento_cnh as vencimento_cnh,tb_clientes.nome,tb_clientes.cnh,COUNT(tb_processos_relacionados.id) as numero_processos FROM `tb_clientes` LEFT JOIN tb_processos_relacionados ON tb_processos_relacionados.id_cliente = tb_clientes.id GROUP BY tb_clientes.id;")
    let return_value = {
      "clientes": result,
      "metricas": metricas,

    }
    return return_value
  }
  async selectCliente() {
    this.app.post("/MeusClientes/selectCliente", async ctx => {

    let idCliente = ctx.request.body.idCliente

    let result = await this.db.exec('SELECT `tb_clientes`.*, JSON_ARRAYAGG(tb_imagens_clientes.path) as caminhos FROM `tb_clientes` LEFT JOIN tb_imagens_clientes ON tb_imagens_clientes.cliente_id = tb_clientes.id WHERE tb_clientes.id = ? GROUP BY tb_clientes.id;',[idCliente])
    ctx.response.body = { status: 200, message: "sucesso",cliente:result[0]}
    return result

    })
  }
  async insertCliente() {
    this.app.post("/MeusClientes/insertCliente", async ctx => {

      let files = ctx.request.files
      console.log(files)
      let nome_cliente = ctx.request.body.nome_cliente
      let tel_cliente = ctx.request.body.tel_cliente
      let email_cliente = ctx.request.body.email_cliente
      let cpf_cliente = ctx.request.body.cpf_cliente
      let cnh_cliente = ctx.request.body.cnh_cliente
      let vencimento_cliente = ctx.request.body.vencimento_cliente
      console.log(vencimento_cliente)
      let insert_cliente = await this.db.exec('INSERT INTO `tb_clientes` (`id`, `nome`, `tel`, `email`, `cnh`,  `data_cadastro`, `processos_id`, `vencimento_cnh`, `cpf`) VALUES (NULL, ?, ?, ?, ?, CURRENT_DATE(), 0, STR_TO_DATE(?, "%d/%m/%Y"), ?);', [nome_cliente, tel_cliente, email_cliente, cnh_cliente, vencimento_cliente, cpf_cliente])

      Object.keys(files).forEach(element => {
        let file = files[element]
        let fileName = file.originalFilename
        let destinationDir = `app/assets/views/uploads/imagens_clientes/cliente_${insert_cliente.insertId}/`;
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
          let insert_image = await this.db.exec('INSERT INTO `tb_imagens_clientes` (`id`, `path`, `cliente_id`) VALUES (NULL, ?, ?);', [fileName, insert_cliente.insertId])

          writeStream.end();
        });
        //insert path in tb_imagens
      });
      ctx.response.body = { status: 200, message: "sucesso",newObject:JSON.stringify(await this.attributes())}

    })
  }
  async updateCliente() {
    this.app.post("/MeusClientes/updateCliente", async ctx => {

      let files = ctx.request.files
      console.log(files)
    let idCliente = ctx.request.body.idCliente
      let nome_cliente = ctx.request.body.nome_cliente
      let tel_cliente = ctx.request.body.tel_cliente
      let email_cliente = ctx.request.body.email_cliente
      let cpf_cliente = ctx.request.body.cpf_cliente
      let cnh_cliente = ctx.request.body.cnh_cliente
      let vencimento_cliente = ctx.request.body.vencimento_cliente
      let update_cliente = await this.db.exec('UPDATE tb_clientes SET nome = ?, tel = ?, email = ?, cnh = ?, vencimento_cnh = STR_TO_DATE(?, "%d/%m/%Y"), cpf = ? WHERE tb_clientes.id = ?', [nome_cliente, tel_cliente, email_cliente, cnh_cliente, vencimento_cliente, cpf_cliente,idCliente])
      let delete_img = await this.db.exec('DELETE FROM tb_imagens_clientes WHERE cliente_id = ?', [idCliente])
      let destinationDir = `app/assets/views/uploads/imagens_clientes/cliente_${idCliente}/`;

      fs.rmSync(destinationDir, { recursive: true, force: true });

      Object.keys(files).forEach(element => {
        let file = files[element]
        let fileName = file.originalFilename
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
          let insert_image = await this.db.exec('INSERT INTO `tb_imagens_clientes` (`id`, `path`, `cliente_id`) VALUES (NULL, ?, ?);', [fileName,idCliente])

          writeStream.end();
        });
        //insert path in tb_imagens
      });
      console.log(this.attributes())
      ctx.response.body = { status: 200, message: "sucesso",newObject:JSON.stringify(await this.attributes())}

    })
  }
  iniciarPagina() {
    this.insertCliente()
    this.updateCliente()
    this.selectCliente()
  }

}
module.exports = indexPage