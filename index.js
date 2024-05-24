const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const render = require('koa-ejs');
const path = require('path');
const fs = require("fs");
const mysqlConnection = require("./app/modules/mysql.js");
const static = require('koa-static');
const bodyParser = require('koa-body-parser');
const pagesManager = require("./app/modules/pagesManager");
const { koaBody } = require('koa-body');

app.use(koaBody({ multipart: true }));


render(app, {
    root: path.join(__dirname, "app", 'assets', "views"),
    layout: "layout",
    viewExt: 'html',
    cache: false,
    debug: false
});

const staticDir = path.join(__dirname, "app", 'assets', "views");
app.use(static(staticDir));

let db = new mysqlConnection();
let arrayPermissoes = {
    1: [
        "processoscliente",
        "dadoscliente",
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
router.get("/", async ctx => {
    if (ctx.cookies.get("permissao") === undefined) {
        ctx.redirect('/Login')
        return
    } else if (ctx.cookies.get("permissao") === 1) {
        ctx.redirect('/ProcessosCliente')
        return
    } else {
        ctx.redirect('/MeusClientes')
        return
    }
})

// Rota genérica para outras situações
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

router.post("/RVMultas/insertNotificacao", async ctx => {

    let titulo = ctx.request.body.titulo
    let mensagem = ctx.request.body.mensagem
    let permissao_alvo = ctx.request.body.permissao_alvo
    let id_criador = ctx.request.body.id_criador
    let id_processo = ctx.request.body.id_processo
    let id_contrato = ctx.request.body.id_contrato

    let select_cliente = await db.exec('INSERT INTO `tb_notificacoes` (`id`, `titulo`, `mensagem`, `permissao_alvo`, `id_criador`, `id_processo`, `id_contrato`, `data_criacao`,`vista`) VALUES (NULL, ?, ?, ?, ?, ?, ?, NOW(),0);', [titulo, mensagem, permissao_alvo, id_criador, id_processo, id_contrato])
    ctx.response.body = { status: 200, message: "sucesso" }
})
router.post("/RVMultas/lerNotificacao", async ctx => {

    let id_notificacao = ctx.request.body.id_notificacao
    let select_cliente = await db.exec('UPDATE `tb_notificacoes` SET vista = 1 WHERE id = ?;', [id_notificacao])
    ctx.response.body = { status: 200, message: "sucesso" }
})
router.post("/RVMultas/getNotificacoes", async ctx => {


    let select_cliente = await db.exec('SELECT * FROM tb_notificacoes WHERE permissao_alvo <= ? ORDER BY vista ASC,id DESC', [ctx.cookies.get("permissao")])
    ctx.response.body = { status: 200, message: "sucesso", notificacoes: select_cliente }
})
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Servidor Koa iniciado na porta 3000');
});



