var mysql = require('mysql');
const PoolManager = require('mysql-connection-pool-manager');

class mysqlConnection {
    constructor() {
        this.MySql = {
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        };
        this.poolManager = {
            idleCheckInterval: 1000,
            maxConnextionTimeout: 30000,
            idlePoolTimeout: 3000,
            errorLimit: 5,
            preInitDelay: 50,
            sessionTimeout: 60000,
            mySQLSettings: this.MySql
        };
        this.mysql = PoolManager(this.poolManager);
        this.connection = mysql.createPool({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });
        this.results = "";
    }

    async exec(query, args) {


        return new Promise((resolve, reject) => {
            this.connection.query(query, args, (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    end() {
        this.connection.end();
    }
}

module.exports = mysqlConnection;
