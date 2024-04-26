const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const render = require('koa-ejs');
const path = require('path');
const fs = require("fs");
const mysqlConnection = require("./app/modules/mysql.js")
const static = require('koa-static');
var bodyParser = require('koa-body-parser');
const pagesManager = require("./app/modules/pagesManager")
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
let db = new mysqlConnection()

router.get("/", async ctx => {
    const page = new pagesManager("meusclientes")
    let classCaller = page.selectFile();
    let target_class = new classCaller(router,db);
    let koalaFacts = await target_class.attributes()
    return ctx.render("meusclientes", {
        attributes: koalaFacts
    });
});

router.get(/^[^.]*/, async ctx => {
    let path = ctx.path
        .replace("Page", "")
        .replace("/", "")
        .replace(/%20/g,"")
        .replace(/ /g, "")
        .toLowerCase()
    console.log("Desired :" + path)

    if (path == "") {
        path = "home"
    }
    if (! fs.existsSync("./app/modules/"+path+"Page.js")) {
        path = "not_found"

    }
    console.log("Accessed :" + path)
    const page = new pagesManager(path)
    let classCaller = page.selectFile();
    let target_class = new classCaller(router,db);
    let koalaFacts = await target_class.attributes()
    return ctx.render(path, {
        attributes: koalaFacts
    });
});


app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Servidor Koa iniciado na porta 3000');
});
