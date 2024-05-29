let attr_obj = JSON.parse(attributes.value).processos
let infoCliente = JSON.parse(attributes.value).cliente
let allinfo = JSON.parse(attributes.value)
var id_cliente_global =JSON.parse(attributes.value).id_cliente

console.log(JSON.parse(attributes.value))

function confirmarSolicitarProcesso(){
  let tamnhoModal = $(window).window >=500 ? "500px" : "90%";
  let numeroTelCliente = infoCliente.tel.replace(/[ ]|-|\(|\)+/g,"")

  $.confirm({
    title: 'Confirmação',
    content: 'Tem certeza que deseja solicitar um Processo? Se sim clique em "SOLICITAR".',
    boxWidth: tamnhoModal,
    useBootstrap: false,
    buttons: {
      Solicitar: {
        text: 'Solicitar',
        btnClass: 'btn-red',
        
        action: function() {
          let data = {
            titulo:"Solicitação de Processo!",
            mensagem:`O cliente <a target="_blank" href="https://wa.me/${numeroTelCliente}?text=Ol%C3%A1+${infoCliente.nome}%2C+vi+que+solicitou+um+processo%2C+poderia+me+dar+mais+informa%C3%A7%C3%B5es+sobre+a+situa%C3%A7%C3%A3o%3F">${infoCliente.nome}</a> está solicitando um processo, clique no nome nessa notificação para entrar em contato com ele para mais detalhes.`,
            permissao_alvo:2,
            id_criador:allinfo.id_cliente,
            id_processo:0,
            id_contrato:0
          }
          $.post("/RVMultas/insertNotificacao",data,function(){
            abrirModal("processosolicitado")
          })
        }
      },
      Cancelar: function() {
  
      }
    }
  })
}

$.post("/ProcessosCliente/selectContratosPendentes",{},(ret)=>{
  let tamnhoModal = $(window).window >=500 ? "500px" : "90%";
  console.log(ret.contratos)
console.log(ret)
if(ret.contratos !== undefined){
  const code = ret.contratos.id_contrato.toString()
  const secretKey = 'G4l01313'; // Use uma chave segura
  // Criptografar o código

let encrypted = CryptoJS.AES.encrypt(code, secretKey).toString().replace(/\+/g,"|||");
console.log(encrypted)

  $.confirm({
  title: 'ALERTA !',
  content: 'Contrato Pendente, clique em "Assinar Agora" para assina-lo.',
  boxWidth: tamnhoModal,
  useBootstrap: false,
  buttons: {
    Solicitar: {
      text: 'Assinar Agora',
      btnClass: 'btn-red',
      
      action: function() {
        location.href = "/AssinarContrato?token="+encrypted+"&client_id="+ret.contratos.id_cliente
      }
    },
    Cancelar: function() {

    }
  }
})
}

})
let  files_uploaded = []
function loadClientImages(array) {
  $(".info_cliente_father .imagens_father").html("")
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
      <img src="../uploads/imagens_clientes/cliente_${$("#id_cliente_selecionado").val()}/${element}" />
      <span>${element}</span>
      </div>
      `)
      }
    }


  });
}
$("#cards_father").on("click", ".edit_info", function (ret) {
  files_uploaded = []
  
  $(".edit_info").css("diplay", "block")
  $("#editando_processo").val(true)
  $("main").scrollTop(0);
  $("main").css("overflow-y", " hidden")

  $("#editando_processo").attr("id_processo", $(this).attr("id_processo"))
  $("#modal_add_processo").css("display", "flex")
  $.post("/ProcessosCliente/selectProcesso", { idProcesso: $(this).attr("id_processo") }, ret => {
    let infoProcesso = ret.processo
    console.log(infoProcesso)
    $(".data_criacao").text(moment(infoProcesso.criacao).format('DD/MM/YYYY HH[h]mm[min]'))
    $(".ult_atualizacao").text(moment(infoProcesso.atualizacao).format('DD/MM/YYYY HH[h]mm[min]'))
    console.log(infoProcesso)
    $("#nome_processo_add").val(infoProcesso.nome_processo)

    let cliente = infoCliente

    $("#id_cliente_selecionado").val(cliente.id)
    $("#select_cliente").val(cliente.nome)
    $("#placa_processo").val(infoProcesso.placa_carro)
    loadClientImages(cliente.caminhos)
    $("#status_processo_criado").append(`<option style="color:${infoProcesso.cor};" value="${infoProcesso.status_nome}">${infoProcesso.status_nome}</option>`)
    $("#status_processo_criado").attr("style", $("#status_processo_criado").find("option[value='" + infoProcesso.status_nome + "']").attr("style"))
      $(".whatsapp").text(cliente.tel)
      $(".cpf").text(cliente.cpf)
      $(".loading_clientes").css("display", "none")
      $(".infos_cliente").css("display", "flex")
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
function createCards(array, status = null) {
    console.log(array)
    let new_array = array
    // if (status != null) {
    //     new_array = array.filter((obj) => obj.status == status)
    // }
    $("#cards_father").html("")
    new_array.forEach(element => {
      let data = new Date(element.atualizacao);
      let dia = data.getDate();
      let mes = data.getMonth() + 1;
      dia = dia < 10 ? '0' + dia : dia;
      mes = mes < 10 ? '0' + mes : mes;
      let ano = data.getFullYear();
      let dataFormatada = dia + '/' + mes + '/' + ano;
      $("#cards_father").append(`
      <div class="card"><div class="name_header_card"><h4>${element.nome_processo} </h4>
        </div><div>
        <red>Status:</red>
        <span>${element.nome}</span>
      </div><div>
        <red>Última Atualização:</red>
        <span>${dataFormatada}</span>
      </div><div>
        <red>Placa Veículo:</red>
        <span>${element.placa_carro}</span>
      </div>
      <a id_processo="${element.id}"  class="edit_info">Ver Mais Informações</a>
    </div>`)
    });
  }
createCards(attr_obj)
$("#buscar_clientes_processos").change(function(){
let processos_filtrados =buscar($(this), attr_obj, "nome_processo")
createCards(processos_filtrados)
})

