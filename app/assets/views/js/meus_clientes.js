console.log(attributes)
var id_cliente_global =JSON.parse(attributes.value).id_cliente

let files_uploaded = []
function resetInsertCliente(){
  files_uploaded = []
  $("#modal_adicionar_cliente input").val("")
  $("#images_clientes_father").html("")
}
let attr_obj = JSON.parse(attributes.value).clientes
$("#metrica_cliente red").text(JSON.parse(attributes.value).metricas[0]["quantidade"]+" Clientes")
function createCards(array, status = null) {
  let new_array = array
  // if (status != null) {
  //     new_array = array.filter((obj) => obj.status == status)
  // }
  $("#cards_father").html("")
  new_array.forEach(element => {
    let data = new Date(element.vencimento_cnh);
    let dia = data.getDate();
    let mes = data.getMonth() + 1;
    dia = dia < 10 ? '0' + dia : dia;
    mes = mes < 10 ? '0' + mes : mes;
    let ano = data.getFullYear();
    let dataFormatada = dia + '/' + mes + '/' + ano;
    $("#cards_father").append(`
    <div class="card"><div class="name_header_card"><h4>${element.nome} </h4>
    <i class="fa-regular fa-trash-can"></i>
      </div><div>
      <red>CNH:</red>
      <span>${element.cnh}</span>
    </div><div>
      <red>Data de Vencimento:</red>
      <span>${dataFormatada}</span>
    </div><div>
      <red>Total de Processos:</red>
      <span>${element.numero_processos} processos</span>
    </div>
    <a id_cliente="${element.id}" class="edit_info">Editar Informações</a>
  </div>`)
  });
}
createCards(attr_obj)
function removerAcentos(str) {
  const tabelaSubstituicao = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u',
    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A',
    'É': 'E', 'È': 'E', 'Ê': 'E',
    'Í': 'I', 'Ì': 'I', 'Î': 'I',
    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U'
  };
  return str.replace(/[áàãâéèêíìîóòõôúùûÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛ]/g, match => tabelaSubstituicao[match]);
}

// $("#filter_clientes button ").click(function () {
//     $(".selected_filter").removeClass("selected_filter")
//     $(this).addClass("selected_filter")
//     let status_requerido = $(this).attr("status")
//     if (status_requerido == "null") {
//         status_requerido = null
//     }
//     createCards(attr_obj, status_requerido)
// })
var options = {
  onKeyPress: function (cpfcnpj, e, field, options) {
    var masks = ['000.000.000-000', '00.000.000/0000-00'];
    var mask = (cpfcnpj.length > 14) ? masks[1] : masks[0];
    $('#cpf_cliente').mask(mask, options);
  }
};

$('#cpf_cliente').mask('000.000.000-000', options);
var options = {
  onKeyPress: function (tel, e, field, options) {
    var masks = ['(00) 0000-00000', '(00) 0 0000-00000'];
    console.log(tel.length)
    var mask = (tel.length > 14) ? masks[1] : masks[0];
    $('#tel_cliente').mask(mask, options);
  }
};

$('#tel_cliente').mask('(00) 0000-00000', options);
$('#cnh_cliente').mask('000000000-00');
$('#vencimento_cliente').mask('00/00/0000');

$("#buscar_clientes_processos").change(function () {
  createCards(buscar($(this), attr_obj, "nome"))
})

$("#fotos_documentos").change(function (event) {
  console.log(event.target.files)
  let files = event.target.files
  for (let index = 0; index < files.length; index++) {
    console.log(files[index])
    let file = files[index]
    let src = URL.createObjectURL(file)
    let id = makeid(6)
    $("#images_clientes_father").append(`
    <div class="image_father">
    <div id_image="${id}_${file.size}" class="delete_father">
    <i class="fa-regular fa-trash-can"></i>
    </div>
      <img src="${src}" alt="">
      <span>${file.name}</span>
    </div>
  `)
    if (files_uploaded === undefined) {
      files_uploaded = []
    }
    files_uploaded.push({
      "id": `${id}_${file.size}`,
      "files": file
    })
  }
})
$("body").on("mouseenter", ".image_father", function () {
  $(this).find(".delete_father").css("display", "flex")
})
$("body").on("mouseleave", ".image_father", function () {
  $(this).find(".delete_father").css("display", "none")
})
$("body").on("click", ".delete_father", function (e) {
  files_uploaded = files_uploaded.filter(e => e.id != $(this).attr("id_image"))
  console.log(files_uploaded)
  $(this).parent().remove()
})

$("#modal_adicionar_cliente").submit(function (event) {
  event.preventDefault()
  console.log("sdakl")
  var formData = new FormData();

  // Adicione os dados à FormData
  // Adicione o arquivo .zip
  var files = files_uploaded;
  formData.append("nome_cliente", $("#nome_cliente").val());
  formData.append("cnh_cliente", $("#cnh_cliente").val());
  formData.append("tel_cliente", $("#tel_cliente").val());
  formData.append("email_cliente", $("#email_cliente").val());
  formData.append("cpf_cliente", $("#cpf_cliente").val());
  formData.append("vencimento_cliente", $("#vencimento_cliente").val());

  files.forEach(e => {
    console.log(e.files)
    let file = e.files
    let fileName = file.name.split(".")[0]
    fileName = fileName.replace(/ /g, "_")
    console.log(fileName)
    formData.append(fileName, file);
  })

  const xhr = new XMLHttpRequest();
  let path = "/MeusClientes/insertCliente"
  if ($("#modal_adicionar_cliente").attr("id_cliente") != "0") {
    path = "/MeusClientes/updateCliente"
    formData.append("idCliente", parseInt($("#modal_adicionar_cliente").attr("id_cliente")));

  }
  xhr.open("POST", path, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Handle successful response from the server
        console.log('Files uploaded successfully!');
        let ret = JSON.parse(xhr.response)
        ret = JSON.parse(ret.newObject)
        attr_obj = ret.clientes
        createCards(attr_obj)
        fecharModal()
      } else {
        // Handle error response from the server
        console.error('Failed to upload files.');
        alert("Error occurred during file upload. Please try again.");
      }
    }
  };
  xhr.send(formData);
})
$("body").on("click", ".edit_info", function () {
  $("#modal_adicionar_cliente h3").html("Editar <strong>Cliente:</strong>")
  $("#modal_adicionar_cliente").attr("id_cliente", $(this).attr("id_cliente"))
  let idCliente = $(this).attr("id_cliente")
  $.post("/MeusClientes/selectCliente", { idCliente: idCliente }, ret => {
    console.log(ret)
    files_uploaded = []
    $("#images_clientes_father").html("")
    let cliente = ret.cliente
    $("#nome_cliente").val(cliente.nome)
    $("#email_cliente").val(cliente.email)
    $("#cnh_cliente").val($("#cnh_cliente").masked(cliente.cnh))
    $("#cpf_cliente").val(cliente.cpf)
    $("#tel_cliente").val(cliente.tel)
    $("#vencimento_cliente").val(formatarData(cliente.vencimento_cnh))
    JSON.parse(cliente.caminhos).forEach(e => {
      let path = `../uploads/imagens_clientes/cliente_${idCliente}/${e}`
      let id = makeid(6)
      let fileName = e
      console.log(path)
      $("#images_clientes_father").append(`
      <div class="image_father">
      <div id_image="${id}" class="delete_father">
      <i class="fa-regular fa-trash-can"></i>
      </div>
        <img src="${path}" alt="">
        <span>${e}</span>
      </div>
    `)
      if (files_uploaded === undefined) {
        files_uploaded = []
      }
      fetchFileContent(path)
        .then(blob => {
          console.log('Conteúdo do arquivo:', blob);
          // Aqui você pode fazer o que quiser com o blob, como criar um objeto File ou usá-lo diretamente
          files_uploaded.push({
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
  abrirModal("modal_adicionar_cliente")

})