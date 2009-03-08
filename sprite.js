var Sprite = function(sx, sy, img_path){
    var self = this;
    var img = new Image();
    img.src = img_path;

    this.width = img.width;
    this.height= img.height;
    this.x = sx;
    this.y = sy;
    this.enable = true;

    this.draw = function(){ System.canvas.drawImage(img, self.x, self.y);   };
    this.update = function(){};
    this.collision = function(target){};

    System.sprites.push(this);
};

var Player = function(params){
    return function(sx, sy){
    var self = new Sprite(sx, sy, params.img_path);
    self.type = "player";
    System.bind("left", function(){self.x -= params.dx;});
    System.bind("right", function(){self.x += params.dx;});
    System.bind("up", function(){self.y -= params.dy;});
    System.bind("down", function(){self.y += params.dy;});
    System.bind("button_1", function(){params.fire(self);});
//  System.bind("button_2", bom);

    self.collision = function(target){
        switch (target.type){
        case "enamy"    : console.log("ぶつかっちゃった＞_＜"); self.enable = false; break;
        }
    };

    return self;
    };
};

var Enamy = function(params){
    return function(sx, sy){
        var self = new Sprite(sx, sy, params.img_path);
	self.type = "enamy";
        self.dx = params.dx;
        self.dy = params.dy;
        self.update = function(){
            params.update(self);
            self.enable =   (-System.canvas.height < self.y && self.y < System.canvas.height* 2 &&
                             -System.canvas.width  < self.x && self.x < System.canvas.width * 2 ) ;
        };

        return self;
    };
};

var Shot = function(params){
    return function(sx, sy){
        var self = new Sprite(sx, sy, params.img_path);
        self.type = "shot";
        self.dx = params.dx;
        self.dy = params.dy;

        self.update = function(){
            params.update(self);
            self.enable =   (-System.canvas.height < self.y && self.y < System.canvas.height* 2 &&
                             -System.canvas.width  < self.x && self.x < System.canvas.width * 2 ) ;
        };
        return self;
    };
};
