class indexPage {
  constructor(app,db) {
    this.app = app
    this.db = db
  }
    async attributes(){
  
      let result = await  this.db.exec("SELECT tb_clientes.vencimento_cnh as vencimento_cnh,tb_clientes.nome,tb_clientes.cnh,COUNT(tb_processos.id) as numero_processos FROM `tb_processos` INNER JOIN tb_processos_relacionados ON tb_processos_relacionados.id_processo = tb_processos.id INNER JOIN tb_clientes ON tb_clientes.id = tb_processos_relacionados.id_cliente GROUP BY tb_clientes.id;")
      return result
    }
}   
module.exports = indexPage