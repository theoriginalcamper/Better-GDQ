!function(t){var e={};function n(a){if(e[a])return e[a].exports;var s=e[a]={i:a,l:!1,exports:{}};return t[a].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=t,n.c=e,n.d=function(t,e,a){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)n.d(a,s,function(e){return t[e]}.bind(null,s));return a},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([,function(t,e){var n=document.createElement("div"),a=document.createElement("div"),s='<a id="gdq-speedrun-link" class="speedrun-link" onclick="window.open(this.href); return false;"></a>';n.id="gdq-runners-information",a.id="gdq-link-container",$(document).ready(function(){console.log("Hello Discord!");var t=null,e=!1,i=null,o=$(document).width()-$(".guilds-wrapper").width()-$(".messages-wrapper").width(),l="small",r=document.createElement("style");r.type="text/css",r.textContent="@font-face { font-family: FontAwesome; src: url(".concat(chrome.extension.getURL("/fonts/fontawesome-webfont.woff"),");}"),document.head.appendChild(r);var c=setInterval(function(){if($('[class*="usernameContainer"]').length>0){var t=$('[class^="listItem-2P"]').filter(function(t){var e=$("span",this).attr("style");if(void 0!==e&&e.split(";").filter(function(t){return/^opacity: 1$/.test(t)}).length>0)return $(this)});(t.has('div[href^="/channels/140605087511740416/"]').length>0||t.has('div[href^="/channels/85369684286767104/"]').length>0)&&(console.log("Add Switch to Links Panel"),$("#app-mount").before('\n\t\t\t\t\t\t\t<header id="gdq-header" style="width: '.concat($('div[class^="chat-"] > section > div[class^="children"]').width(),"px; height: ").concat($('div[class^="title-"]').outerHeight()-1,"px; overflow: hidden; min-height: 48px; position: fixed; top: 0px; left: ").concat($('[class^="unreadMentionsIndicatorTop-"]').outerWidth()+$('div[class^="sidebar-"]').width(),'px;">\n\t\t\t\t\t\t\t\t<div class="extension-container">\n\t\t\t\t\t\t\t\t\t<div id="options" style="transform: translateY(37.5%);">\n\t\t\t\t\t\t\t\t\t\t<i class="fa fa-calendar collapsed" data-toggle="collapse" data-target="#collapseCalendar" aria-expanded="false"></i>\n\t\t\t\t\t\t\t\t\t\t<i class="fa fa-refresh" id="settings-icon"></i>\n\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t\t<div class="game-information">\n\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t\t<div style="clear:both;"></div>\n\t\t\t\t\t\t\t\t\t<div class="collapse" id="collapseCalendar" style="padding-top: 10px; height: 0px;">\n\t\t\t\t\t\t\t\t\t\t\x3c!-- Schedule --\x3e\n\t\t\t\t\t\t\t\t\t\t<p><i class="fa fa-calendar" style="margin-right: 10px;"></i> Next Runs</p>\n\t\t\t\t\t\t\t\t\t\t<table class="table" id="schedule-table" style="border-collapse: collapse;">\n\t\t\t\t\t\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t\t\t\t\t</tbody>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</header>\n\t\t\t')),i=$("#gdq-header").css("height"),console.log("Width: "+$("#gdq-header").width()),$(".header-toolbar").css("margin-left","0px"),$(".game-information").append(a),$("#gdq-link-container").html("<b>Current Game: </b>"),$("#gdq-link-container").append(s),$(".game-information").append(n),$("#collapseCalendar").on("show.bs.collapse",function(){$("#gdq-header").css("height","auto")}),$("#collapseCalendar").on("hide.bs.collapse",function(){$("#gdq-header").css("height",i)}),x.postMessage({message:"refresh"}),$('[class*="usernameContainer"]').parent().parent().css("margin-bottom","30px"),$("#gdq-header").after('<div id="twitch-switch" style="position: fixed; width: '.concat($('div[class^="channels-"]').width(),"px; height: 22px; left: ").concat($('[class^="unreadMentionsIndicatorTop-"]').outerWidth(),'px; bottom: 0;"><label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label></div>')),$("#twitch-switch").append('<input type="checkbox" data-size="mini" name="twitch-player-display">'),$("#twitch-switch").append('<i class="fa fa-expand" id="player-size-icon" style="margin-left: 10px; display: none;"></i>'),$("[name='twitch-player-display']").bootstrapSwitch(),clearInterval(c),$('input[name="twitch-player-display"]').on("switchChange.bootstrapSwitch",function(t,e){console.log("Clicked Twitch Switch. Current switch state: ".concat($("[name='twitch-player-display']").bootstrapSwitch("state"))),$('input[name="twitch-player-display"]').bootstrapSwitch("state")?p("add"):p("remove")}))}},1e3),d=setInterval(function(){$(".fa-refresh").length>0&&($(".fa.fa-refresh").click(function(){this.className="fa fa-refresh fa-spin",console.log("Refreshing..."),x.postMessage({message:"refresh"});var t=this;console.log(t),setTimeout(function(){t.className="fa fa-refresh",console.log("Refresh complete.")},2e3)}),clearInterval(d))},1e3),h=setInterval(function(){$("#player-size-icon").length>0&&($("#player-size-icon").click(function(){console.log("Clicked size icon"),$("#player-size-icon").hasClass("fa-expand")?(console.log("EXPAND"),g(l="large"),this.className="fa fa-compress"):$("#player-size-icon").hasClass("fa-compress")&&(console.log("COMPRESS"),console.log(o),g(l="small"),this.className="fa fa-expand")}),clearInterval(h))},1e3);function p(n){"add"==n?(console.log("Switch is on. Adding Twitch iframe and modifying UI."),$("button.active").click(),e=!0,f("add"),$('[aria-label*="Member List"]').is('[class*="selected"]')?(t=!0,$('[aria-label*="Member List"]').click()):t=!1,console.log(Math.round($(document).width()-$('[class^="unreadMentionsIndicatorTop-"]').outerWidth()-$('[class^="chat"]').width()*parseFloat($('[class^="messagesWrapper"]')[0].style.width)/100)),o=Math.round($(document).width()-$('[class^="unreadMentionsIndicatorTop-"]').outerWidth()-$('[class^="chat"]').width()*parseFloat($('[class^="messagesWrapper"]')[0].style.width)/100),$("#app-mount").before('<div id="twitch-container" style="width: '.concat(o-10,"px; height: ").concat($(document).height()-$('[aria-label="Channel header"]').outerHeight()-$("#twitch-switch").outerHeight(),"px; position: fixed; z-index:100; top: ").concat($('[aria-label="Channel header"]').outerHeight(),"px; left: ").concat($('[class^="unreadMentionsIndicatorTop-"]').outerWidth(),'px;"></div>')),$("#app-mount").before('<script type="text/javascript">\n\t\t\t\t\t      new Twitch.Embed("twitch-container", {\n\t\t\t\t\t        width: "100%",\n\t\t\t\t\t        height: "100%",\n\t\t\t\t\t\t\t\t\tlayout: "video",\n\t\t\t\t\t\t\t\t\tallowfullscreen: true,\n\t\t\t\t\t        channel: "gamesdonequick",\n\t\t\t\t\t\t\t\t\tparent: ["discord.com"]\n\t\t\t\t\t      });\n\t\t\t\t\t    <\/script>')):"remove"==n&&(console.log("Switch is off. Removing Twitch iframe and UI changes."),$("#twitch-container").remove(),e=!1,f("remove"),1==t&&$('[aria-label*="Member List"]').click())}function g(t){"large"==l?($("#twitch-container").css("width","70%"),$('[class^="messagesWrapper"]').css("width","32%"),$('[class^="messagesWrapper"]').next("form").css({width:"29%","margin-right":"2%","margin-left":"0px"})):"small"==l&&($('[class^="messagesWrapper"]').css("width","48%"),$('[class^="messagesWrapper"]').next("form").css({width:"44%","margin-right":"2%","margin-left":"0px"}),$("#twitch-container").css("width",$(document).width()-$('[class^="unreadMentionsIndicatorTop-"]').outerWidth()-$('[class^="messagesWrapper"]').width()))}function u(t){"add"==t?$("#gdq-header").css("display",""):"remove"==t&&$("#gdq-header").css("display","none")}function f(t){console.log("TwitchActive: "+e),"add"==t?(console.log("Rearranging Discord UI"),$('[class^="messagesWrapper"]').parent().css("align-items","flex-end"),g(),$("#player-size-icon").css("display","inline-block")):"remove"==t&&(console.log("Discord UI returned to normal"),$('[class^="messagesWrapper"]').parent().removeAttr("style"),$('[class^="messagesWrapper"]').removeAttr("style"),$('[class^="messagesWrapper"]').next("form").removeAttr("style"),$("#player-size-icon").css("display","none"))}function m(t){$("#gdq-runners-information").html(w(t.runner,"header")),$("#gdq-speedrun-link").attr("href",t.link),null!=t.category?$("#gdq-speedrun-link").html("".concat(t.game," (").concat(t.category,")")):$("#gdq-speedrun-link").html("".concat(t.game))}function v(t){if(console.log("Calendar updating..."),console.log(t),null!=t){console.log("Calendar not null."),$("#schedule-table tbody").empty();var e="";_.each(t.order,function(n,a){e+=function(t,e,n){console.log(t),console.log(e);var a=w(t.runner,"table");if(null!=t.category)var s=t.title+" ("+t.category+")";else var s=t.title;if(void 0===e[t.title]||0==e[t.title])var i="";else{var i="background-color:#555555;";s='<i class="fa fa-star"></i> '+s}return"<tr style=".concat(i,'>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<th scope="row" style="text-align: center; vertical-align: middle;">').concat(n,'</th>\n\t                                <td>\n\t                                    <a class="speedrun-link" id="next-game-title" href="').concat(t.link,'" onclick="window.open(this.href); return false;"> ').concat(s,'</a>\n\t                                    <p class="runners-links" id="next-runners-information">').concat(a,'</p>\n\t                                </td>\n\t                                <td style="text-align: center; vertical-align: middle;">\n\t                                    <p class="text-right"><i class="fa fa-clock-o" aria-hidden="true"></i> ').concat(t.estimate,"</p>\n\t                                </td>\n\t                              </tr>")}(t.schedule[n],t.highlights,a+1),console.log(e)}),$("#schedule-table tbody").html(e),console.log("Calendar updated.")}}function w(t,e){var n=_.keys(t),a="by ";if("table"!=e&&(a="<b>Current Runners: </b>"),n.length>2){var s=n.pop(),i=n.pop();$.each(n,function(e,n){a+=y(t,n)+", "}),a+=y(t,i)+" ",a+="and ",a+=y(t,s)}else if(2==n.length){s=n.pop(),i=n.pop();a+=y(t,i),a+=" and ",a+=y(t,s)}else if(1==n.length){n[0];a+=y(t,n[0])}else console.log("Error no runners."),a="";return a}function y(t,e){return null==t[e].logo?'<a href="'.concat(t[e].link,'" onclick="window.open(this.href); return false;">').concat(e,"</a>"):'<a href="'.concat(t[e].link,'" onclick="window.open(this.href); return false;"><img class="runner-logo" src="').concat(t[e].logo,'" style="width: 14px;"/>').concat(e,"</a>")}var b=setInterval(function(){var t=$('[class^="listItem-2P"]').filter(function(t){var e=$("span",this).attr("style");if(void 0!==e){var n=e.split(";");if(console.log(n),n.filter(function(t){return/^opacity: 1$/.test(t)}).length>0)return $(this)}});console.log(t),$('[class*="selected-"]').length>0&&($(document).on("click",'[class^="listItem-2P"] > div',function(){if(console.log($('[class^="listItem-2P"] > div').length),e)if($(this).has('div[href^="/channels/140605087511740416/"]').length>0||$(this).has('div[href^="/channels/85369684286767104"]').length>0){$("#twitch-container").css("display","");var t=setInterval(function(){f("add"),clearInterval(t)},500)}else $("#twitch-container").css("display","none"),f("remove");$("#twitch-switch").length&&$("[class*=usernameContainer]",$('[class^="channels"]')).parent().parent().css("margin-bottom","30px"),$(this).has('div[href^="/channels/140605087511740416/"]').length>0||$(this).has('div[href^="/channels/85369684286767104"]').length>0?(console.log("Add Header - Debug"),u("add")):u("remove")}),$('[class^="listItem-2P"] > [class^="listItemWrapper"]').on("click",function(){u("remove"),e&&($("#twitch-container").css("display","none"),f("remove"))}),clearInterval(b))},1e3),x=chrome.runtime.connect({name:"gdq"});x.postMessage({message:"request"}),x.onMessage.addListener(function(t){"changed"==t.status?(console.log(t),console.log("The Current Game is: "+t.game),$("#gdq-header").length>0&&(m(t),v(t.calendar))):"unchanged"==t.status?console.log("Current game has not changed since last request"):"reload"==t.status&&(console.log("Reload has occurred"),console.log(t),console.log("The Current Game is: "+t.game),$("#gdq-header").length>0&&(m(t),v(t.calendar)))}),setInterval(function(){x.postMessage({message:"request"})},3e5)})}]);
//# sourceMappingURL=discordContentscript.js.map