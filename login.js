$(document).ready(function() {
    $('#createScreen').hide();
    $('#gameScreen').hide();

    $('#incorrect').hide();
    var IP = "http://10.21.246.247:3000";
    var room = "";
    var user = "";
    var connected = false;
    var peer;
    var audio;
    var reset = document.getElementById('reset');
    var endWindow = document.getElementById('loseWindow');

    reset.onclick = function() {
      location.reload();
    }

    var refreshID = setInterval (function() { Check() }, 2000);

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
        peer.on('error', err => console.log('error', err));

        // POST signal to server, then repeatedly GET
        peer.on('signal', data => {
            if (!connected) {
                $.post(IP + "/conn/",
                {
                    user: user,
                    room: room,
                    data: data
                })
                .done(function(msg){
                    PollForUpdate();
                });
            }
        });

        // Once connected ->
        peer.on('connect', () => {
            connected = true;
            peer.send('connected');
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
    function PollForUpdate() {
      var counter = 0;
        var refreshID = setInterval (function() {
            counter++;
            if (connected) {
                clearInterval(refreshID);
            }else if(counter >= 100){
                room = "";
                user = "";
                connected = false;
                peer;
                $( "#mainScreen" ).show();
                $('#createScreen').hide();
                $('#gameScreen').hide();
                $('#incorrect').text("Connection timed out.");
                $('#incorrect').show();

                clearInterval(refreshID);
            }
            $.get(IP + "/conn?user=" + user + "&room=" + room)
                .done(function(msg){
                    if (msg == "out") {
                        clearInterval(refreshID);
                    }
                    else if (msg != "fail") {
                        peer.signal(JSON.stringify(JSON.parse(msg).data));

                        clearInterval(refreshID);
                    }
                });
        }, 500);
    }

    function GetPin() {
        $.get(IP + "/create-room/",
        function(data,status){
            $( "#gamePin" ).text(data);
            room = data;
            user = "c";
            peer = new SimplePeer ({ initiator: true });
            InitSockets();
        });
    }

    function PostPin(val) {
        $.post(IP + "/join-room/",
        {
            pin: val.toLowerCase()
        },
        function(data,status){
            if (data == "not found") {
                $('#incorrect').show();
                $('#incorrect').text('Incorrect pin.');
            }
            else {
                $('#incorrect').hide();
                $( "#gamePin" ).text("Waiting...");
                $( "#pin" ).text("");
                room = val.toLowerCase();
                user = "j";
                peer = new SimplePeer();
                InitSockets();
                PollForUpdate();
            }
        });
    }

});
