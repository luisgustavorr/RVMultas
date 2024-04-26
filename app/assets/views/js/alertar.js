function alertar(message,title = "Alerta!",size = "500px",icon = null,buttons= {}){
    $.alert({
        title: title,
        icon: icon,
        boxWidth: size,
        useBootstrap: false,
        content: message,
        buttons:buttons
      });
}