let menuAberto = false
let notificacoesAbertas = false
let notifyWithSound = false
let showWhatsapp = true
$("#notifications_body").css({ 'display': 'none' });
$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return results[1] || 0;
}
$("#notificacoes").click(function () {

  $("#notifications_body").animate({ 'width': 'toggle' });

  notificacoesAbertas = !notificacoesAbertas
})
function playNotify() {
  var beep = new Audio('./audios/new-notification-7-210334.mp3');
  beep.play();
}
$(function () {
  $(document).tooltip({
    content: function () {
      return $(this).prop('title');
    }
  });
});
$("body").on("click", ".ler_mensagem ", function () {
  $.post("/RVMultas/lerNotificacao", { id_notificacao: $(this).attr("id_notificacao") }, (ret) => {
    selectNotificacoes(true, false)
  })
})
function selectNotificacoes(firstTime = false, playAudio = false) {
  $.post("/RVMultas/getNotificacoes", {}, (ret) => {
    console.log(ret.notificacoes)
    let quantidadeNotificacoesNovas = ret.notificacoes.filter(e => e.vista === 0).length
    if (quantidadeNotificacoesNovas != 0) {
      $("#notificacoes").attr("class", "fa-regular fa-bell fa-bounce")

      if (playAudio) {
        playNotify()
        $("#notificacoes").css("color", "#ffa700;")
      } else {
        $("#notificacoes").css("color", "#5a0001;")

      }
      if (!firstTime) {
        $("#notifications_body").html("")

        ret.notificacoes.forEach(e => {
          let icon = e.vista == 0 ? `<i id_notificacao="${e.id}" title="Mensagem Não Lida, Clique no <i class='fa-regular fa-clock'></i> para Confirmar Leitura." class="ler_mensagem fa-regular fa-clock"></i>` : `<i class="fa-solid fa-check-double"></i>`;
          $("#notifications_body").append(`
       <div class="notification">
          <li>  ${icon} ${e.titulo}</li>
          <p>${e.mensagem}</p>
        </div>
      `)
        })
      }
    } else {
      $("#notificacoes").attr("class", "fa-regular fa-bell")
      $("#notificacoes").css("color", "#373737")
    }
    if (firstTime) {
      $("#notifications_body").html("")

      ret.notificacoes.forEach(e => {
        let icon = e.vista == 0 ? `<i id_notificacao="${e.id}" title="Mensagem Não Lida, Clique no <i class='fa-regular fa-clock'></i> para Confirmar Leitura." class="ler_mensagem fa-regular fa-clock"></i>` : `<i class="fa-solid fa-check-double"></i>`;
        $("#notifications_body").append(`
       <div class="notification">
       <div class="header_notification">

          <li>  ${icon} ${e.titulo}</li>
          <span>${formatarDatetime(e.data_criacao)}</span>
          </div>
          <p>${e.mensagem}</p>
        </div>
      `)
      })
    }

  })
}
selectNotificacoes(true, true)
setInterval(() => {
  selectNotificacoes(false, notifyWithSound)
  notifyWithSound = !notifyWithSound
}, 30000)


$("#open_menu").click(function () {
  if (menuAberto) {
    $("#sidebar").animate({ "height": "0" }, 500, function () {
      $("#sidebar").css({ "display": "none" })
    })
    $("#sidebar").animate({ "padding": "0" }, 100)

  } else {
    $("#sidebar").css({ "display": "flex" })
    $("#sidebar").animate({ "padding-top": "10px" }, 100)
    $("#sidebar").animate({ "height": "160px" }, 500)

  }
  menuAberto = !menuAberto
})
if (Cookies.get('login') === undefined && location.href.includes("Login")) {
  // location.href="Login"
  $("#login_cliente_button").css("display", "block")

  if ($(window).width() <= 600) {
    $("#open_menu").css("display", "none")
  }
  if (Cookies.get('permissao') == 1) {
    location.href = "ProcessosCliente"
  } else if (Cookies.get('permissao') >= 2) {
    location.href = "MeusClientes"

  }

}
const isMobile = () =>
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
    navigator.userAgent.substr(0, 4))
if (Cookies.get('permissao') >= 2) {
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = function () {
  
    console.log('WebSocket connection established');
   
  };
  socket.onmessage = async function (event) {
    console.log(await event)
    let message = JSON.parse(await event.data)
    if (message.evento == "CLIENTE_CONECTADO") {
      $(".jconfirm ").remove()
      alertar("Whatsapp Conectado", "Sucesso !")
    } else if (message.evento == "QRCODE_ATUALIZADO") {
      $(".jconfirm ").remove()
      gerarQRCode("Escaneie pelo Whatsapp para se conectar", message.data.qrCode)
    }
    verificarConexaoWhatsapp()
  };

}else{
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = function () {
    socket.send("sdawda")
    console.log('WebSocket connection established');
  

   
  };
  socket.onmessage = async function (event) {

    let message = JSON.parse(await event.data)
    if (message.evento == "ASSINATURA_CONCLUIDA") {
        if((message.token == $.urlParam("token"))){
          if(isMobile()) { 
          location.reload()
          }
        }
    }

  };
}
if ($(window).width() <= 600) {
  $("#demo-container").remove()
}

if (location.href.includes("Login")) {
  $("#sidebar").remove()
  $("main").css({ "width": "100%", "margin-left": "0" })

}
function formatarDatetime(data) {
  const date = new Date(data);  // Exemplo de data
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
  });

  const dateString = dateFormatter.format(date);

  // Obter a parte da hora
  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',  // Adicione o fuso horário se necessário
  });

  const timeString = timeFormatter.format(date);

  // Ajustar o formato da hora para incluir 'h'
  const formattedTime = timeString.replace(':', 'h');

  // Concatenar data e hora no formato desejado
  const finalFormattedDateTime = `${dateString} ${formattedTime}`;
  return finalFormattedDateTime;
}
function copiarTexto(element) {
  // Get the text field
  if (typeof element === "string") {
    navigator.clipboard.writeText(element);

  } else {
    navigator.clipboard.writeText($(element).text());

  }
  // Copy the text inside the text field

  // Alert the copied text
}
function destroySession() {
  Cookies.remove("login")
  Cookies.remove("permissao")
  Cookies.remove("id_cliente")
  location.reload()
}
function formatarData(target_data) {
  let data = new Date(target_data);
  let dia = data.getDate();
  let mes = data.getMonth() + 1;
  dia = dia < 10 ? '0' + dia : dia;
  mes = mes < 10 ? '0' + mes : mes;
  let ano = data.getFullYear();
  let dataFormatada = dia + '/' + mes + '/' + ano;
  return dataFormatada

}
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
$(document).ready(function () {
  $(".loading").css("display", "none")
  let id_page = $(location).attr("pathname").replace(/%20/g, "").toLowerCase().replace(/\//g, "")
  if (id_page == "") {
    id_page = "meusclientes"
  }
  $("#" + id_page).addClass("selected_page")
  var attributes = $("#attributes").val()
  $("#cliente").val(JSON.parse(attributes).id_cliente)
  if (Cookies.get('login') !== undefined && Cookies.get('permissao') >= 2){
    verificarConexaoWhatsapp()

  }

  $("#attributes").remove()
})
function fecharModal() {
  $("fundo").css("display", "none")
  $(".modal").css("display", "none")
  $("main").css("overflow-y", " scroll")

}
function abrirModal(modal) {
  $("#" + modal).css("display", "flex")
  $("main").scrollTop(0);

  $("fundo").css("display", "flex")

  $("main").css("overflow-y", " hidden")


}
shortcut.add("F1", () => {
  if(showWhatsapp){
    $("#conectarWhatsapp").css("display","none")

  }else{
  $("#conectarWhatsapp").css("display","flex")

  }
  showWhatsapp = !showWhatsapp
})

function formatarNumero(numero){
  let numeroFormatado = numero.replace(/\(|\)|-| /g,"")
  if(numeroFormatado.length == 11){
    console.log("s")
		numeroFormatado = numeroFormatado.substr(0, 2) +numeroFormatado.substr(3, 10) 
  }
  return "+55"+numeroFormatado 
}
function gerarQRCode(titulo, texto) {
  $.confirm({
    title: titulo,
    boxWidth: '500px',
    useBootstrap: false,
    buttons: {
      Cancelar: function () {
      }
    },
    content: `
      <div id="qrcode"></div>`,
    onContentReady: function () {
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: texto,
        width: 300,
        height: 300
      });

    }
  })


}
function buscar(DOMElement, target_array, target_key) {
  let termoDeBusca = $(DOMElement).val().toLowerCase();
  let new_array = target_array.filter(obj => removerAcentos(obj[target_key]).toLowerCase().includes(removerAcentos(termoDeBusca)));

  return new_array
}
function createFileObjectFromExistingFile(existingFile, name) {
  // Cria um novo objeto File
  console.log(existingFile)
  var newFile = new File([existingFile], name, { type: existingFile.type });

  return newFile;
}
window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
function fetchFileContent(filePath) {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao fazer a requisição');
      }
      return response.blob();
    });
}
let zoom = 1
$("body").on("click", "img", function () {
  console.log($(this).attr("sem_zoom"))
  if ($(this).attr("sem_zoom") === undefined && $(this).attr("class") != "zoomImg") {

    let src = $(this).attr("src")
    let nome_arquivo = src.split("/").slice(-1)[0]
    console.log(nome_arquivo)
    document.getElementById("modal_zoom_imagem").addEventListener('contextmenu', event => {
      event.preventDefault();
    });
    $("#modal_zoom_imagem .img_father").html(`
    <img sem_zoom='true' id='img_zoomed' src="${src}">
    `)
    $('.img_father').zoom({ magnify: zoom, touch: true });

    $(".zoomImg").attr("sem_zoom", true)
    $("#modal_zoom_imagem ").css("display", "flex")
    // $("#img_zoomed").ezPlus({ responsive: true, scrollZoom: true })
    $("fundoIMG ").css("display", "flex")
    $("#modal_zoom_imagem span").text(nome_arquivo)
  }
})

$('body').on("mousedown", ".img_father", function (event) {
  event.preventDefault()
  $('.img_father').trigger('zoom.destroy');
  switch (event.which) {
    case 1:
      let zoomPlusTarget = zoom + 0.5 > 4 ? 4 : zoom + 0.5;
      zoom = zoom == 4 ? 4 : zoom + 0.5
      $('.img_father').zoom({ magnify: zoomPlusTarget, touch: true });
      break;
    case 3:
      $('.img_father').trigger('zoom.destroy');
      let zoomMinusTarget = zoom - 0.5 <= 0.5 ? 0.5 : zoom - 0.5;
      zoom = zoom == 0.5 ? 0.5 : zoom - 0.5
      $('.img_father').zoom({ magnify: zoomMinusTarget, touch: true });

      break;

  }
  setTimeout(() => {
    $('.img_father').trigger('mouseenter.zoom')
  }, 100)

});

