let attr_obj = JSON.parse(attributes.value)
let files_uploaded = []
let clientes = []
let processos_filtrados = attr_obj.processos
console.log(attr_obj.processos)
console.log(attr_obj)
function createStatusButton(array) {
  $(".status_father").html("")
  array.forEach(function (e) {
    console.log(e)
    $(".status_father").append(`
    <button id_status="${e.id}" type="button">${e.nome} <i class="fa-solid fa-angle-right"></i></button>

    `)
  })
}

createStatusButton(attr_obj.status)
function ordenarArray(array, criterio, campo) {
  // Função de comparação para ordenar por nome
  function compararPorNome(a, b) {
    if (a[campo].localeCompare(b[campo]) == 1) {
      return -1;
    }
    if (a[campo].localeCompare(b[campo]) == 0) {
      return 1;
    }
    return 0;
  }

  // Função de comparação para ordenar por número
  function compararPorNumero(a, b) {
    return a.id - b.id;
  }

  // Função de comparação para ordenar por data
  function compararPorData(a, b) {
    return new Date(a.atualizacao) - new Date(b.atualizacao);
  }

  // Determinar qual função de comparação usar com base no critério
  let funcaoComparacao;
  switch (criterio) {
    case 'alfabetica':
      funcaoComparacao = compararPorNome;
      break;
    case 'numerica':
      funcaoComparacao = compararPorNumero;
      break;
    case 'data':
      funcaoComparacao = compararPorData;
      break;
    default:
      throw new Error('Critério de ordenação inválido');
  }

  // Ordenar o array usando a função de comparação apropriada
  return array.sort(funcaoComparacao);
}
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function addImage(event) {
  $(`.remover_fotos[files_father='${$(event.target).attr("files_father")}']`).html(`<i class="fa-solid fa-trash-can"></i> Excluir Fotos Enviadas`)
  $(`.remover_fotos[files_father='${$(event.target).attr("files_father")}']`).removeAttr("removendo")
  alterarEstadoImagens($(`.remover_fotos[files_father='${$(event.target).attr("files_father")}']`), false)
  for (let index = 0; index < event.target.files.length; index++) {
    let id = makeid(6)
    src = URL.createObjectURL(event.target.files[index])
    if (event.target.files[index].type.toLowerCase().includes("pdf")) {
      $("#" + $(event.target).attr("files_father")).append(`
      <div id="file_${index + id}" class="file_crlv_father"> <div class="file_crlv"><i class="fa-regular fa-file-pdf"></i>
                     
                      </div> <span>${event.target.files[index].name}</span>  </div>
  
          `)

    } else {
      $("#" + $(event.target).attr("files_father")).append(`
      <div id="file_${index + id}" class="file_crlv_father"><div class="file_crlv"><img />  </div>    <span>${event.target.files[index].name}</span></div>

`)
      $("#" + $(event.target).attr("files_father")).children().last().find("img").attr('src', src);
    }
    $("#" + $(event.target).attr("files_father")).scrollLeft($("#" + $(event.target).attr("files_father")).children().length * 160)
    if (files_uploaded[$(event.target).attr("files_father")] === undefined) {
      files_uploaded[$(event.target).attr("files_father")] = []

    }
    files_uploaded[$(event.target).attr("files_father")].push({
      "id": index + id,
      "files": event.target.files[index]
    })

  }

  console.log(files_uploaded)
}

$("#modal_add_processo input[type=file]").change(function (event) {
  addImage(event)
});
function gerarMetricas(obj) {
  let metrica = ""
  obj.metricas.forEach(e => {
    metrica += `
    <span>Processos com status ${e.status} no mês: <red>${e.quantidade} Processo(s)</red></span>
    `
  })
  let html = `
  <h3>Métricas Clientes</h3>
  <span>Processos criados no mês: <red>${obj.processosMes.processosMes} Processo(s)</red></span>
  ${metrica}
`
  $("#metricas_processos").html(html)
}
gerarMetricas(attr_obj)
function gerarStatusOptions(id_status) {
  let status_array = attr_obj.status.filter(e => e.id != id_status)
  let options = ""
  status_array.forEach(element => {
    let option = `
    
          <option style="color:${element.cor};" id_processo="${element.id}"  value="${element.id}" >
            ${element.nome}
          </option>
        `
    options += option
  });


  return options
}
function createProcessTable(obj_arg) {
  let tbody = ""
  obj_arg.forEach(element => {
    let row = `
    <tr>
      <td ><span id_processo="${element.id}" class="editar_processo">${element.nome_processo}</span></td>
      <td>
      <select id_processo="${element.id}"  name="status" style="color:${element.cor};"class="status">
      <option style="color:${element.cor};"  selected value="${element.status}_" >
            ${element.nome}
      </option>
      ${gerarStatusOptions(element.status)}
</select>
      </td>
      <td >${element.nome_cliente}</td>
      <td>${element.cpf}</td>
      <td>${element.cnh}</td>
      <td>${element.placa_carro}</td>
      <td>${formatarData(element.atualizacao)}</td>
      <td>${formatarData(element.criacao)}</td>
      <td><i class="fa-brands fa-whatsapp"></i></td>
      
    </tr>`
    tbody += row
  })
  $("#table_processos tbody").html(tbody)
}
createProcessTable(attr_obj.processos.filter(e => {
  let data_atual = new Date()
  let data_processo = new Date(e.criacao)
  if (data_processo.getMonth() == data_atual.getMonth()) {
    return true
  } else {
    return false
  }
}))
$("#buscar_processos").change(function () {
  processos_filtrados = buscar($(this), attr_obj.processos, "nome_processo")
  createProcessTable(processos_filtrados)
})
$("#table_processos").on("change", ".status", function () {
  let data = {
    idProcesso: $(this).attr("id_processo"),
    status: $(this).val()
  }
  console.log(data)
  $.post("/MeusProcessos/updateStatus", data, (ret) => {
    console.log(ret)
    attr_obj = JSON.parse(ret.newObject)
    processos_filtrados = buscar($("#buscar_processos"), attr_obj.processos, "nome_processo").filter(e => {
      let data_explodida = e.criacao.split("-")
      let data_separada = $('#selectMeses').val().split("_")
      let mes = data_separada[1]
      let ano = data_separada[0]
      let data = ano + "-" + mes
      let data_db = data_explodida[0] + "-" + data_explodida[1]


      if (data_db == data) {
        return true
      }
    })
    createProcessTable(processos_filtrados)   
     gerarMetricas(attr_obj)


  })
})
function alterarEstadoImagens(element, ativar) {
  if (ativar) {
    let elementoAlvo = $("#" + $(element).attr("files_father"))
    $(elementoAlvo).children().css("background", "#DA2041")
    $(elementoAlvo).children().css("color", "white")
    $(elementoAlvo).children().css("cursor", "pointer")
    $(elementoAlvo).children().attr("remover_ao_clicar", "1")
  } else {
    let elementoAlvo = $("#" + $(element).attr("files_father"))
    $(elementoAlvo).children().css("background", "#d2d2d2")
    $(elementoAlvo).children().css("color", "#444")
    $(elementoAlvo).children().css("cursor", "auto")
    $(elementoAlvo).children().removeAttr("remover_ao_clicar")

  }

}
$(".remover_fotos").click(function () {

  let id_ativo = $(".remover_fotos[removendo='1']").attr("id")
  $(".remover_fotos[removendo='1']").html(`<i class="fa-solid fa-trash-can"></i> Excluir Fotos Enviadas`)
  alterarEstadoImagens($(".remover_fotos[removendo='1']"), false)

  $(".remover_fotos[removendo='1']").removeAttr("removendo")

  if (id_ativo == $(this).attr("id")) {
    $(this).html(`<i class="fa-solid fa-trash-can"></i> Excluir Fotos Enviadas`)
    return
  }
  alterarEstadoImagens($(this), true)
  $(this).html(`<i class="fa-solid fa-trash-can"></i> Excluindo...`)
  $(this).attr("removendo", 1)

})
$("body").on("click", ".file_crlv_father[remover_ao_clicar='1']", function () {

  let target_row = $(".remover_fotos[removendo='1']").attr("files_father")
  let id_file = $(this).attr("id")
  let teste = files_uploaded[target_row].filter(e => e.id != id_file.replace("file_", ""))
  files_uploaded[target_row] = teste
  $(this).remove()
  if ($("#" + target_row).children().length == 0) {
    $(".remover_fotos[removendo='1']").html(`<i class="fa-solid fa-trash-can"></i> Excluir Fotos Enviadas`)
    $(".remover_fotos[removendo='1']").removeAttr("removendo")

  }
})
$.post("/MeusProcessos/selectClientes", {}, (ret) => {
  let source = []
  clientes = ret.clientes
  ret.clientes.forEach(element => {
    source.push({ label: element.nome, value: { id: element.id, path: JSON.stringify(element.caminhos) } })
  });
  $("#select_cliente").autocomplete({
    source,
    select: function (e, ui) {
      e.preventDefault()
      $("#select_cliente").val(ui.item.label)
      $("#id_cliente_selecionado").val(ui.item.value.id)
      loadClientImages(JSON.parse(ui.item.value.path))
      $.post("/MeusProcessos/selectCliente", { id_cliente: ui.item.value.id }, (ret) => {

        $(".whatsapp").text(ret.cliente.tel)
        $(".cpf").text(ret.cliente.cpf)
        $(".loading_clientes").css("display", "none")
        $(".infos_cliente").css("display", "flex")
      })
    },
    focus: function (e, ui) {
      e.preventDefault()


    }
  })
})
$("#status_processo_criado").append(gerarStatusOptions(0))
$("#status_processo_criado").on("click", "option", function () {
  console.log($(this))
  $("#status_processo_criado").attr("style", $(this).attr("style"))
})
$("#status_processo_criado").attr("style", $("#status_processo_criado").find("option").attr("style"))

function loadClientImages(array) {
  let jsonArray = JSON.parse(array)
  console.log(jsonArray)
  jsonArray.forEach(element => {
    console.log(element)
    if (element !== null) {

      if (element.includes("pdf")) {
        $(".info_cliente_father .imagens_father").append(`
      <div class="cliente_image_father">
      <i class="fa-regular fa-file-pdf"></i>
      <span>${element}</span>
      </div>
      `)
      } else {
        $(".info_cliente_father .imagens_father").append(`
      <div class="cliente_image_father">
      <img src="../uploads/imagens_clientes/${element}" />
      <span>${element}</span>
      </div>
      `)
      }
    }


  });
}
$("#modal_add_processo").submit(function (e) {
  e.preventDefault()
  // Crie um novo objeto FormData
  var formData = new FormData();

  // Adicione os dados à FormData
  formData.append('clientId', $("#id_cliente_selecionado").val());
  formData.append('nomeProcesso', $("#nome_processo_add").val());
  formData.append('status', $("#status_processo_criado").val());
  formData.append('placa', $("#placa_processo").val());

  // Adicione o arquivo .zip
  var files = files_uploaded;
  Object.keys(files).forEach(element => {
    files[element].forEach(e => {
      console.log(e.files)
      let file = e.files
      let fileName = file.name.split(".")[0]
      fileName = fileName.replace(/ /g, "_")
      console.log(fileName)
      formData.append(element + "|_|_|" + fileName, file);

    })
  });
  // Faça a requisição AJAX usando jQuery
  const xhr = new XMLHttpRequest();
  let path = "/MeusProcessos/insertProcesso"
  if ($("#editando_processo").val() === "true") {
    path = "/MeusProcessos/updateProcesso"
    formData.append('id_processo', $("#editando_processo").attr("id_processo"));
  }
  xhr.open("POST", path, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Handle successful response from the server
        console.log('Files uploaded successfully!');
        files_uploaded = []
        $("#modal_add_processo").trigger("reset")
        $(".loading_clientes").css("display", "flex")
        $(".infos_cliente").css("display", "none")
        $(".file_crlv_father").remove()
        if ($("#editando_processo").val() === "true") {
          alertar("Processo atualizado com sucesso!", "Sucesso", "500px", "fa-regular fa-square-check", {
            button: {
              text: "ok",
              action: () => {
                location.reload()
              }
            }
          })


        } else {
          alertar("Processo atualizado com sucesso!", "Sucesso", "500px", "fa-regular fa-square-check")

        }
      } else {
        // Handle error response from the server
        console.error('Failed to upload files.');
        alert("Error occurred during file upload. Please try again.");
      }
    }
  };
  xhr.send(formData);
})
$("#table_processos tbody").on("click", ".editar_processo", function (ret) {
  files_uploaded = []
  $(".edit_info").css("diplay", "block")
  $("#editando_processo").val(true)
  $("#editando_processo").attr("id_processo", $(this).attr("id_processo"))
  $("#modal_add_processo").css("display", "flex")
  $.post("/MeusProcessos/selectProcesso", { idProcesso: $(this).attr("id_processo") }, ret => {
    let infoProcesso = ret.processo
    $(".data_criacao").text(moment(infoProcesso.criacao).format('DD/MM/YYYY HH[h]mm[min]'))
    $(".ult_atualizacao").text(moment(infoProcesso.atualizacao).format('DD/MM/YYYY HH[h]mm[min]'))
    console.log(infoProcesso)
    $("#nome_processo_add").val(infoProcesso.nome_processo)

    let cliente = clientes.filter(e => e.id == infoProcesso.id_cliente)[0]

    $("#id_cliente_selecionado").val(cliente.id)
    $("#select_cliente").val(cliente.nome)
    $("#placa_processo").val(infoProcesso.placa_carro)
    loadClientImages(cliente.caminhos)
    $("#status_processo_criado").val(infoProcesso.status)
    $("#status_processo_criado").attr("style", $("#status_processo_criado").find("option[value='" + infoProcesso.status + "']").attr("style"))
    $.post("/MeusProcessos/selectCliente", { id_cliente: cliente.id }, (ret) => {
      $(".whatsapp").text(ret.cliente.tel)
      $(".cpf").text(ret.cliente.cpf)
      $(".loading_clientes").css("display", "none")
      $(".infos_cliente").css("display", "flex")
    })
    JSON.parse(infoProcesso.arquivos_processos).forEach((e) => {
      let id = makeid(6)
      let fileInfoArray = e.split("|^|^|")
      let fileName = fileInfoArray[0]
      let row = fileInfoArray[1]


      if (e.includes("pdf")) {
        $("#" + row).append(`
          <div id="file_${id}" class="file_crlv_father"> <div class="file_crlv"><i class="fa-regular fa-file-pdf"></i>
                       
                        </div> <span>${fileName}</span>  </div>
    
            `)
      } else {
        $("#" + row).append(`
        <div id="file_${id}" class="file_crlv_father"> <div class="file_crlv"><img src="../uploads/imagens_processos/cliente_${cliente.id}/${infoProcesso.id}/${fileName}" />  
                       
                        </div> <span>${fileName}</span>  </div>
    
            `)
      }
      if (files_uploaded[row] === undefined) {
        files_uploaded[row] = []
      }
      fetchFileContent(`../uploads/imagens_processos/cliente_${cliente.id}/${infoProcesso.id}/${fileName}`)
        .then(blob => {
          console.log('Conteúdo do arquivo:', blob);
          // Aqui você pode fazer o que quiser com o blob, como criar um objeto File ou usá-lo diretamente
          files_uploaded[row].push({
            "id": id,
            "files": createFileObjectFromExistingFile(blob, fileName)
          })
        })
        .catch(error => {
          console.error('Erro ao obter o conteúdo do arquivo:', error);
        });

    })
    console.log(files_uploaded)
  })
})
function createFileObjectFromExistingFile(existingFile, name) {
  // Cria um novo objeto File
  console.log(existingFile)
  var newFile = new File([existingFile], name, { type: existingFile.type });

  return newFile;
}
function fetchFileContent(filePath) {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao fazer a requisição');
      }
      return response.blob();
    });
}
function gerarSelectMeses(anoSelecionado = null, mesSelecionado = null) {
  var select = $('#selectMeses');
  let diferencaAnos = 5
  let anoAtual = new Date().getFullYear();
  let mesAtual = new Date().getMonth();
  let anoAlvo = anoAtual
  if (anoSelecionado != null) {
    select.selectmenu("destroy")
    $("#selectMeses").html("")
    let anoDesejado = parseInt(anoSelecionado)
    anoAlvo = anoDesejado
    diferencaAnos = anoAtual - anoDesejado + 5
    mesAtual = parseInt(mesSelecionado)
  }
  let meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  for (let i = 0; i < diferencaAnos; i++) {
    console.log(i)
    let anoAnterior_2 = anoAtual - i;
    let optgroupAtual = $('<optgroup label="' + anoAnterior_2 + '"></optgroup>');

    for (let e = 0; e < 12; e++) {

      if (e == mesAtual && anoAnterior_2 == anoAlvo) {
        optgroupAtual.append('<option selected value="' + anoAnterior_2 + '_' + (e + 1).toString().padStart(2, '0') + '">' + meses[e] + '</option>');
      } else {
        optgroupAtual.append('<option value="' + anoAnterior_2 + '_' + (e + 1).toString().padStart(2, '0') + '">' + meses[e] + '</option>');

      }
    }
    select.append(optgroupAtual);
  }


  select.selectmenu({
    select: function (event, ui) {
      let data_separada = $('#selectMeses').val().split("_")
      let mes = data_separada[1]
      let ano = data_separada[0]
      let completo = mes + "/" + ano[2] + ano[3]
      if (event.altKey) {
        gerarSelectMeses(ano, mes)
        $('#selectMeses').selectmenu("open")
        $("#selectMeses-menu").animate({ scrollTop: $("#selectMeses-menu").children().length * 27 }, 1000);
        return
      }
      console.log("selec")

      $(".title_father h2 strong").text(`do Mês ${completo}`)
      let data = ano + "-" + mes

      processos_filtrados = buscar($("#buscar_processos"), attr_obj.processos, "nome_processo").filter(e => {
        let data_explodida = e.criacao.split("-")
        let data_separada = $('#selectMeses').val().split("_")
        let mes = data_separada[1]
        let ano = data_separada[0]
        let data = ano + "-" + mes
        let data_db = data_explodida[0] + "-" + data_explodida[1]


        if (data_db == data) {
          return true
        }
      })
      createProcessTable(processos_filtrados)
    }
  });
}

gerarSelectMeses()
$("#ordenar_processo_name").click(async function () {
  processos_filtrados = processos_filtrados.sort(function (a, b) {
    if (a.nome_processo.localeCompare(b.nome_processo) == 0) {
      return -1;
    }
    if (a.nome_processo.localeCompare(b.nome_processo) == 1) {
      return 1;
    }
    return 0;
  })
  inverterTabela($(this))


})
function inverterTabela(elemento) {
  $("#table_processos table thead tr td i").remove()
  $("#order_by_text").text($(elemento).text())
  
  if ($(elemento).attr("ordem") == "1") {
    $(elemento).attr("ordem", 0)
    $(elemento).html('<i class="fa-solid fa-chevron-up"></i>' + $(elemento).text())
    createProcessTable(processos_filtrados)
  } else {
    $(elemento).attr("ordem", 1)
    $(elemento).html('<i class="fa-solid fa-chevron-down"></i>' + $(elemento).text())

    createProcessTable(processos_filtrados.reverse())
  }
}
$("#ordenar_processo_cliente").click(function () {
  processos_filtrados = processos_filtrados.sort(function (a, b) {
    if (a.nome_cliente.localeCompare(b.nome_cliente) == 0) {
      return -1;
    }
    if (a.nome_cliente.localeCompare(b.nome_cliente) == 1) {
      return 1;
    }
    return 0;
  })
  inverterTabela($(this))

})
$("#ordenar_processo_atualizacao").click(function () {
  processos_filtrados = processos_filtrados.sort(function (a, b) {
    if (a.atualizacao < b.atualizacao) {
      return 1;
    } else if (a.atualizacao > b.atualizacao) {
      return -1;
    } else {
      return 0;
    }
  })
  console.log(processos_filtrados)
  inverterTabela($(this))
})
$("#ordenar_processo_criacao").click(function () {
  processos_filtrados = processos_filtrados.sort(function (a, b) {
    if (a.criacao < b.criacao) {
      return 1;
    } else if (a.criacao > b.criacao) {
      return -1;
    } else {
      return 0;
    }
  })
  console.log(processos_filtrados)
  inverterTabela($(this))
})
$("#modal_add_status .status_father").on("click", "button", function (e) {
  console.log($(this).attr("id_status"))
  $(".status_father button").removeClass("selected")
  $(this).addClass("selected")
  let status = attr_obj.status.filter(e => e.id == $(this).attr("id_status"))[0]
  console.log(status)
  $("#delete_status").parent().html('  <i id="delete_status_pre" class="fa-regular fa-trash-can"></i> ')
  $("#delete_status").attr("id","delete_status_pre")

  $("#id_status").val(status.id)
  $("#nome_status").val(status.nome)
  $("#cor_status").val(status.cor)
  $("#mensagem_status").val(status.mensagem)
})
$("#modal_add_status #left_side span").click(function (e) {
  $(".status_father button").removeClass("selected")
  $("#modal_add_status input[type='text']").val("")
  $("#modal_add_status input[type='color']").val("#000000")
  $("#id_status").val(0)
  $("#delete_status").parent().html('  <i id="delete_status_pre" class="fa-regular fa-trash-can"></i> ')
  $("#delete_status").attr("id","delete_status_pre")

  $("#modal_add_status textarea").val("")

})
$("#modal_add_status").submit(function (e) {
  e.preventDefault()
  let data = {
    "cor": $("#cor_status").val(),
    "status": $("#nome_status").val(),
    "mensagem": $("#mensagem_status").val()
  }
  let alvo = "insertStatus"
  if ($("#id_status").val() != 0) {
    alvo = "updateInfoStatus"
    data["id_status"] = $("#id_status").val()
  }
  $.post("/MeusProcessos/" + alvo, data, (ret) => {
    attr_obj = JSON.parse(ret.newObject)
    createStatusButton(attr_obj.status)
    $("#modal_add_status #left_side span").click()
    processos_filtrados = buscar($("#buscar_processos"), attr_obj.processos, "nome_processo").filter(e => {
      let data_explodida = e.criacao.split("-")
      let data_separada = $('#selectMeses').val().split("_")
      let mes = data_separada[1]
      let ano = data_separada[0]
      let data = ano + "-" + mes
      let data_db = data_explodida[0] + "-" + data_explodida[1]


      if (data_db == data) {
        return true
      }
    })
    createProcessTable(processos_filtrados)   

  })
})
$(".buttons_variables button").click(function () {
  let variable = "{" + $(this).text().replace(/ /g, "_") + "}"
  console.log(variable)
  $("#mensagem_status").val($("#mensagem_status").val() + " " + variable + " ")
})
let data_atual = new Date()
let mesAtual = data_atual.getMonth() + 1
let anoAtual = data_atual.getFullYear()
$("#selectMeses").val(anoAtual + "_" + mesAtual.toString().padStart(2, '0'))
$("body").on("click","#delete_status_pre",function(){
  $(this).attr("id","delete_status")
  $(this).parent().html(" Clique na lixeira para confirmar :" + $(this).parent().html())
})
$("body").on("click","#delete_status",function(){
  let data = {
    id_status :  $("#id_status").val()
  }
  $.post("/MeusProcessos/deleteStatus",data,function(ret){
    $("#modal_add_status #left_side span").click()

    console.log(ret)
    attr_obj = JSON.parse(ret.newObject)
    createStatusButton(attr_obj.status)
    processos_filtrados = buscar($("#buscar_processos"), attr_obj.processos, "nome_processo").filter(e => {
      let data_explodida = e.criacao.split("-")
      let data_separada = $('#selectMeses').val().split("_")
      let mes = data_separada[1]
      let ano = data_separada[0]
      let data = ano + "-" + mes
      let data_db = data_explodida[0] + "-" + data_explodida[1]


      if (data_db == data) {
        return true
      }
    })
    createProcessTable(processos_filtrados)  
  })
})