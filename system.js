var FPS = {
    baseFPS:60,
    show:(function(){
        var current = (new Date()).getTime();
        var base = current;
        var count = 0;
        return function(){
            count++;
            current = (new Date()).getTime();
            var x = (current - base);
            if(current - base > 1000){
                $("#fps").text(count + "/" + this.baseFPS);
                base = current;
                count = 0;
            };
        };
    })()
}

var System = {
    sprites:[],
    events:[],
    canvas:null,
    label:null,
    init:function(){
        this.sprites = [];
        this.events = [];
	System.stopBGM();

        var c = $('#canvas');
        this.canvas = {
            src:c[0].getContext("2d"),
            width:c.width(),
            height:c.height(),
            drawImage:function(img, x, y){ this.src.drawImage(img, x, y); },
            fill_all:function(color){
                this.src.fillStyle = color;
                this.src.beginPath();
                this.src.rect(0, 0, this.width, this.height);
                this.src.closePath();
                this.src.fill();
            },
            clear:function(){ this.src.clearRect(0, 0, this.width, this.height); }
        };
        this.label = $("#label");

        System.bind("button_4", "once", System.pause);
    },
    start:function(){
      System.init();
      eval(document.getElementById('stage').value);
    },
    playBGM:function(url){
      var embed = document.createElement("embed");
      embed.setAttribute("src", url);
      embed.setAttribute("hidden", true);
      embed.setAttribute("autostart", true);
      embed.setAttribute("loop", true);
      document.body.appendChild(embed);
      System.stopBGM = function(){
	document.body.removeChild(embed);
	System.stopBGM = function(){};
      };
    },
    stopBGM:function(){},
    playSE:function(url){
      var embed = document.createElement("embed");
      embed.setAttribute("src", url);
      embed.setAttribute("hidden", true);
      embed.setAttribute("autostart", true);
      document.body.appendChild(embed);
      var id = setInterval(function(){
		 document.body.removeChild(embed);
		 clearInterval(id);
      }, 1000);
    },
    pause:(function(){
        var isPause = false;
        var intervalId = 0;
        return function(){
            if(isPause){
                intervalId = setInterval(System.update(), 1000 / FPS.baseFPS);
            }else{
                clearInterval(intervalId);
            }
            isPause = !isPause;
        };
    })(),
    bind:(function(){
        var status = {  left:false, right:false, up:false, down:false,
                        button_1:false, button_2:false, button_3:false, button_4:false };
        var getEvent = function(e){
            e.keyChar = String.fromCharCode(e.keyCode).toUpperCase();
            return   (e.keyCode == 39)  ?   "right"
                    :(e.keyCode == 37)  ?   "left"
                    :(e.keyCode == 38)  ?   "up"
                    :(e.keyCode == 40)  ?   "down"
                    :(e.keyChar == "Z") ?   "button_1"
                    :(e.keyChar == "X") ?   "button_2"
                    :(e.keyCode == 16)  ?   "button_3"
                    :(e.keyCode == 32)  ?   "button_4"
                    : "";
        };
        $(document).keydown( function(e){ status[getEvent(e)] = true; });
        $(document).keyup(   function(e){ status[getEvent(e)] = false; });

        return function(){
            if(arguments[1] == "once"){
                var type = arguments[0];
                var action = arguments[2];
                $(document).keypress( function(){ if(status[type]) action(); });
            }else{
                var type = arguments[0];
                System.events.push({action:arguments[1],
                                    enable:function(){ return status[type]; }});
            }
        };
    })(),
    update:function(){
        var eventDispatch = function(){
            System.events.filter(function(x){ return x.enable(); })
                         .map(function(x){ x.action(); });
        };
        var objectCount = function(){
            System.label.text(System.sprites.length);
        };
        var isCollision = function(s1){
            var a = { x1:s1.x, x2:s1.x+s1.width, y1:s1.y, y2:s1.y+s1.height };
            return function(s2){
                var b = { x1:s2.x, x2:s2.x+s2.width, y1:s2.y, y2:s2.y+s2.height };

                var isX = (b.x1 <= a.x1 &&  a.x1 <= b.x2) || (b.x1 <= a.x2 && a.x2 <= b.x2);
                var isY = (b.y1 <= a.y1 &&  a.y1 <= b.y2) || (b.y1 <= a.y2 && a.y2 <= b.y2);

                return isX && isY;
            };
        };
        return function(){
            FPS.show();
            objectCount();
            eventDispatch();

            System.canvas.clear();
            System.sprites = System.sprites.filter(function(x){ return x.enable; });
            System.sprites.forEach(function(x){
                x.update();
                var isCol = isCollision(x);
                System.sprites.filter(function(y){
                    return (x.type == y.type) ? false
                                :isCol(y) ? true
                                :           false; })
                        .forEach(function(y){
                            x.collision(y);
                            y.collision(x);
                        });
                x.draw();
            });
        };
    }
};

$(function(){
        System.start();
        System.pause();
});