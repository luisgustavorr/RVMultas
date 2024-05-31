const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const render = require('koa-ejs');
const path = require('path');
const fs = require('fs');
const mysqlConnection = require('./app/modules/mysql.js');
const static = require('koa-static');
const bodyParser = require('koa-body-parser');
const pagesManager = require('./app/modules/pagesManager');
const axios = require('axios');
const { koaBody } = require('koa-body');
const app = websockify(new Koa());
const router = new Router();
const logsDir = "./logs";
const logFilePath = path.join(logsDir, "logfile.txt");
const dotenv = require('dotenv');
dotenv.config()
console.log(process.env.ROOT)

fs.mkdirSync(logsDir, { recursive: true });

// Cria o arquivo de log se não existir
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ''); // Cria o arquivo vazio
}
console.log = function (msg) {
    logStream.write(new Date().toString() + " - " + msg + '\n');
};
// Cria o fluxo de escrita para o arquivo de log
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
app.use(koaBody({ multipart: true }));


render(app, {
    root: path.join(__dirname, "app", 'assets', "views"),
    layout: "layout",
    viewExt: 'html',
    cache: false,
    debug: false
});


let db = new mysqlConnection();
let arrayPermissoes = {
    1: [
        "processoscliente",
        "assinarcontrato",
        "login",
        "logincliente"
    ],
    2: [
        "contratos",
        "meusclientes",
        "meusprocessos",
        "meusdados"

    ],
    3: [
        "contratos",
        "meusclientes",
        "meusprocessos",
        "meusdados"
    ]

}
// Rota para a situação nova


router.get(process.env.ROOT+"/", async ctx => {
    if (ctx.cookies.get("permissao") === undefined) {
        ctx.redirect('/Login')
        return
    } else if (parseInt(ctx.cookies.get("permissao")) === 1) {
        ctx.redirect('/ProcessosCliente')
        return
    } else {
        ctx.redirect('/MeusClientes')
        return
    }
})

// Rota genérica para outras situações
let webSocketConnections = [];

// Configuração do WebSocket
app.ws.use((ctx) => {
    webSocketConnections.push(ctx.websocket);

    ctx.websocket.on('close', () => {
        webSocketConnections = webSocketConnections.filter(ws => ws !== ctx.websocket);
    });
});
router.post(process.env.ROOT+"/contratoAssinado",async ctx=>{
    let token = ctx.request.body.token
    
    webSocketConnections.forEach((ws) => {
        console.log("asdawd")
        if (ws.readyState === 1) { // WebSocket.OPEN
             ws.send((JSON.stringify({evento:"ASSINATURA_CONCLUIDA",token:token})))
        }
    });
    ctx.response.body = { status: 200, message: "sucesso" }

})
router.get(/^[^.]*/, async ctx => {

    let path = ctx.path.split("/")[ctx.path.split("/").length - 1]
        .replace("Page", "")
        .replace("/", "")
        .replace(/%20/g, "")
        .replace(/ /g, "")
        .toLowerCase();
    console.log("Desired :" + path);
    if (path == "") {
        path = "home";
    }else if(path ==="assinarcontrato"){
        path  = path
    } else if (ctx.cookies.get('login') === undefined && !path.includes("login")) {
        console.log("redirecionando")
        ctx.redirect('/Login')
        return
    }


    if (ctx.cookies.get('permissao') !== undefined) {
        if (path.includes("login")) {
            if (parseInt(ctx.cookies.get('permissao')) === 1) {
                ctx.redirect('/ProcessosCliente')

            } else {
                ctx.redirect('/MeusClientes')

            }
        }else{
            if (parseInt(ctx.cookies.get('permissao')) === 1) {
                console.log("adwd")

            } 
        }
        if (!arrayPermissoes[ctx.cookies.get('permissao')].includes(path)) {
            path = "not_found";
        }

    }
    if (!fs.existsSync("./app/modules/" + path + "Page.js")) {
        path = "not_found";
    }
    console.log("Accessed :" + path);

    const page = new pagesManager(path);
    let classCaller = page.selectFile();
    let target_class = new classCaller(router, db, ctx);

    let koalaFacts = await target_class.attributes();
    koalaFacts["permissao"] = ctx.cookies.get('permissao')
    koalaFacts["id_cliente"] = ctx.cookies.get('id_cliente')

    return ctx.render(path, {
        attributes: koalaFacts
    });
});
const staticDir = path.join(__dirname, "app", 'assets', "views");
app.use(static(staticDir));

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Servidor Koa iniciado na porta 3000');
});
router.post(process.env.ROOT+"/RVMultas/insertNotificacao", async ctx => {

    let titulo = ctx.request.body.titulo
    let mensagem = ctx.request.body.mensagem
    let permissao_alvo = ctx.request.body.permissao_alvo
    let id_criador = ctx.request.body.id_criador
    let id_processo = ctx.request.body.id_processo
    let id_contrato = ctx.request.body.id_contrato

    let select_cliente = await db.exec('INSERT INTO `tb_notificacoes` (`id`, `titulo`, `mensagem`, `permissao_alvo`, `id_criador`, `id_processo`, `id_contrato`, `data_criacao`,`vista`) VALUES (NULL, ?, ?, ?, ?, ?, ?, NOW(),0);', [titulo, mensagem, permissao_alvo, id_criador, id_processo, id_contrato])
    ctx.response.body = { status: 200, message: "sucesso" }
})
router.post(process.env.ROOT+"/RVMultas/lerNotificacao", async ctx => {

    let id_notificacao = ctx.request.body.id_notificacao
    let select_cliente = await db.exec('UPDATE `tb_notificacoes` SET vista = 1 WHERE id = ?;', [id_notificacao])
    ctx.response.body = { status: 200, message: "sucesso" }
})
router.post(process.env.ROOT+"/RVMultas/getNotificacoes", async ctx => {
    let select_cliente = await db.exec('SELECT * FROM tb_notificacoes WHERE permissao_alvo <= ? ORDER BY vista ASC,id DESC', [ctx.cookies.get("permissao")])
    ctx.response.body = { status: 200, message: "sucesso", notificacoes: select_cliente }
})
router.post(process.env.ROOT+"/RVMultas/getQrCode", async ctx => {
    let id_cliente = ctx.request.body.id_cliente
   let teste = await axios.post(process.env.ROOT+"http://localhost:3030/getQrCode",{clientId:id_cliente,qrCode:false}) .then(function (response) {
        return response
      })
      .catch(function (error) {
        return error
      });
      return ctx.response.body = {"status":teste.evento,"data":teste.data.qrCode}
})

router.post(process.env.ROOT+"/RVMultas/EventosQrCode", async ctx => {
    console.log("recebido")
    let data_received = ctx.request.body
    webSocketConnections.forEach((ws) => {
        if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify(data_received));
        }
    });

      return ctx.response.body =  { status: 200, message: "sucesso" }

})


module.exports = router 