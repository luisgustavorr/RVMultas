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

    let select_processos = await this.db.exec('SELECT `tb_processos`.*,tb_status.nome,tb_status.mensagem,tb_status.cor,tb_clientes.cnh,tb_clientes.tel,tb_clientes.nome as nome_cliente,tb_clientes.cpf FROM `tb_processos` INNER JOIN tb_status ON tb_status.id = tb_processos.status INNER JOIN tb_processos_relacionados ON tb_processos_relacionados.id_processo = tb_processos.id INNER JOIN tb_clientes on tb_processos_relacionados.id_cliente = tb_clientes.id GROUP BY tb_processos.id')
    let status = await this.db.exec('SELECT * FROM tb_status')
    let metricas = await this.db.exec('SELECT COUNT(tb_processos.id) as quantidade,tb_status.nome  as status FROM tb_processos INNER JOIN tb_status ON tb_status.id = tb_processos.status WHERE MONTH(CURRENT_DATE) = MONTH(tb_processos.criacao)  GROUP BY tb_processos.status   ORDER BY COUNT(tb_processos.id) DESC LIMIT 2;')
    let processosMes = await this.db.exec('SELECT COUNT(tb_processos.id) as processosMes FROM tb_processos WHERE MONTH(CURRENT_DATE) = MONTH(tb_processos.criacao);')

    let return_value = {
      "processos": select_processos,
      "status": status,
      "metricas": metricas,
      "processosMes": processosMes[0],
      "id_cliente":query.cliente


    }
    return return_value

  }
  updateStatus() {
    this.app.post(process.env.ROOT+"/MeusProcessos/updateStatus", async ctx => {
      let idProcesso = ctx.request.body.idProcesso
      let status = ctx.request.body.status
      let update = await this.db.exec(`UPDATE tb_processos SET status = ?,atualizacao = CURRENT_DATE() WHERE id = ?`, [status, idProcesso])
      let novoObjeto = await this.attributes()
      novoObjeto = JSON.stringify(novoObjeto)
      ctx.response.body = { status: 200, message: "sucesso", newObject: novoObjeto }

    })
  }
  insertStatus() {
    this.app.post(process.env.ROOT+"/MeusProcessos/insertStatus", async ctx => {
      let status = ctx.request.body.status
      let mensagem = ctx.request.body.mensagem
      let cor = ctx.request.body.cor
      let update = await this.db.exec(`INSERT INTO tb_status (id, nome, mensagem, cor) VALUES (NULL, ?, ?,?);`, [status, mensagem,cor])
      let novoObjeto = await this.attributes()
      novoObjeto = JSON.stringify(novoObjeto)
      ctx.response.body = { status: 200, message: "sucesso", newObject: novoObjeto }

    })
  }
  deleteStatus() {
    this.app.post(process.env.ROOT+"/MeusProcessos/deleteStatus", async ctx => {
      let id_status = ctx.request.body.id_status
      let update = await this.db.exec(`DELETE FROM tb_status WHERE id = ?`, [id_status])
      let novoObjeto = await this.attributes()
      novoObjeto = JSON.stringify(novoObjeto)
      ctx.response.body = { status: 200, message: "sucesso", newObject: novoObjeto }

    })
  }
  updateInfoStatus() {
    this.app.post(process.env.ROOT+"/MeusProcessos/updateInfoStatus", async ctx => {
      let status = ctx.request.body.status
      let id_status = ctx.request.body.id_status
      let mensagem = ctx.request.body.mensagem
      let cor = ctx.request.body.cor
      let update = await this.db.exec(`UPDATE tb_status SET nome = ?,mensagem = ?,cor = ? WHERE id = ?`, [status, mensagem,cor,id_status])
      let novoObjeto = await this.attributes()
      novoObjeto = JSON.stringify(novoObjeto)
      ctx.response.body = { status: 200, message: "sucesso", newObject: novoObjeto }

    })
  }
  selectClientes() {
    this.app.post(process.env.ROOT+"/MeusProcessos/selectClientes", async ctx => {
      let select_clientes = await this.db.exec('SELECT tb_clientes.nome,tb_clientes.id,JSON_ARRAYAGG(tb_imagens_clientes.path) AS caminhos FROM tb_clientes LEFT JOIN tb_imagens_clientes ON tb_imagens_clientes.cliente_id = tb_clientes.id GROUP BY id;')

      ctx.response.body = { status: 200, message: "sucesso", clientes: select_clientes }

    })
  }
  selectProcesso(){
    this.app.post(process.env.ROOT+"/MeusProcessos/selectProcesso", async ctx => {
      let idProcesso = ctx.request.body.idProcesso
      let select_processos = await this.db.exec('SELECT tb_processos.*,tb_processos_relacionados.id_cliente,JSON_ARRAYAGG(CONCAT(tb_imagens_processos.path,"|^|^|",tb_imagens_processos.row))AS arquivos_processos FROM tb_processos LEFT JOIN tb_processos_relacionados ON tb_processos_relacionados.id_processo = tb_processos.id LEFT JOIN tb_imagens_processos ON tb_imagens_processos.id_processo = tb_processos_relacionados.id_processo WHERE tb_processos.id= ?',[idProcesso])
      ctx.response.body = { status: 200, message: "sucesso", processo: select_processos[0] }
    })
  }
  selectCliente() {
    this.app.post(process.env.ROOT+"/MeusProcessos/selectCliente", async ctx => {
      let id_cliente = ctx.request.body.id_cliente

      let select_cliente = await this.db.exec('SELECT cpf,tel FROM tb_clientes WHERE id = ?', [id_cliente])

      ctx.response.body = { status: 200, message: "sucesso", cliente: select_cliente[0] }

    })
  }
  updateProcesso(){
    this.app.post(process.env.ROOT+"/MeusProcessos/updateProcesso", async ctx => {
      let cliente_id = ctx.request.body.clientId
      let id_processo = ctx.request.body.id_processo
      let status = ctx.request.body.status
      let nomeProcesso = ctx.request.body.nomeProcesso
      let files = ctx.request.files
      console.log(files)
      let update_processo = await this.db.exec('UPDATE tb_processos SET status = ?, nome_processo = ?, placa_carro = ?, atualizacao = NOW(),funcionario_id= ? WHERE id = ? ', [status,nomeProcesso,"test",this.ctx.cookies.get("id_cliente"),id_processo])
      let update_processo_relacionados = await this.db.exec('UPDATE tb_processos_relacionados SET id_cliente = ? WHERE id_processo = ?', [cliente_id,id_processo])
      let delete_imagens = await this.db.exec('DELETE FROM tb_imagens_processos WHERE id_processo = ? AND cliente_id = ?', [id_processo,cliente_id])

      let destinationDir = `app/assets/views/uploads/imagens_processos/cliente_${cliente_id}/${id_processo}/`;
      fs.rmSync(destinationDir, { recursive: true, force: true });
      Object.keys(files).forEach(element => {
        let file = files[element]
        console.log(files)
        let fileNameArray = element.split("|_|_|")
        let fileName = files[element].originalFilename
        let row = fileNameArray[0]
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
          let insert_imagens = await this.db.exec('INSERT INTO tb_imagens_processos (id, path, cliente_id,row,id_processo) VALUES (NULL, ?, ?,?,?);', [fileName,cliente_id,row,id_processo])
        });
        //insert path in tb_imagens

      });

      ctx.response.body = { status: 200, message: "sucesso" }

    })
  }
  insertProcesso() {
    this.app.post(process.env.ROOT+"/MeusProcessos/insertProcesso", async ctx => {
      let cliente_id = ctx.request.body.clientId
      let status = ctx.request.body.status
      let nomeProcesso = ctx.request.body.nomeProcesso
      let placa = ctx.request.body.placa

      console.log(placa)
      let files = ctx.request.files
      let insert_processo = await this.db.exec('INSERT INTO tb_processos (id, status, nome_processo,placa_carro,atualizacao,criacao,funcionario_id) VALUES (NULL, ?, ?,?,NOW() ,NOW(),? );', [status,nomeProcesso,placa,this.ctx.cookies.get("id_cliente")])
      let insert_processo_relacionados = await this.db.exec('INSERT INTO tb_processos_relacionados (id,id_cliente,id_processo) VALUES (NULL,?,?)', [cliente_id,insert_processo.insertId])
      Object.keys(files).forEach(element => {
        let file = files[element]
        let fileNameArray = element.split("|_|_|")
        let fileName = files[element].originalFilename
        let row = fileNameArray[0]
        let destinationDir = `app/assets/views/uploads/imagens_processos/cliente_${cliente_id}/${insert_processo.insertId}/`;
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
          let insert_imagens = await this.db.exec('INSERT INTO tb_imagens_processos (id, path, cliente_id,row,id_processo) VALUES (NULL, ?, ?,?,?);', [fileName,cliente_id,row,insert_processo.insertId])
        });
        //insert path in tb_imagens
      });
      ctx.response.body = { status: 200, message: "sucesso" }

    })
  }

  iniciarPagina() {
    this.updateStatus()
    this.selectClientes()
    this.selectCliente()
    this.insertProcesso()
    this.selectProcesso()
    this.updateInfoStatus()
    this.updateProcesso()
    this.deleteStatus()
    this.insertStatus()
  }
}
module.exports = indexPage
