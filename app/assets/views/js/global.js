let menuAberto = false
let notificacoesAbertas = false
let notifyWithSound = false

$("#notifications_body").css({ 'display': 'none' });

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
  $("#attributes").remove()
})
function fecharModal() {
  $("fundo").css("display", "none")
  $(".modal").css("display", "none")
  $("main").css("overflow-y", " scroll")

}
function abrirModal(modal) {
  $("#" + modal).css("display", "flex")
  $("fundo").css("display", "flex")
  let y = $("#" + modal).offset().top
  $("html").scrollTop(y);

  $("main").css("overflow-y", " hidden")


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
setTimeout(()=>{
$('.img_father').trigger('mouseenter.zoom')  
},100)

});

