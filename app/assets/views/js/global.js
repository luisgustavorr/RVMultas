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
  $(".loading").css("display","none")
    let id_page = $(location).attr("pathname").replace(/%20/g, "").toLowerCase().replace(/\//g, "")
    if(id_page == ""){
        id_page = "meusclientes"
    }
    $("#" + id_page).addClass("selected_page")
    var attributes= $("#attributes").val()
    $("#attributes").remove()
})
function fecharModal(){
    $("fundo").css("display","none")
    $(".modal").css("display","none")

}
function abrirModal(modal){
    $("#"+modal).css("display","flex")
    $("fundo").css("display","flex")
    let y = $("#modal_add_contrato").offset().top
    $( "html" ).scrollTop( y );

}
function buscar(DOMElement,target_array,target_key){
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
  $("body").on("click","img",function(){
    console.log("asdwd")
  let src =  $(this).attr("src")
  let nome_arquivo = src.split("/").slice(-1)[0]
  console.log(nome_arquivo)
    $("#modal_zoom_imagem .img_father").html(`
    <img id='img_zoomed' src="${src}">
    `)

    $("#modal_zoom_imagem ").css("display","flex")
    $("#img_zoomed").ezPlus({responsive:true,scrollZoom:true})
    $("fundoIMG ").css("display","flex")
    $("#modal_zoom_imagem span").text(nome_arquivo)
  })

