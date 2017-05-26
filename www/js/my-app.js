// Initialize app
var myApp = new Framework7({
   modalTitle: 'QR Frotas - IFB',
   
});
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
});

//função responsável por reiniciar a área de armazenamento localStorage
function init_localstorage(){
    var data = [];
    data = JSON.stringify(data);
    window.localStorage.setItem("qr", data);
    window.localStorage.setItem("viagem",data);
    window.localStorage.setItem("token","");
    window.localStorage.setItem("user","");
}


// Handle Cordova Device Ready Event - Usado na inicialização da página index.html
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,

    });
    
    
    if (window.localStorage.getItem("token") !==""){
        myApp.closeModal('.login-screen',true);
        $$("#user-qr").html(window.localStorage.getItem("user")); 
        mainView.showNavbar();

    }
    else{
        //inicialização do armazenamento local do aplicativo
        init_localstorage();
        myApp.hideNavbar('.navbar', true);
    }

    

     
});

    $$(document).on('backbutton', function() {
        myApp.confirm("Deseja sair do aplicativo?",function(){
            //chamada ajax usada para destruir o token 
            $$.ajax({
                url:'http://10.6.1.30/frotas/destroy.php',
                data: {user: window.localStorage.getItem("user") ,token: window.localStorage.getItem("token")},
                method: 'POST',
                dataType: 'text',
                success: function(data, status, xhr){ 
                    if(data = "OK"){
                        window.localStorage.setItem("token","");
                        window.localStorage.setItem("user","");    
                    }
                    else{
                        myApp.alert("Erro! Falha na comunicação com o servidor de acesso!")
                    }
                    
                    
                },
                error: function(data, status, xhr){
                    myApp.alert("Erro! Falha na comunicação com o servidor");
                }
            });
            navigator.app.exitApp();
        },function(){
            //
        });
    });


    $$('#sair').on('click', function(){
        myApp.confirm("Deseja desconectar o usuario "+window.localStorage.getItem("user")+"?", function(){
            init_localstorage();
            cordova.InAppBrowser.open("index.html", '_self');
            myApp.closePanel(true);
            //myApp.hideNavbar('.navbar', true);
            //myApp.loginScreen('.login-screen',true);
            //chamada ajax usada para destruir o token 
            $$.ajax({
                url:'http://10.6.1.30/frotas/destroy.php',
                data: {user: window.localStorage.getItem("user") ,token: window.localStorage.getItem("token")},
                method: 'POST',
                dataType: 'text',
                success: function(data, status, xhr){ 
                    if(data = "OK"){
                        window.localStorage.setItem("token","");
                        window.localStorage.setItem("user","");    
                    }
                    else{
                        myApp.alert("Erro! Falha na comunicação com o servidor de acesso!")
                    }
                    
                    
                },
                error: function(data, status, xhr){
                    myApp.alert("Erro! Falha na comunicação com o servidor");
                }
            });
            }, function(){});
    });



myApp.onPageInit('*', function (page) {

    $$(document).on('backbutton', function() {
        myApp.confirm("Deseja sair do aplicativo?",function(){
            //chamada ajax usada para destruir o token 
            $$.ajax({
                url:'http://10.6.1.30/frotas/destroy.php',
                data: {user: window.localStorage.getItem("user") ,token: window.localStorage.getItem("token")},
                method: 'POST',
                dataType: 'text',
                success: function(data, status, xhr){ 
                    if(data = "OK"){
                        window.localStorage.setItem("token","");
                        window.localStorage.setItem("user","");    
                    }
                    else{
                        myApp.alert("Erro! Falha na comunicação com o servidor de acesso!")
                    }
                    
                    
                },
                error: function(data, status, xhr){
                    myApp.alert("Erro! Falha na comunicação com o servidor");
                }
            });
            navigator.app.exitApp();
        },function(){
            //
        });
    });


  
});

$$('#botao-login').on('click',function(){
   

    var usuario  = $$("#user_id").val();
    var password = $$("#pass_id").val();
    
    
    $$.ajax({
        url:'http://10.6.1.30/frotas/auth.php',
        data: {user:usuario,passw: password},
        method: 'POST',
        dataType: 'text',
        success: function(data, status, xhr){ 
            if (Number(data) ==  1){
                myApp.alert("Erro de autenticação! Usuário e/ou senha inválida!");
            }
            else{
                console.log(data);
                window.localStorage.setItem("token",data);
                window.localStorage.setItem("user",usuario);
                $$("#user-qr").html(usuario);
                myApp.closeModal('.login-screen',true);
                mainView.showNavbar();
            }
            
        },
        error: function(data, status, xhr){
            myApp.alert("Erro! Falha na comunicação com o servidor");
        }
    });
    
});


/////////////////////////// Varredura do QR Code ////////////////////////////////
$$('#scan').on('click', function(){
    value="-";
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled){
                if(result.format == "QR_CODE"){
                    var value = result.text;
                    window.localStorage.setItem("qr",value);
                }
                else{
                    //myApp.alert("Código de barras inválido! Use em um QR code válido");
                    var value = result.text;
                    window.localStorage.setItem("qr",value);
                }
            }
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
    
    $$.ajax({
        url:'http://10.6.1.30/frotas/index.php',
        data: {placa: window.localStorage.getItem("qr")},
        dataType: 'json',
        success: function(data, status, xhr){ 


            if (data[0].viagem == "saida"){
                //Primeiramente, deve-se limpar as viagens antigas da lista_viagens
                $$("#lista_viagens").html("");

                //Torna as informações do carro e das viagens visíveis
                $$("#info_carro").css("visibility","visible");
                $$("#info_viagens").css("visibility","visible");        
                $$("#info_tipo_viagens").html("Viagens agendadas");
                $$("#lista_viagens").css("visibility","visible"); 

                //Recebe informações sobre o veículo          
                $$("#nome_carro").html(data[0].marca+" "+data[0].carro);
                $$("#placa").html(data[0].placa);
                $$("#odometro").html(data[0].odometro);
                $$("#img-carro").attr("src","imagens/"+data[0].carro+".jpg");

                var viagens = [];
                //checa quantas viagens foram registradas para o veículo
                for (i=0;i<data.length;i++){

                    //pos processamento das datas de saída e chegada
                    var dia_saida=data[i].data_saida.substring(8,10);
                    var mes_saida=data[i].data_saida.substring(5,7);
                    var ano_saida=data[i].data_saida.substring(0,4);

                    var dia_chegada=data[i].data_chegada.substring(8,10);
                    var mes_chegada=data[i].data_chegada.substring(5,7);
                    var ano_chegada=data[i].data_chegada.substring(0,4);

                    viagens.push(JSON.stringify(data[i]));

                    

                    var li_viagem='<ul ><li id="vg_'+i+' " class="viagem_link"><a href="#" class=" item-link item-content"><div class="item-media"><i class="icon ion-android-car size-50"></i></div><div class="itinerario row"><div id="saida_div" class="col-40"><spam id="saida">'+data[i].local_saida +'</spam> </div><div class="col-20 seta_viagem"><i class="icon ion-arrow-right-c size-30"></i></div><div id="chegada_div" class="col-40"><spam id="saida">'+data[i].itinerario+'</spam></div></div></div></a></li></ul><div class="list-block-label">Saída prevista para as <spam id="saida_hora">'+data[i].data_saida.substring(11,16)+'</spam> no dia <spam id="data_saida">'+dia_saida+'/'+mes_saida+'/'+ano_saida+'</spam> </div>';
                    $$("#lista_viagens").append(li_viagem);
                }
                window.localStorage.setItem("viagem",viagens); 
            }
            else if(data[0].viagem == "chegada"){
                //Primeiramente, deve-se limpar as viagens antigas da lista_viagens
                $$("#lista_viagens").html("");

                //Torna as informações do carro e das viagens visíveis
                $$("#info_carro").css("visibility","visible");
                $$("#info_viagens").css("visibility","visible");
                $$("#info_tipo_viagens").css("visibility","visible");
                $$("#info_tipo_viagens").html("Viagens em Andamento");
                $$("#lista_viagens").css("visibility","visible"); 

                //Recebe informações sobre o veículo          
                $$("#nome_carro").html(data[0].marca+" "+data[0].carro);
                $$("#placa").html(data[0].placa);
                $$("#odometro").html(data[0].odometro);
                $$("#img-carro").attr("src","imagens/"+data[0].carro+".jpg");

                var viagens = [];
                //checa quantas viagens foram registradas para o veículo
                for (i=0;i<data.length;i++){

                    //pos processamento das datas de saída e chegada
                    var dia_chegada=data[i].data_chegada.substring(8,10);
                    var mes_chegada=data[i].data_chegada.substring(5,7);
                    var ano_chegada=data[i].data_chegada.substring(0,4);
                   
                    viagens.push(JSON.stringify(data[i]));

                    

                    var li_viagem='<ul ><li id="vg_'+i+' " class="retorno_link"><a href="#" class=" item-link item-content"><div class="item-media"><i class="icon ion-android-car size-50"></i></div><div class="itinerario row"><div id="saida_div" class="col-40"><spam id="saida">'+data[i].local_saida +'</spam> </div><div class="col-20 seta_viagem"><i class="icon ion-arrow-left-c size-30"></i></div><div id="chegada_div" class="col-40"><spam id="saida">'+data[i].itinerario+'</spam></div></div></div></a></li></ul><div class="list-block-label">Chegada prevista para as <spam id="saida_hora">'+data[i].data_chegada.substring(11,16)+'</spam> no dia <spam id="data_saida">'+dia_chegada+'/'+mes_chegada+'/'+ano_chegada+'</spam> </div>';
                    $$("#lista_viagens").append(li_viagem);
                }
                window.localStorage.setItem("viagem",viagens); 
            }
            
            
            
        },
        error: function(data, status, xhr){
            myApp.alert("O Carro escaneado não possui viagens agendadas!");
        }
    });

});


$$(document).on('click','.viagem_link', function(){  
    //armazena no localStorage o índice das informações da viagem
    vg_id=$$(this).attr('id').substring(3,4);  
    window.localStorage.setItem("vg_id",vg_id);
    //recebe informações de motorista e solicitante
    mainView.router.loadPage('saida.html'); 
});

$$(document).on('click','.retorno_link', function(){  
    //armazena no localStorage o índice das informações da viagem
    vg_id=$$(this).attr('id').substring(3,4);  
    window.localStorage.setItem("vg_id",vg_id);
    //recebe informações de motorista e solicitante
    mainView.router.loadPage('retorno.html'); 
});

///// Código replicado da página index, usado quando haja necessidade de realizar
//// nova viagem após o término de uma viagem ///////////////////////////////////
myApp.onPageInit('index', function (page) {

    $$('#scan').on('click', function(){
        value="-";
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if(!result.cancelled){
                    if(result.format == "QR_CODE"){
                        var value = result.text;
                        window.localStorage.setItem("qr",value);
                    }
                    else{
                        //myApp.alert("Código de barras inválido! Use em um QR code válido");
                        var value = result.text;
                        window.localStorage.setItem("qr",value);
                    }
                }
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
        );
        
        $$.ajax({
            url:'http://10.6.1.30/frotas/index.php',
            data: {placa: window.localStorage.getItem("qr")},
            dataType: 'json',
            success: function(data, status, xhr){ 


                if (data[0].viagem == "saida"){
                    //Primeiramente, deve-se limpar as viagens antigas da lista_viagens
                    $$("#lista_viagens").html("");

                    //Torna as informações do carro e das viagens visíveis
                    $$("#info_carro").css("visibility","visible");
                    $$("#info_viagens").css("visibility","visible");        
                    $$("#info_tipo_viagens").html("Viagens agendadas");
                    $$("#lista_viagens").css("visibility","visible"); 

                    //Recebe informações sobre o veículo          
                    $$("#nome_carro").html(data[0].marca+" "+data[0].carro);
                    $$("#placa").html(data[0].placa);
                    $$("#odometro").html(data[0].odometro);
                    $$("#img-carro").attr("src","imagens/"+data[0].carro+".jpg");
                    
                    var viagens = [];
                    //checa quantas viagens foram registradas para o veículo
                    for (i=0;i<data.length;i++){

                        //pos processamento das datas de saída e chegada
                        var dia_saida=data[i].data_saida.substring(8,10);
                        var mes_saida=data[i].data_saida.substring(5,7);
                        var ano_saida=data[i].data_saida.substring(0,4);

                        var dia_chegada=data[i].data_chegada.substring(8,10);
                        var mes_chegada=data[i].data_chegada.substring(5,7);
                        var ano_chegada=data[i].data_chegada.substring(0,4);

                        viagens.push(JSON.stringify(data[i]));

                        

                        var li_viagem='<ul ><li id="vg_'+i+' " class="viagem_link"><a href="#" class=" item-link item-content"><div class="item-media"><i class="icon ion-android-car size-50"></i></div><div class="itinerario row"><div id="saida_div" class="col-40"><spam id="saida">'+data[i].local_saida +'</spam> </div><div class="col-20 seta_viagem"><i class="icon ion-arrow-right-c size-30"></i></div><div id="chegada_div" class="col-40"><spam id="saida">'+data[i].itinerario+'</spam></div></div></div></a></li></ul><div class="list-block-label">Saída prevista para as <spam id="saida_hora">'+data[i].data_saida.substring(11,16)+'</spam> no dia <spam id="data_saida">'+dia_saida+'/'+mes_saida+'/'+ano_saida+'</spam> </div>';
                        $$("#lista_viagens").append(li_viagem);
                    }
                    window.localStorage.setItem("viagem",viagens); 
                }
                else if(data[0].viagem == "chegada"){
                    //Primeiramente, deve-se limpar as viagens antigas da lista_viagens
                    $$("#lista_viagens").html("");

                    //Torna as informações do carro e das viagens visíveis
                    $$("#info_carro").css("visibility","visible");
                    $$("#info_viagens").css("visibility","visible");
                    $$("#info_tipo_viagens").css("visibility","visible");
                    $$("#info_tipo_viagens").html("Viagens em Andamento");
                    $$("#lista_viagens").css("visibility","visible"); 

                    //Recebe informações sobre o veículo          
                    $$("#nome_carro").html(data[0].marca+" "+data[0].carro);
                    $$("#placa").html(data[0].placa);
                    $$("#odometro").html(data[0].odometro);
                    $$("#img-carro").attr("src","imagens/"+data[0].carro+".jpg");
                     
                    var viagens = [];
                    //checa quantas viagens foram registradas para o veículo
                    for (i=0;i<data.length;i++){

                        //pos processamento das datas de saída e chegada
                        var dia_chegada=data[i].data_chegada.substring(8,10);
                        var mes_chegada=data[i].data_chegada.substring(5,7);
                        var ano_chegada=data[i].data_chegada.substring(0,4);
                       
                        viagens.push(JSON.stringify(data[i]));

                        

                        var li_viagem='<ul ><li id="vg_'+i+' " class="retorno_link"><a href="#" class=" item-link item-content"><div class="item-media"><i class="icon ion-android-car size-50"></i></div><div class="itinerario row"><div id="saida_div" class="col-40"><spam id="saida">'+data[i].local_saida +'</spam> </div><div class="col-20 seta_viagem"><i class="icon ion-arrow-left-c size-30"></i></div><div id="chegada_div" class="col-40"><spam id="saida">'+data[i].itinerario+'</spam></div></div></div></a></li></ul><div class="list-block-label">Chegada prevista para as <spam id="saida_hora">'+data[i].data_chegada.substring(11,16)+'</spam> no dia <spam id="data_saida">'+dia_chegada+'/'+mes_chegada+'/'+ano_chegada+'</spam> </div>';
                        $$("#lista_viagens").append(li_viagem);
                    }
                    window.localStorage.setItem("viagem",viagens); 
                }
                
                
                
            },
            error: function(data, status, xhr){
                myApp.alert("O Carro escaneado não possui viagens agendadas!");
            }
        });

    });


    $$(document).on('click','.viagem_link', function(){  
        //armazena no localStorage o índice das informações da viagem
        vg_id=$$(this).attr('id').substring(3,4);  
        window.localStorage.setItem("vg_id",vg_id);
        //recebe informações de motorista e solicitante
        mainView.router.loadPage('saida.html'); 
    });

    $$(document).on('click','.retorno_link', function(){  
        //armazena no localStorage o índice das informações da viagem
        vg_id=$$(this).attr('id').substring(3,4);  
        window.localStorage.setItem("vg_id",vg_id);
        //recebe informações de motorista e solicitante
        mainView.router.loadPage('retorno.html'); 
    });

});

//////////////////////////Página retorno.html//////////////////////////

myApp.onPageInit('retorno', function (page) {
    initialize();
    //carrega na variavel vg_local dados anteriormente armazenados sobre a viagem
    vg_index = window.localStorage.getItem("vg_id");
    vg_local = "["+window.localStorage.getItem("viagem")+"]";
    vg_local = JSON.parse(vg_local);
    console.log(vg_local[vg_index]);
    

    //Escreve informações previamente obtidas no formulario
    $$("#local_chegada").attr("value",vg_local[vg_index].itinerario);
    $$("#odometro_chegada").attr("value",vg_local[vg_index].odometro);
    
    //escreve a data de saída
    dia_chegada=vg_local[vg_index].data_chegada.substring(8,10);  
    mes_chegada=vg_local[vg_index].data_chegada.substring(5,7);
    ano_chegada=vg_local[vg_index].data_chegada.substring(0,4);
    var t = new Date();
    var horas = t.getHours();
    var min = t.getMinutes();

    if (horas < 10){
        horas = "0"+horas;
    }
    if (min < 10){
        min = "0"+min;
    }


    hora_chegada=horas+":"+min;
    $$("#data_vg_chegada").attr("value",dia_chegada+"/"+mes_chegada+"/"+ano_chegada);
    $$("#horario_chegada").attr("value",hora_chegada);//vg_local[vg_index].data_saida.substring(11,16));


    $$.ajax({
    url:'http://10.6.1.30/frotas/get_solicitante_motorista.php',
    data: {id: vg_local[vg_index].agenda_id },
    dataType: 'json',
    success: function(data, status, xhr){ 
        //Recebe informações sobre o solicitante da viagem e do motorista          
        $$("#solicitante").attr("value",data[0].solicitante);
        $$("#motorista").attr("value",data[0].motorista);
    },
    error(xhr,status){
        console.log(xhr);
    } 
    });
    
    $$.ajax({
    url:'http://10.6.1.30/frotas/get_passageiros.php',
    data: {passageiros: vg_local[vg_index].agenda_id},
    dataType: 'json',
    success: function(data, status, xhr){ 
        for (i=0;i<data.length;i++){
            var li_passageiros='<p>'+data[i]+'</p>'    
            $$("#lista_passageiros").append(li_passageiros);
        }     
    },
    error(xhr,status){
        console.log(xhr);
    } 
    });

    $$('#comb_chegada').on('input change','input[type="range"]', function(){
        updateGauges(this.value);
    });

   
    //botão "finalizar viagem"
   $$(document).on('click','#botao_finaliza_viagem', function(){
    console.log("finaliza viagem!");


    vg_index = window.localStorage.getItem("vg_id");
    vg_local = "["+window.localStorage.getItem("viagem")+"]";
    vg_local = JSON.parse(vg_local);
    id_agendamento = vg_local[vg_index].agenda_id;
    chegada_odometro = $$("#odometro_chegada").val();
    obs_chegada = $$("#observacoes_chegada").val();
    //Padrão de data -> 2017-03-10 10:08:47.826152-03
    var t = new Date();  
    var horas = t.getHours();
    var min = t.getMinutes();
    var seg = t.getSeconds();
    var mes = t.getMonth()+1;
    var dia = t.getDate();

    if (horas < 10){
        horas = "0"+horas;
    }
    if (min < 10){
        min = "0"+min;
    }
    if (seg < 10){
        seg = "0"+min;
    }
    if (mes < 10){
        mes = "0"+mes;
                
    }
    if (dia < 10){
        dia = "0"+dia;
    }
    data_chegada = t.getFullYear()+"-"+mes+"-"+dia+" "+horas+":"+min+":"+seg+"-03";
    //info_saida sera usado para enviar os dados de saida para o servidor
    info_chegada = {
        "id_agendamento":   id_agendamento,
        "chegada_odometro": chegada_odometro,
        "chegada_data"    : data_chegada,
        "chegada_obs"     : obs_chegada,
    };
    
    $$.ajax({
        url:'http://10.6.1.30/frotas/set_viagem_chegada.php',
        data: {chegada: info_chegada},
        dataType: 'json',
        success: function(data, status, xhr){ 
            console.log(data);
        },
        error(xhr,status){
            console.log(xhr);
        } 
    });
    
  });

});

//////////////////////////Página saida.html////////////////////////////

myApp.onPageInit('saida', function (page) {
    initialize();
    //carrega na variavel vg_local dados anteriormente armazenados sobre a viagem
    vg_index = window.localStorage.getItem("vg_id");
    vg_local = "["+window.localStorage.getItem("viagem")+"]";
    vg_local = JSON.parse(vg_local);
    console.log(vg_local[vg_index]);
    

    //Escreve informações previamente obtidas no formulario
    $$("#local_saida").attr("value",vg_local[vg_index].local_saida);
    $$("#itinerario").attr("value",vg_local[vg_index].itinerario);
    $$("#odometro_saida").attr("value",vg_local[vg_index].odometro);
      
    //escreve a data de saída
    dia_saida=vg_local[vg_index].data_saida.substring(8,10);  
    mes_saida=vg_local[vg_index].data_saida.substring(5,7);
    ano_saida=vg_local[vg_index].data_saida.substring(0,4);
    var t = new Date();
    var horas = t.getHours();
    var min = t.getMinutes();

    if (horas < 10){
        horas = "0"+horas;
    }
    if (min < 10){
        min = "0"+min;
    }


    hora_saida=horas+":"+min;
    $$("#data_vg_saida").attr("value",dia_saida+"/"+mes_saida+"/"+ano_saida);
    $$("#horario_saida").attr("value",hora_saida);//vg_local[vg_index].data_saida.substring(11,16));

    //escreve a data de chegada prevista
    dia_chegada=vg_local[vg_index].data_chegada.substring(8,10);  
    mes_chegada=vg_local[vg_index].data_chegada.substring(5,7);
    ano_chegada=vg_local[vg_index].data_chegada.substring(0,4);
    $$("#data_vg_chegada").attr("value",dia_chegada+"/"+mes_chegada+"/"+ano_chegada);
    $$("#horario_chegada").attr("value",vg_local[vg_index].data_chegada.substring(11,16));

    $$.ajax({
    url:'http://10.6.1.30/frotas/get_solicitante_motorista.php',
    data: {id: vg_local[vg_index].agenda_id },
    dataType: 'json',
    success: function(data, status, xhr){ 
        //Recebe informações sobre o solicitante da viagem e do motorista          
        $$("#solicitante").attr("value",data[0].solicitante);
        $$("#motorista").attr("value",data[0].motorista);
    },
    error(xhr,status){
        console.log(xhr);
    } 
    });
    
    $$.ajax({
    url:'http://10.6.1.30/frotas/get_passageiros.php',
    data: {passageiros: vg_local[vg_index].agenda_id},
    dataType: 'json',
    success: function(data, status, xhr){ 
        for (i=0;i<data.length;i++){
            var li_passageiros='<p>'+data[i]+'</p>'    
            $$("#lista_passageiros").append(li_passageiros);
        }     
    },
    error(xhr,status){
        console.log(xhr);
    } 
    });

    $$('#comb_saida').on('input change','input[type="range"]', function(){
        updateGauges(this.value);
    });
   
});

$$(document).on('click','#botao_inicia_viagem', function(){
    //agendamento_resposta_id,viatura_id,motorista_id,saida_odometro,saida_data,saida_obs,data_cadastro
    vg_index = window.localStorage.getItem("vg_id");
    vg_local = "["+window.localStorage.getItem("viagem")+"]";
    vg_local = JSON.parse(vg_local);

    id_agendamento = vg_local[vg_index].agenda_id;
    saida_odometro = $$("#odometro_saida").val();

    //atualiza valor de odometro armazenado no localStorage
    vg_local[vg_index].odometro = saida_odometro;

    obs_saida = $$("#observacoes_saida").val();
    //Padrão de data -> 2017-03-10 10:08:47.826152-03
    var t = new Date();  
    var horas = t.getHours();
    var min = t.getMinutes();
    var seg = t.getSeconds();
    var mes = t.getMonth()+1;
    var dia = t.getDate();


    if (horas < 10){
        horas = "0"+horas;
    }
    if (min < 10){
        min = "0"+min;
    }
    if (seg < 10){
        seg = "0"+min;
    }
    if (mes < 10){
        mes = "0"+mes;
                
    }
    if (dia < 10){
        dia = "0"+dia;
    }
    data_saida = t.getFullYear()+"-"+mes+"-"+dia+" "+horas+":"+min+":"+seg+"-03";
    //info_saida sera usado para enviar os dados de saida para o servidor
    info_saida = {
        "id_agendamento": id_agendamento,
        "saida_odometro": saida_odometro,
        "saida_data"    : data_saida,
        "saida_obs"     : obs_saida,
    };
    


    $$.ajax({
    url:'http://10.6.1.30/frotas/set_viagem_saida.php',
    data: {saida: info_saida},
    dataType: 'json',
    success: function(data, status, xhr){ 
        console.log(data);
    },
    error(xhr,status){
        console.log(xhr);
    } 
    });

});


///////////////// Viagem em Andamento /////////////////////////
myApp.onPageInit('viagem_andamento', function (page) {
   $$.ajax({
    url:'http://10.6.1.30/frotas/index.php',
    data: {placa: window.localStorage.getItem("qr")},
    dataType: 'json',
    success: function(data, status, xhr){
        if(data[0].viagem == "chegada"){
            //Primeiramente, deve-se limpar as viagens antigas da lista_viagens
            $$("#lista_viagens").html("");

            //Torna as informações do carro e das viagens visíveis
            $$("#info_carro").css("visibility","visible");
            $$("#info_viagens").css("visibility","visible");
            $$("#info_tipo_viagens").css("visibility","visible");
            $$("#info_tipo_viagens").html("Viagens em Andamento");
            $$("#lista_viagens").css("visibility","visible"); 

            //Recebe informações sobre o veículo          
            $$("#nome_carro").html(data[0].marca+" "+data[0].carro);
            $$("#placa").html(data[0].placa);
            $$("#odometro").html(data[0].odometro);
            $$("#img-carro").attr("src","imagens/"+data[0].carro+".jpg");

            var viagens = [];
            //checa quantas viagens foram registradas para o veículo
            for (i=0;i<data.length;i++){

                //pos processamento das datas de saída e chegada
                var dia_chegada=data[i].data_chegada.substring(8,10);
                var mes_chegada=data[i].data_chegada.substring(5,7);
                var ano_chegada=data[i].data_chegada.substring(0,4);
               
                viagens.push(JSON.stringify(data[i]));

                var li_viagem='<ul ><li id="vg_'+i+' " class="retorno_link"><a href="#" class=" item-link item-content"><div class="item-media"><i class="icon ion-android-car size-50"></i></div><div class="itinerario row"><div id="saida_div" class="col-40"><spam id="saida">'+data[i].local_saida +'</spam> </div><div class="col-20 seta_viagem"><i class="icon ion-arrow-left-c size-30"></i></div><div id="chegada_div" class="col-40"><spam id="saida">'+data[i].itinerario+'</spam></div></div></div></a></li></ul><div class="list-block-label">Chegada prevista para as <spam id="saida_hora">'+data[i].data_chegada.substring(11,16)+'</spam> no dia <spam id="data_saida">'+dia_chegada+'/'+mes_chegada+'/'+ano_chegada+'</spam> </div>';
                $$("#lista_viagens").append(li_viagem);
            }
            window.localStorage.setItem("viagem",viagens); 
        }

    }
   });
});

myApp.onPageInit('fim_viagem', function (page) {

    $$("#sair_2").on('click', function() {
    myApp.confirm("Deseja sair do aplicativo?",function(){
        //chamada ajax usada para destruir o token 
        $$.ajax({
            url:'http://10.6.1.30/frotas/destroy.php',
            data: {user: window.localStorage.getItem("user") ,token: window.localStorage.getItem("token")},
            method: 'POST',
            dataType: 'text',
            success: function(data, status, xhr){ 
                if(data = "OK"){
                    window.localStorage.setItem("token","");
                    window.localStorage.setItem("user","");    
                }
                else{
                    myApp.alert("Erro! Falha na comunicação com o servidor de acesso!")
                }
                
                
            },
            error: function(data, status, xhr){
                myApp.alert("Erro! Falha na comunicação com o servidor");
            }
            });
            navigator.app.exitApp();
        },function(){
            //
        });
    });


    $$("#nova_viagem").on('click',function(){
        console.log("nova_viagem");


    });
    


});
