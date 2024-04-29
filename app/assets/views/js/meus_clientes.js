console.log(attributes)

let attr_obj = JSON.parse(attributes.value)
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
    <a href="">Ver Mais Informações</a>
  </div>`)
    });
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

// $("#filter_clientes button ").click(function () {
//     $(".selected_filter").removeClass("selected_filter")
//     $(this).addClass("selected_filter")
//     let status_requerido = $(this).attr("status")
//     if (status_requerido == "null") {
//         status_requerido = null
//     }
//     createCards(attr_obj, status_requerido)
// })

$("#buscar_clientes_processos").change(function(){
  createCards( buscar($(this),attr_obj,"nome"))
})

