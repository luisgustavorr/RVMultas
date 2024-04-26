var pdf2table = require('pdf2table');
var fs = require('fs');

fs.readFile('../../notificacao-de-autuacao-data-2024-04-15.pdf', function (err, buffer) {
    if (err) return console.log(err);
    pdf2table.parse(buffer, function (err, rows, rowsdebug) {
        if(err) return console.log(err);
        let resultado = rows.filter(e=>e[4]=="501-00")
        resultado.forEach(e=>{
            console.log("Data",e[5]+" às "+e[6])
            console.log("Nome",e[1])
            console.log("Placa",e[2])
            console.log("Infração",e[4])
            console.log("----------------------------")
        })
    });
});