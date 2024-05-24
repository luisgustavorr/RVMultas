var mysql = require('mysql');
const PoolManager = require('mysql-connection-pool-manager');

//localhost
//luis
//G4l01313

class mysqlConnection {
    constructor() {
        this.MySql = {
            host: "pro107.dnspro.com.br",
            user: "spacemid_luis",
            password: "G4l01313",
            database: "spacemid_rv_multas_sistema"
        }
        this.poolManager = {
            idleCheckInterval: 1000,
            maxConnextionTimeout: 30000,
            idlePoolTimeout: 3000,
            errorLimit: 5,
            preInitDelay: 50,
            sessionTimeout: 60000,
            mySQLSettings: this.MySql
        }
        this.mysql = PoolManager(this.poolManager);
        this.connection = mysql.createPool({
            host: "pro107.dnspro.com.br",
            user: "spacemid_luis",
            password: "G4l01313",
            database: "spacemid_rv_multas_sistema"
        });
        this.results = ""

    }
    async exec(query, args) {
        let exec_process = new Promise((resolve, reject) => {
            this.connection.query(query, args, function (error, results, fields) {
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