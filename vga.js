/*
MIT License

Copyright (c) 2016 Félix Wolf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var VGARenderer = (function(){
    "use strict";
    var BaseConfig = {
        "font": ".//VGA.font",
        "font_data": []
    };
    //Initialize
    var currentScript = document.currentScript;
    var self = function(canvas){
        var self=this;
        //Constraints
        this.COLOUR = {
            "BLACK": [0x00,0x00,0x00],
            "RED": [0xAA,0x00,0x00],
            "GREEN": [0x00,0xAA,0x00],
            "BROWN": [0xAA,0x55,0x00],
            "BLUE": [0x00,0x00,0xAA],
            "MAGENTA": [0xAA,0x00,0xAA],
            "CYAN": [0x00,0xAA,0xAA],
            "GREY": [0xAA,0xAA,0xAA],
            "LIGHT_DARKGRAY": [0x55,0x55,0x55],
            "LIGHT_RED": [0xFF,0x55,0x55],
            "LIGHT_GREEN": [0x55,0xFF,0x55],
            "LIGHT_YELLOW": [0xFF,0xFF,0x55],
            "LIGHT_BLUE": [0x55,0x55,0xFF],
            "LIGHT_MAGENTA": [0xFF,0x55,0xFF],
            "LIGHT_CYAN": [0x55,0xFF,0xFF],
            "LIGHT_WHITE": [0xFF,0xFF,0xFF]
        };
        this.COLOR = this.COLOUR;
        //Variable
        this.__LOCAL__ = {
            "cursor": {
                "x": 0,
                "y": 0,
                "char": "\x00",
                "image": null
            },
            "colour": {
                "foreground": this.COLOUR.GREY,
                "background": this.COLOUR.BLACK
            }
        };
        this.__LOCAL__.canvas = canvas;
        this.__LOCAL__.canvas.width = 640;
        this.__LOCAL__.canvas.height = 400;
        this.__LOCAL__.ctx = this.__LOCAL__.canvas.getContext("2d");
        this.__LOCAL__.ctx.beginPath();
        this.__LOCAL__.ctx.rect(0, 0, 640, 400);
        this.__LOCAL__.ctx.fillStyle = this.COLOUR.BLACK;
        this.__LOCAL__.ctx.fill();
        this.__LOCAL__.cursor.image = this.__LOCAL__.ctx.createImageData(8,16);
        this.__LOCAL__.cursor.buffer = this.__LOCAL__.cursor.image.data;
        this.__LOCAL__.screen = this.__LOCAL__.ctx.createImageData(640,400);
        this.__LOCAL__.screen_buffer = this.__LOCAL__.screen.data;
        this.__LOCAL__.loaded = function(){
            self.onload();
            self.ready = true;
        };
        this.onload = function(){};
        this.ready = false;
        //Load config
        this.__CONFIG__ = currentScript.innerHTML==""?{}:JSON.parse(currentScript.innerHTML);
        for(var i in BaseConfig){
            if(typeof this.__CONFIG__[i] == "undefined")
                this.__CONFIG__[i] = BaseConfig[i];
        }
        //Load font
        this.loadFont = function(str){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", str, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function(){
                var ab = xhr.response;
                if(ab){
                    var ba = new Uint8Array(ab);
                    for(var i = 0; i < ba.byteLength; i=i+16){
                        var tmp = [];
                        for(var x=0;x<16;x++){
                            tmp.push(ba[i+x]);
                        }
                        self.__CONFIG__.font_data.push(tmp);
                    }
                }
                self.__LOCAL__.loaded();
            };
            xhr.send(null);
        }
        this.loadFont(this.__CONFIG__.font);
    }
    
    //Cursor position
    self.prototype.setCursor = function(x, y){
        if(typeof x != "number" || typeof y != "number")
            throw new TypeError("Non-numeric value passed as position");
        this.__LOCAL__.cursor.x = x;
        this.__LOCAL__.cursor.y = y;
    };
    self.prototype.getCursor = function(){
        return {
            "x": this.__LOCAL__.cursor.x,
            "y": this.__LOCAL__.cursor.y
        };
    };
    
    //Cursor draw
    self.prototype.setBitmap = function(btmp){
        for(var i=0,r=0;i<512;i+=4,r++){
            if(((128>>(r%8))&btmp[Math.floor(r/8)])!=0){
                this.__LOCAL__.cursor.buffer[i] = this.__LOCAL__.colour.foreground[0];
                this.__LOCAL__.cursor.buffer[i+1] = this.__LOCAL__.colour.foreground[1];
                this.__LOCAL__.cursor.buffer[i+2] = this.__LOCAL__.colour.foreground[2];
                this.__LOCAL__.cursor.buffer[i+3] = 0xFF;
            }else{
                this.__LOCAL__.cursor.buffer[i] = this.__LOCAL__.colour.background[0];
                this.__LOCAL__.cursor.buffer[i+1] = this.__LOCAL__.colour.background[1];
                this.__LOCAL__.cursor.buffer[i+2] = this.__LOCAL__.colour.background[2];
                this.__LOCAL__.cursor.buffer[i+3] = 0xFF;
            }
        }
    };
    self.prototype.setChar = function(chr){
        this.__LOCAL__.cursor.char = chr.charCodeAt(0);
        this.setBitmap(this.__CONFIG__.font_data[this.__LOCAL__.cursor.char]);
    };
    self.prototype.draw = function(){
        this.__LOCAL__.ctx.putImageData(this.__LOCAL__.cursor.image, this.__LOCAL__.cursor.x*8-8, this.__LOCAL__.cursor.y*16);   
    };
    self.prototype.write = function(str){
        for(var i=0;i<str.length;i++){
            var tmp = str.charAt(i);
            if(tmp == "\n"){
                if(++this.__LOCAL__.cursor.y>25){
                    this.push(1);
                    this.__LOCAL__.cursor.y=24;
                }
            }else if(tmp == "\r"){
                this.__LOCAL__.cursor.x=0;
            }else{
                this.setChar(tmp);
                if(++this.__LOCAL__.cursor.x>80){
                    this.__LOCAL__.cursor.x=0;
                    if(++this.__LOCAL__.cursor.y>25){
                        this.push(1);
                        this.__LOCAL__.cursor.y=24;
                    }
                }
                this.draw();
            }
        }
    };
    
    //Colours
    self.prototype.setForegroundColour = self.prototype.setForegroundColor = function(col){
        this.__LOCAL__.colour.foreground = col;
    };
    self.prototype.getForegroundColour = self.prototype.getForegroundColor = function(col){
        return this.__LOCAL__.colour.foreground;
    };
    self.prototype.setBackgroundColour = self.prototype.setBackgroundColor = function(col){
        this.__LOCAL__.colour.background = col;
    };
    self.prototype.getBackgroundColour = self.prototype.getBackgroundColor = function(col){
        return this.__LOCAL__.colour.background;
    };
    
    //Clearing
    self.prototype.clear = function(){
        this.__LOCAL__.ctx.beginPath();
        this.__LOCAL__.ctx.rect(0, 0, 640, 400);
        this.__LOCAL__.ctx.fillStyle = "rgb("+this.__LOCAL__.colour.background.join()+")";
        this.__LOCAL__.ctx.fill();
    };
    self.prototype.clearLine = function(x){
        this.__LOCAL__.ctx.beginPath();
        this.__LOCAL__.ctx.rect(x*16, 0, 640, 16);
        this.__LOCAL__.ctx.fillStyle = "rgb("+this.__LOCAL__.colour.background.join()+")";
        this.__LOCAL__.ctx.fill();
    };
    self.prototype.clearRow = function(y){
        this.__LOCAL__.ctx.beginPath();
        this.__LOCAL__.ctx.rect(0, y*8, 0, 400);
        this.__LOCAL__.ctx.fillStyle = "rgb("+this.__LOCAL__.colour.background.join()+")";
        this.__LOCAL__.ctx.fill();
    };
    
    self.prototype.push = function(y){
        var screen = this.__LOCAL__.ctx.getImageData(0,0,640,400);
        var screen_data = screen.data;
        for(var l=0;l<y;l++){
            for(var i=0;i<983040;i+=4){
                screen_data[i]   = screen_data[i+40960];
                screen_data[i+1] = screen_data[i+40961];
                screen_data[i+2] = screen_data[i+40962];
                screen_data[i+3] = screen_data[i+40963];
            }
            for(var i=983040;i<1024000;i+=4){
                screen_data[i]   = screen_data[0];
                screen_data[i+1] = screen_data[1];
                screen_data[i+2] = screen_data[2];
                screen_data[i+3] = 0xff;
            }
        }
        this.__LOCAL__.ctx.putImageData(screen, 0, 0);   
    };
    
    //Reset
    self.prototype.reset = function(){
        this.__LOCAL__.colour.foreground = this.COLOUR.GREY;
        this.__LOCAL__.colour.background = this.COLOUR.BLACK;
        this.__LOCAL__.cursor.x = 0;
        this.__LOCAL__.cursor.y = 0;
    };
    
    //Return constructor
    return self;
})();
