"use strict";$(document).ready(function(){function e(e){"add"==e?(console.log("Switch is on. Adding Twitch iframe and modifying UI."),$(".messages-wrapper").before('<iframe id="twitch-embed" src="https://player.twitch.tv/?channel=gamesdonequick" style="margin: auto;" width="560" height="315" frameborder="0" scrolling="no" allowFullscreen="true" class="center-block"></iframe>')):"remove"==e&&(console.log("Switch is off. Removing Twitch iframe and UI changes."),$("#twitch-embed").remove())}console.log("Hello Discord!"),console.log($(".messages-wrapper"));var t=setInterval(function(){$(".messages-wrapper").length>0&&(console.log("Add CSS to Messages Panel"),$(".messages-wrapper").css("height","400px"),clearInterval(t))},1e3),a=setInterval(function(){$(".links").length>0&&(console.log("Add Switch to Links Panel"),$(".links").html('<label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label>'),$(".links").append('<input type="checkbox" data-size="mini" name="twitch-player-display">'),clearInterval(a),$("[name='twitch-player-display']").bootstrapSwitch(),console.log($("[name='twitch-player-display']").bootstrapSwitch("state")),$('input[name="twitch-player-display"]').on("switchChange.bootstrapSwitch",function(t,a){console.log("Clicked Twitch Switch."),console.log($("[name='twitch-player-display']").bootstrapSwitch("state")),e($('input[name="twitch-player-display"]').bootstrapSwitch("state")?"add":"remove")}))},1e3)});
//# sourceMappingURL=discord-contentscript.js.map
