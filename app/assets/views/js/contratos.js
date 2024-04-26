let attr_obj = JSON.parse(attributes.value)
let attr_clientes = attr_obj.data_clientes
let obj_emissoes = []
attr_obj = attr_obj.data_contarato

function createTableRow(array) {
  $("#modal_ver_emissoes tbody").html("")
  array.forEach((e) => {
    console.log(e.nome)
    let data_assinatura = e.data_assinatura != "0000-00-00" ? formatarData(e.data_assinatura) : 'Pendente'
    $("#modal_ver_emissoes tbody").append(`
    <tr>
    <td>${e.nome}</td>
    <td> ${e.nome_cliente}</td>
    <td>  ${formatarData(e.data_emissao)}</td>
    <td> ${data_assinatura}</td>
    <td><i id_cliente = "${e.id_cliente}" id_contrato="${e.id_contrato}" class="gerarPDF fa-solid fa-file-pdf"></i></td>
  </tr>
    `)
  })
}
function createCards(array, status = null) {
  let new_array = array
  // if (status != null) {
  //     new_array = array.filter((obj) => obj.status == status)
  // }
  $("#cards_father_contrato").html("")
  new_array.forEach(element => {
    let ver_emissoes = element.numero_relacionamentos > 0 ? `<a id_contrato="${element.id}" class="ver_emissao">Ver Emissões</a>` : ""
    let dataFormatada = formatarData(element.data_criacao)
    $("#cards_father_contrato").append(`
      <div class="card">
      <div class="name_header_card">
        <h4>${element.nome}</h4>
        <i id_contrato="${element.id}" aberto="0" class="options_contrato fa-solid fa-bars"></i>
      </div>
      <div>
        <red>Código:</red>
        <span>#${element.id}</span>
      </div>
      <div>
        <red>Data de Criação:</red>
        <span>${dataFormatada}</span>
      </div>
      <div>
        <red>Clientes Vinculados:</red>
        <span>${element.numero_relacionamentos} cliente(s)</span>
      </div>
      <div class="links_father">
       ${ver_emissoes}
        <a id_contrato="${element.id}" class='realizar_emissao'>Realizar Emissão</a>
      </div>
    </div>`)
  });
}

function moveTooltip(x, y) {
  $("#tooltip_contrato").css("left", x + "px")
  $("#tooltip_contrato").css("top", y + "px")
}
const quill = new Quill("#editor", {
  modules: {
    toolbar: "#toolbar",
  },
  theme: "snow",
});
$(function () {
  $(document).tooltip({
    position: { my: "left+15 center", at: "right center" },
  });
});

$("#cards_father_contrato").on("click", ".options_contrato", function (event) {
  $("#excluir_contrato").html(' <i class="fa-solid fa-trash-can"></i> Excluir Contrato')

  $("#excluir_contrato").attr("confirmado", "0")
  let menu_aberto = $(".options_contrato[aberto='1']")
  let quantidade_menus_abertos = $(".options_contrato[aberto='1']").length
  let x = parseFloat(event.pageX) - parseFloat($("#sidebar").outerWidth() - 10);
  let y = parseFloat(event.pageY) - parseFloat($("header").outerHeight() - 10)
  $
  if (quantidade_menus_abertos == 0) {
    moveTooltip(x, y)
    $("#tooltip_contrato").attr("id_contrato", $(this).attr("id_contrato"))
    $("#tooltip_contrato").css("display", "flex")
    $(this).css("color", "#5A0001")
    $(this).attr("aberto", 1)

  } else {
    moveTooltip(x, y)
    $(this).css("color", "#5A0001")
    if ($(this).attr("aberto") === "1") {
      $("#tooltip_contrato").css("display", "none")
      $(this).css("color", "#464545")

      $(this).attr("aberto", 0)
      return
    }
    $(this).attr("aberto", 1)
  }
  $(menu_aberto).attr("aberto", "0")
  $(menu_aberto).css("color", "#464545")
});

$("#modal_add_contrato").submit(function (e) {
  e.preventDefault()
  let path_post = "insertContrato"
  let data = {
    "text": quill.getSemanticHTML(0),
    "nome": $("#nome_contrato_add_modal").val()
  }
  if ($("#modal_add_contrato").attr("editando") === "true") {
    path_post = "updateContrato"
    data["id_contrato"] = $("#tooltip_contrato").attr("id_contrato")
  }

  $.post("/Contratos/" + path_post, data, (ret) => {
    console.log(ret)
    location.reload()
  })
})

$(".variaveis_contrato_buttons button").click(function () {
  let variavel = $(this).text()
  if ($("#editor .ql-editor p:last-child").children())
    console.log()
  quill.insertText(quill.getSelection(), variavel)
})

$("#editar_contrato").click(function () {
  abrirModal('modal_add_contrato')
  $("#modal_add_contrato").attr("editando", "true")
  $("#tooltip_contrato").css("display", "none")
  let contrato_id = $("#tooltip_contrato").attr("id_contrato")
  let menu_aberto = $(".options_contrato[aberto='1']")
  $(menu_aberto).attr("aberto", "0")
  $(menu_aberto).css("color", "#464545")
  let contrato = attr_obj.filter((element) => element.id == contrato_id)[0]
  console.log(contrato)
  $("#nome_contrato_add_modal").val(contrato.nome)
  $("#editor .ql-editor").html(contrato.text)
})
$("#excluir_contrato").click(function () {
  if ($(this).attr("confirmado") === "1") {
    let contrato_id = $("#tooltip_contrato").attr("id_contrato")
    $.post("/Contratos/deleteContrato", { id_contrato: contrato_id }, (ret) => {
      console.log(ret)
      location.reload()
    })
    $(this).attr("confirmado", "0")
  } else {
    $(this).html(' <i class="fa-solid fa-trash-can"></i> Tem Certeza?')
    $(this).attr("confirmado", "1")

  }
})



$("#buscar_contrato_processos").change(function () {
  $("#tooltip_contrato").css("display", "none")
  createCards(buscar($(this), attr_obj, "nome"))
})

$("#modal_realizar_emissao").submit(function (e) {
  e.preventDefault()
  let id_cliente = $("#id_cliente_emissao").val()
  let id_contrato = $("#id_contrato_emissao").val()
  let data = {
    id_cliente,
    id_contrato
  }
  $.post("/Contratos/insertContratoRelacionado", data, (ret) => {
    console.log(ret)
    location.reload()
  })
})
console.log(attr_clientes)
let availableTags = [

];
attr_clientes.forEach((e) => {
  availableTags.push({ "label": e.id + "-" + e.nome, "value": { "id": e.id, "nome": e.nome.replace(/=/g, "") } })
})

$("#nome_cliente_add_modal").autocomplete({
  source: availableTags,
  select: function (event, ui) {
    event.preventDefault()
    let info = ui.item.value
    $("#nome_cliente_add_modal").val(info.nome)
    $("#id_cliente_emissao").val(info.id)
  }
});

$("#cards_father_contrato").on("click", ".realizar_emissao", function (event) {
  abrirModal("modal_realizar_emissao")
  $("#id_contrato_emissao").val($(this).attr("id_contrato"))

  console.log("asdaw")
})


$("#cards_father_contrato").on("click", ".ver_emissao", function (event) {
  let id_contrato = $(this).attr("id_contrato")
  let info_contrato = attr_obj.filter((e) => e.id == id_contrato)
  info_contrato = info_contrato[0]
  console.log(info_contrato)
  $("#modal_ver_emissoes h2 red ").text(info_contrato.nome)
  $("#modal_ver_emissoes h3 strong").text(formatarData(info_contrato.data_criacao))

  abrirModal("modal_ver_emissoes")
  $.post("/Contratos/selectEmissoesContrato", { id_contrato: id_contrato }, (ret) => {
    createTableRow(ret.array)
    obj_emissoes = ret.array
  })
})

$("#buscar_cliente").change(function () {
  // let termoDeBusca = $(this).val().toLowerCase(); 
  // let new_array = obj_emissoes.filter(obj => removerAcentos(obj.nome_cliente).toLowerCase().startsWith(removerAcentos(termoDeBusca)));
  createTableRow(buscar($(this), obj_emissoes, "nome_cliente"))
})
function addVariablesContrato(html) {
  let novo_html = html
  return novo_html
}
$("#modal_ver_emissoes").on("click", ".gerarPDF", function (event) {
  let contrato_id = $(this).attr("id_contrato")
  let cliente_id = $(this).attr("id_cliente")
  console.log(contrato_id)
  let contrato = attr_obj.filter((element) => element.id == contrato_id)[0]
  let data = {
    htmlAlvo: addVariablesContrato(contrato.text),
    nomeContrato: contrato.nome,
    idContrato :contrato.id,
    idCliente :cliente_id
  }
  $.post("/Contratos/generatePDF", data, (ret) => {
    console.log(ret)
    $.post("/Contratos/signPDF", data, (ret) => {
      console.log(ret)
  
    })
  })
})