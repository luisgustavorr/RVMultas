$("#login_user").submit(function(e){
    e.preventDefault()
    $.post("/Login/selectCliente",{user:$("#user").val(),senha:$("#pass").val()},(ret)=>{
      if(ret.cliente === undefined){
        alertar("Conta não encontrada, caso você esteja cadastrado, entre em contato com o suporte.","ERRO!")
      }else{
        Cookies.set('login', true, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        Cookies.set('permissao', ret.cliente.privilegio, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        Cookies.set('id_cliente', ret.cliente.id, { expires: 7, path: './* ',secure:true ,sameSite: 'strict'})
        $.post("/Login/updateUltimoAcesso",{id_cliente:ret.cliente.id},(ret)=>{
            location.href = "MeusClientes"
          })
      }
    })
    })

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