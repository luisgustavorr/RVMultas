let attr_obj = JSON.parse(attributes.value)
let attr_obj_users = JSON.parse(attributes.value).usuarios
var id_cliente_global =JSON.parse(attributes.value).id_cliente

console.log(attr_obj)
let arrayPermissoes = {
  2: "Funcionário",
  3: "Administrador"
}
function abrirModalUsuarios() {
  $('#modal_add_user').find('input').val('')
  $('#modal_add_user h3').html('Criar <strong>Nova Conta</strong>');
  $('#modal_add_user').find('select').val('0');
  $("#id_user_editando").val("0")

}
$(".input_change_type_password").mouseenter(function(){
  $(this).attr("type","text")
})
$(".input_change_type_password").mouseleave(function(){
  $(this).attr("type","password")
})
$("body").on("click", ".editar_user ", function () {

  abrirModal('modal_add_user')
  let cliente_editando = attr_obj_users.filter(e => e.id == $(this).attr("id_user"))[0]
  $('#modal_add_user h3').html('<h3>Editar <strong>Conta : ' + cliente_editando.nome + '</strong></h3>')
  $("#id_user_editando").val(cliente_editando.id)
  $("#login_user").val(cliente_editando.nome)
  $("#email_user").val(cliente_editando.email_recuperacao)
  $("#senha_user").val(cliente_editando.senha)
  $("#confirmar_senha_user").val(cliente_editando.senha)
  $("#privilegio_user").val(cliente_editando.privilegio)

})
$(".editar_info_current_user").click(function () {
  let element = $(this).parent().find("input")
  let column = $(element).attr("name")
  let value = $(element).val()

  $.post("/MeusDados/changeNameOrEmail", {
    column: column, value, value
  }, function (ret) {
    $.confirm({
      title: 'Sucesso!',
      boxWidth: '500px',
      useBootstrap: false,
      content: 'Informações alteradas!',
      buttons: {
        OK: function () {
          location.reload()
        }
      }
    })

  })
})
let cliente_logado = attr_obj_users.filter(e => e.id == attr_obj.id_cliente)[0]
console.log(cliente_logado)
$("#login_current_user").val(cliente_logado.nome)
$("#senha_current_user").val(cliente_logado.senha)
$(".info_priv h4").text(arrayPermissoes[cliente_logado.privilegio])
// $("#controle_contas table tbody ").on("click","tr",function(e){
// console.log(e.target)
//   $(this).addClass("row_clicada")
//     setTimeout(()=>{
//       $(this).removeClass("row_clicada")
//   },1000)
//   })
function loadUsersTable(array) {


  $("#controle_contas table tbody").html("")
  array.forEach(element => {
    let ultimo_acesso = formatarData(element.ultimo_acesso) == "NaN/NaN/NaN" ? "Não Acessou" : formatarDatetime(element.ultimo_acesso);
    let text_from_row = "Nome: " + element.nome + " | Último Acesso : " + ultimo_acesso + " | " + arrayPermissoes[element.privilegio] + " | " + element.processoMes + " processo(s) no Mês "

    $("#controle_contas table tbody").append(`
    <tr >
    <td>Perfil</td>
    <td >${element.nome}</td>
    <td  rv-title="${element.email_recuperacao}">${element.email_recuperacao}</td>
    <td >${arrayPermissoes[element.privilegio]}</td>
    <td >${element.senha}</td>
    <td >${ultimo_acesso}</td>
    <td >${element.processoMes} processo(s) no Mês</td>
    <td><i id_user= "${element.id}"class="editar_user fa-solid fa-pen-to-square"></i></td>
    <td><i id_user= "${element.id}"class="excluir_user fa-solid fa-trash-can"></i></td>
</tr>
    `)

  });
}
loadUsersTable(attr_obj_users)
$("#modal_add_user").submit(function (e) {
  e.preventDefault()
  if ($("#privilegio_user").val() == 0) {
    alertar("Favor selecione o privilégio do funcionário!", "ERRO!")
  }
  let data = {
    nome: $("#login_user").val(),
    email: $("#email_user").val(),
    senha: $("#senha_user").val(),
    privilegio: $("#privilegio_user").val()
  }
  let path = "updateFuncionario"
  if (parseInt($("#id_user_editando").val()) === 0) {
    path = "insertFuncionario"
  } else {
    data["id_cliente"] = parseInt($("#id_user_editando").val())
  }
  $.post("/MeusDados/" + path, data, function (ret) {
    alertar("Usuário cadastrado/atualizado com sucesso !", "Sucesso !")
    loadUsersTable(JSON.parse(ret.newObject).usuarios)

    fecharModal()
  })
})