$(document).ready(function() {
    $('#createScreen').hide();
    $('#gameScreen').hide();

    $('#incorrect').hide();
    var port = 3000;
    var IP;
    if(port == "hello"){
        console.log("using port");
        IP = `wss://${window.location.hostname}:${port}`;
    }else{
        IP = `wss://${window.location.hostname}`;       
    }
    console.log(IP);
    var room = " ";
    var user = "";
    var connected = false;
    var peer;
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
          peer.send("lost:" + score + ":" + lines);
          clearInterval(refreshID);
        }
    }

    
    function InitSockets() {
        console.log("initalizing sockets");
        console.log(peer);
        
        peer.on('error', err => console.log('error', err));

        // POST signal to server, then repeatedly GET
        peer.on('signal', data => {
            console.log("signal");
            if (!connected) {
                json = JSON.stringify({type:"message", purpose:"pass", data:{
                    user: user,
                    room: room,
                    data: data
                }}); 
                connection.send(json);
            }
        });

        // Once connected ->
        peer.on('connect', () => {
            connected = true;
            peer.send('connected');
            connection.send(JSON.stringify({type:"message", purpose:"close"}));
            if (user == "c") {
                document.onkeydown = CheckKey;
                $('#gameScreen').hide();
                $('#createScreen').hide();
                $('#mainScreen').hide();
                audio = new Audio('mii.m4a');
                audio.loop = true;
                audio.play();
            }
            else {
                $('#gameScreen').show();
                $('#createScreen').hide();
                $('#mainScreen').hide();
                audio = new Audio('mii.m4a');
                audio.loop = true;
                audio.play();
                requestAnimationFrame(mainLoop);
            }
        });

        // Once connected -> important data between people
        peer.on('data', data => {
            if (data == "connected") {
                connected = true;
            }
            else {
                if (data == '38') {
                    window.s.rotateShape(window.cell);
                }
                else if (data == '40') {
                    window.s.moveDown(window.cell);
                }
                else if (data == '37') {
                  window.s.moveLeft(window.cell);
                }
                else if (data == '39') {
                    window.s.moveRight(window.cell);
                }
                else {
                  var out = String(data).split(':');
                  endWindow.style.display = "block";
                  document.getElementById("finalScore").innerHTML = "Score: " + out[1];
                  document.getElementById("finalLines").innerHTML = "Lines filled: " + out[2];
                  $('#gameScreen').hide();
                  audio.pause();
                }
            }
        });
    }

    
    function CheckKey(e) {
		e = e || window.event;
        if (e.keyCode == '37' || e.keyCode == '38' || e.keyCode == '39' || e.keyCode == '40') {
            peer.send(e.keyCode);
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
    function GetPin() {
        var json = JSON.stringify({type:"message", purpose:"init", pin:"-1", data:""});
        connection.send(json);
        peer = new SimplePeer ({ initiator: true });
        user = "c";
    }

    function PostPin(val) {
        var data = " ";
        var json = JSON.stringify({type:"message", purpose:"init", pin:val.toLowerCase(), data:""});
        connection.send(json);
        user = "j";
    }

    
    /* 
    Purpose types:
    init - starting
    pass - sending to other client
    close - ending
    */
    connection.onmessage = function (message) {
        try {
            if(peer != null){
                peer = new SimplePeer();
                InitSockets();
            }
            var data = JSON.parse(message.data);
            console.log(data);
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
                $( "#gamePin" ).text(data.pin);
                room = data.pin;
            }
        }
        else if(data.purpose == "pass"){
            $('#incorrect').hide();
            peer.signal(JSON.stringify(data.data));
        }
    }

});
