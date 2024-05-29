let attr_obj = JSON.parse(attributes.value).contrato
var id_cliente_global =JSON.parse(attributes.value).id_cliente
let infoCliente = JSON.parse(attributes.value).cliente

var sketchpad = new Sketchpad({
    element: '#sketchpad',
    width:  $("#assinatura_father").width(),
    height:  $("#assinatura_father").width()*0.666,
  });
// var sketchpad = new Sketchpad({
//     element: '#sketchpad',
//     width:  $("#assinatura_father").width(),
//     height:  $("#assinatura_father").height() - 130,
//   });
  function canvasToFile() {
    var canvas = document.getElementById("sketchpad");
    var dataURL = canvas.toDataURL("image/png");
  
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
  
    var blob = dataURLtoBlob(dataURL);
    var file = new File([blob], "canvas_image.png", {type: "image/png", lastModified: new Date()});
    console.log(file);
  
    var formData = new FormData();
    formData.append("file", file);
  
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/AssinarContrato/saveAssinatura", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.status);
            console.log(xhr.responseText);
            $.post("/AssinarContrato/assinarContrato",{assinatura:""},(ret)=>{
                confirmarContratoAssinado()
            })
        }
    }
    xhr.send(formData);
  }

  function assinarContratoDigitando(){
    $.confirm({
        title: 'Escreva sua assinatura!',
          boxWidth: '500px',
    useBootstrap: false,
        content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
     
        '<input id="assinatura" type="text" placeholder="Sua assinatura" class="name form-control" required />' +
        '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: 'Assinar',
                btnClass: 'btn-red',
                action: function () {
                    var name = this.$content.find('.name').val();
                    if(!name){
                        alertar("Insira uma assinatura")
                        return false;
                    }
                    $.post("/AssinarContrato/assinarContrato",{assinatura:$("#assinatura").val()},(ret)=>{
                        confirmarContratoAssinado()
                    })
                }
            },
            cancelar: function () {
                //close
            },
        },
        onContentReady: function () {
            // bind to events
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
        
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        }
    });
  }
let tamnhoModal = $(window).window >=500 ? "500px" : "90%";

  function confirmarContratoAssinado(){
    $('.jconfirm').remove();

$("#pdf_father").attr("src",$("#pdf_father").attr("src"))
$.post("/contratoAssinado", {token:$.urlParam("token")}, (ret) => {
    console.log(ret)
  })
alertar("Contrato Assinado,verifique sua assinatura, e caso queira refazê-la, escolha uma das opções abaixo no seu computador, ou desenhe novamente e clique em 'Assinar' ","Sucesso!",tamnhoModal)
}