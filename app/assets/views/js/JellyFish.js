
function enviarMensagemModal(mensagem, numero,arquivo= false) {
  let contentModal = 'A mensagem: <br/><br/>"' + mensagem + '" <br/><br/>  Será enviada para o número: '+numero
  if(arquivo !== false){
    contentModal = 'O arquivo: <br/><br/> "'+arquivo+'"<br/><br/> E a mensagem:<br/><br/>  "' + mensagem + '"<br/><br/> Será enviada para o número: '+numero
  }
  $.confirm({
    title: "Confirmar Envio de Mensagem ",
    content: contentModal,
    boxWidth: '500px',
    useBootstrap: false,
    buttons: {
      Enviar: {
        text: "Enviar",
        btnClass: 'btn-red',
        action: function() {
          sendMessage( numero,mensagem,arquivo)
        }
      },
      Cancelar: function() {}
    },

  })
}
async function sendMessage(number,text,caminhoArquivoDesejado = false){
    let conectado = await verificarConexaoWhatsapp()
    if(!conectado){
        alertar("Impossível enviar Mensagem, Whatsapp desconectado","ERRO!!")
        return
    }
    let caminhoArquivo = caminhoArquivoDesejado;
    // let caminhoArquivo = 'app/assets/views/uploads/contratos/cliente_15/contrato_26/Teste Oficial_Luis Gustavo.pdf';
    let emptyFile = null
    fetchFileContent(`../zip/zipVazio.zip`)
      .then(blob => {
        console.log('Conteúdo do arquivo:', blob);
        // Aqui você pode fazer o que quiser com o blob, como criar um objeto File ou usá-lo diretamente
        emptyFile = createFileObjectFromExistingFile(blob, "zipVazio")

      })
      .catch(error => {
        console.error('Erro ao obter o conteúdo do arquivo:', error);
      });

    // Crie uma nova requisição XMLHttpRequest para buscar o conteúdo do arquivo
    let xhr = new XMLHttpRequest();
    let nome_arquivo =""
    if(caminhoArquivo !== false){
       nome_arquivo = caminhoArquivo.split("/")[parseInt(caminhoArquivo.split("/").length) - 1]

    }
    xhr.open('GET', caminhoArquivo, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (xhr.status === 200) {
        // Arquivo baixado com sucesso

        let blob = xhr.response;
        // Crie um novo objeto de tipo de arquivo
        let arquivo = new File([blob], nome_arquivo.replace(/_/g," "), { type: 'application/pdf'});
    console.log(arquivo)

  
        let formData = new FormData();
        formData.append('file', emptyFile); // Adiciona o arquivo
        console.log(number)
        console.log(text)
        formData.append('infoObjects', JSON.stringify([{ "number":number, "text": text.replace(/``/g,'"').replace(/`/g,"'")  }])); // Adiciona o arquivo
    if(caminhoArquivo !== false){
        formData.append('documento_padrao', arquivo); // Adiciona o arquivo
    }
        formData.append('clientId',  $("#cliente").val() +"_rvMultas"); // Adiciona o text
        // Faça a requisição AJAX usando jQuery
        $.ajax({
          url: "http://localhost:3030/sendFiles", // URL do seu endpoint
          type: 'POST',
          data: formData,
          processData: false, // Não processar os dados (o FormData já está no formato correto)
          contentType: false, // Não defina o tipo de conteúdo (o navegador irá definir automaticamente como 'multipart/form-data')
          success: function(response) {
            console.log('Resposta do servidor:', response);
            sucesso = true;
 
          },
          error: function(xhr, status, error) {
            alert("Erro ao imprimir, verifique se a porta do sistema e do Octopus XML Printer");

          }
        });

      } else {
        console.error('Erro ao baixar o arquivo:', xhr.statusText);
        reject('Erro ao baixar o arquivo');
      }
    };

    xhr.onerror = function() {
      console.error('Erro de rede');
      reject('Erro de rede');
    };
    // Envie a requisição para baixar o arquivo
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
}
async function verificarConexaoWhatsapp() {
    let conectado = await new Promise((resolve, reject) => {
      $.post("http://localhost:3030/verifyConnection", { clientId:   $("#cliente").val() +"_rvMultas"}, (ret) => {
        $("#conectarWhatsapp").html('<i class="fa-regular fa-circle-check"></i> Whatsapp Conectado ')
        resolve(true)
      }).fail(function () {
        $("#conectarWhatsapp").html('<i class="fa-brands fa-whatsapp"></i> Conectar Whatsapp')
        resolve(false)
  
      })
    })
    return conectado
  }
  $("#conectarWhatsapp").on("click", function () {
    $("#conectarWhatsapp").html('<i class="fa-solid fa-spinner fa-spin"></i> Gerando Seu QRCode')
    gerarQRCodeCaller()
  
  })
  function gerarQRCodeCaller() {
    $.post("/RVMultas/getQrCode", {id_cliente:  $("#cliente").val() +"_rvMultas"}, function (ret) {
      console.log("a")
      console.log(ret)
      gerarQRCode("Escaneie pelo Whatsapp para se conectar", ret.data)
    })
  }