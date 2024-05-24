

var options = {
    onKeyPress: function (cpfcnpj, e, field, options) {
      var masks = ['000.000.000-000', '00.000.000/0000-00'];
      var mask = (cpfcnpj.length > 14) ? masks[1] : masks[0];
      $('#cpf_user').mask(mask, options);
    }
  };
  
  $('#cpf_user').mask('000.000.000-000', options);

  $("#login_user").submit(function(e){
    e.preventDefault()
    $.post("/LoginCliente/selectCliente",{cpf:$("#cpf_user").val()},(ret)=>{
      if(ret.cliente === undefined){
        alertar("Conta não encontrada, caso você esteja cadastrado, entre em contato com o suporte.","ERRO!")
      }else{
        Cookies.set('login', true, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        Cookies.set('permissao', 1, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        Cookies.set('id_cliente', ret.cliente.id, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        location.href = "ProcessosCliente"
      }
    })
    })
    
  // Cookie.set("login",true, { expires: 7, path: '' })







  //style js

































  $(document).ready(function() {
    $("#do_login").click(function() { 
       closeLoginInfo();
       $(this).parent().find('span').css("display","none");
       $(this).parent().find('span').removeClass("i-save");
       $(this).parent().find('span').removeClass("i-warning");
       $(this).parent().find('span').removeClass("i-close");
       
        var proceed = true;
        $("#login_form input").each(function(){
            
            if(!$.trim($(this).val())){
                $(this).parent().find('span').addClass("i-warning");
            	$(this).parent().find('span').css("display","block");  
                proceed = false;
            }
        });
       
        if(proceed) //everything looks good! proceed...
        {
            $(this).parent().find('span').addClass("i-save");
            $(this).parent().find('span').css("display","block");
        }
    });
    
    //reset previously results and hide all message on .keyup()
    $("#login_form input").keyup(function() { 
        $(this).parent().find('span').css("display","none");
    });
 
  openLoginInfo();
  setTimeout(closeLoginInfo, 1000);
});

function openLoginInfo() {
    $(document).ready(function(){ 
    	$('.b-form').css("opacity","0.01");
    
      if($(window).width() <= 600){
        $('.box-form').css("left","-90%");
        $('.box-info').css("right","15%%");
      }else{
        $('.box-form').css("left","-37%");
        $('.box-info').css("right","-37%");
      }
    });
}

function closeLoginInfo() {
    $(document).ready(function(){ 
    	$('.b-form').css("opacity","1");
    	$('.box-form').css("left","0px");
      $('.box-info').css("right","-5px"); 
    });
}

$(window).on('resize', function(){
      closeLoginInfo();
});