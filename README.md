# VGA.js
A simple implimentation of VGA terminal graphics in javascript.

#Usage:
```html
head:
<script src="/js/vga.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function(){
        var canvas = document.getElementById("vga");
        var vga = new VGARenderer(canvas);
        vga.onload = function(){
            vga.setCursor(0,0);
            vga.write("test");
        };
    });
</script>
body:
<canvas id="vga"></canvas>
```
#API:
* vga.setCursor(integer x, integer y) - Set position of cursor
* vga.getCursor() = {"X": x, "Y": y} - Get position of cursor
* vga.setChar(string character) - Sets the character to draw
* vga.draw() - Draws the current character at the cursor
* vga.write(string text) - Draws text at the cursor's position, accepts \n and \r, wraps around automatically
* vga.setForegroundColour([r, g, b]) - Sets the foreground colour
* vga.setForegroundColor([r, g, b]) - Alias for above
* vga.getForegroundColour() - Gets the foreground colour
* vga.getForegroundColor() - Alias for above
* vga.setBackgroundColour([r, g, b]) - Sets the background colour
* vga.setBackgroundColor([r, g, b]) - Alias for above
* vga.getBackgroundColour() - Gets the background colour
* vga.getBackgroundColor() - Alias for above
* vga.clear() - Clears the screen
* vga.clearLine(integer x) - Clears line x
* vga.clearRow(integer y) - Clears row y
* vga.reset() - Resets all cursor parameters
* self.prototype.setBitmap(array[16:integer]) - A array of 8-bit integers representing foreground/background
* self.prototype.push(integer x) - Pushes the screen upwards(or downwards?), forming new lines allowing continuation of text

#Constraints:
* vga.COLOUR.BLACK
* vga.COLOUR.RED
* vga.COLOUR.GREEN
* vga.COLOUR.BROWN
* vga.COLOUR.BLUE
* vga.COLOUR.MAGENTA
* vga.COLOUR.CYAN
* vga.COLOUR.GREY
* vga.COLOUR.LIGHT_DARKGRAY
* vga.COLOUR.LIGHT_RED
* vga.COLOUR.LIGHT_GREEN
* vga.COLOUR.LIGHT_YELLOW
* vga.COLOUR.LIGHT_BLUE
* vga.COLOUR.LIGHT_MAGENTA
* vga.COLOUR.LIGHT_CYAN
* vga.COLOUR.LIGHT_WHITE
* vga.COLOR.BLACK
* vga.COLOR.RED
* vga.COLOR.GREEN
* vga.COLOR.BROWN
* vga.COLOR.BLUE
* vga.COLOR.MAGENTA
* vga.COLOR.CYAN
* vga.COLOR.GREY
* vga.COLOR.LIGHT_DARKGRAY
* vga.COLOR.LIGHT_RED
* vga.COLOR.LIGHT_GREEN
* vga.COLOR.LIGHT_YELLOW
* vga.COLOR.LIGHT_BLUE
* vga.COLOR.LIGHT_MAGENTA
* vga.COLOR.LIGHT_CYAN
* vga.COLOR.LIGHT_WHITE

#Options:
Options can be configured by passing json data to the vga.js script, like so:
```html
<script src="/js/vga.js">{"font":"/my/custom/directory/VGA.font"}</script>
```
Current options are:
* font: Path to .font

#Font format:
VGA.font is stored as a bitmap. 0 means background(or transparent), 1 means foreground(or the font).
Each character from 0 to 255 is represented as 16 8-bit integers, for example, T is looks like this in binary:
```
00000000
00000000
00001000
00011000
00011000
11111110
00011000
00011000
00011000
00011000
00011011
00001110
00000000
00000000
00000000
00000000
```
