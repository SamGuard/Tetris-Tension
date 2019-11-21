$(document).ready(function() {
    $('#createScreen').hide();
    $('#gameScreen').hide();

    $('#incorrect').hide();
    var port = 3000;
    var IP;
    if(port == "hello"){
        console.log("using port");
        IP = `ws://${window.location.hostname}:${port}`;
    }else{
        IP = `wss://${window.location.hostname}`;       
    }
    console.log(IP);
    var room = " ";
    var user = "";
    var connected = false;
    var peer = null;
    var audio;
    var reset = document.getElementById('reset');
    var endWindow = document.getElementById('loseWindow');

    var refreshID = setInterval (function() { Check() }, 2000);

    //socketssssss to server
    var connection = new WebSocket(IP);

    reset.onclick = function() {
      location.reload();
    }

    function Check() {
        if (gameOver == true) {
            endWindow.style.display = "block";
            document.getElementById("finalScore").innerHTML = "Score: " + score;
            document.getElementById("finalLines").innerHTML = "Lines filled: " + lines;
            $('#gameScreen').hide();
            var json = JSON.stringify({type:"message", purpose:"pass", data:{
                user: user,
                room: room,
                data: "lost:" + score + ":" + lines
            }});
                                console.log("Sent: " + json);

            connection.send(json);
          clearInterval(refreshID);
        }
    }

    function CheckKey(e) {
		e = e || window.event;
        if (e.keyCode == '37' || e.keyCode == '38' || e.keyCode == '39' || e.keyCode == '40') {
            var json = JSON.stringify({type:"message", purpose:"pass", data:{
                user: user,
                room: room,
                data: e.keyCode
            }});
                                console.log("Sent: " + json);

            connection.send(json);
        }
	}
    function moveup() {
             CheckKey2("38");   
  
    }
    function movedown() {
                     CheckKey2("40");   

    }
    function moveleft() {
             CheckKey2("37");   

    }
    function moveright() {
                     CheckKey2("39");   

    }

        function CheckKey2(e) {
            var json = JSON.stringify({type:"message", purpose:"pass", data:{
                user: user,
                room: room,
                data: e
            }});
                                console.log("Sent: " + json);

            connection.send(json);
        }
	}

    $("#creategame").click(function() {
        $( "#mainScreen" ).hide();
        $( "#createScreen" ).fadeIn();
        $( "#gamePin" ).text("Waiting...");
        GetPin();
    });
    $("#joingame").click(function() {
        PostPin($("#pin").val());
    });
    $("#back").click(function() {
        $( "#mainScreen" ).fadeIn();
        $( "#createScreen" ).hide();
    });
    
    function GetPin() { // For Create Game
        var json = JSON.stringify({type:"message", purpose:"init", pin:"-1", data:""});
        user = "j";
        console.log("Sent: " + json);
        connection.send(json);
    }

    function PostPin(val) { // For Join Game
        var json = JSON.stringify({type:"message", purpose:"init", pin:val.toLowerCase(), data:""});
        user = "c";
                            console.log("Sent: " + json);

        connection.send(json);
    }

    
    /* 
    Purpose types:
    init - starting
    pass - sending to other client
    close - ending
    */
    connection.onmessage = function (message) {
        console.log("Recieved: " + message.data);

        try {
            var data = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }

        if(data.purpose == "init"){
            if (data.room == "-1") {
                $('#incorrect').show();
                $('#incorrect').text('Incorrect pin.');
            }
            else {
                room = data.pin;
                if (data.data == "sent") {
                    var json = JSON.stringify({type:"message", purpose:"pass", data:{
                        user: user,
                        room: room,
                        data: "start"
                    }});
                    document.onkeydown = CheckKey;
                    $('#gameScreen').hide();
                    $('#createScreen').hide();
                    $('#mainScreen').hide(); 
                    console.log("Sent: " + json);

                    connection.send(json);
                }
                else {
                    $( "#gamePin" ).text(data.pin);
                }
            }
        }
        else if(data.purpose == "pass"){
            console.log(data.data.data);
            if (data.data.data == "start") {
                    $('#gameScreen').show();
                    $('#createScreen').hide();
                    $('#mainScreen').hide();
                    requestAnimationFrame(mainLoop);
                audio = new Audio('mii.m4a');
                audio.loop = true;
                audio.play();
            }
            else {
                if (data.data.data == '38') {
                    window.s.rotateShape(window.cell);
                }
                else if (data.data.data == '40') {
                    window.s.moveDown(window.cell);
                }
                else if (data.data.data == '37') {
                  window.s.moveLeft(window.cell);
                }
                else if (data.data.data == '39') {
                    window.s.moveRight(window.cell);
                }
                else {
                  var out = String(data.data.data).split(':');
                  endWindow.style.display = "block";
                  document.getElementById("finalScore").innerHTML = "Score: " + out[1];
                  document.getElementById("finalLines").innerHTML = "Lines filled: " + out[2];
                  $('#gameScreen').hide();
                  audio.pause();
                }
            }
        }
        
    }

});
