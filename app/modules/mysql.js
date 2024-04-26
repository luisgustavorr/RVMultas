var mysql = require('mysql');
class mysqlConnection {
    constructor() {
        this.connection = mysql.createPool({
            host: "pro107.dnspro.com.br",
            user: "spacemid_luis",
            password: "G4l01313",
            database: "spacemid_rv_multas_sistema"
        });
        this.results = ""

    }
    async exec(query,args) {
        let exec_process = new Promise( (resolve, reject) => {
             this.connection.query(query,args, function (error, results, fields) {
                if (error) throw error;
                resolve(results)
            });
            
        })
       await exec_process.then((value) => {
            this.results = value
        })
       return this.results
    }
    end() {
        this.connection.end();

    }

}

module.exports = mysqlConnection


