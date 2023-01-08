!function(t){var e={};function n(o){if(e[o])return e[o].exports;var c=e[o]={i:o,l:!1,exports:{}};return t[o].call(c.exports,c,c.exports,n),c.l=!0,c.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var c in t)n.d(o,c,function(e){return t[e]}.bind(null,c));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=3)}({3:function(t,e){var n=[],o=[],c=null;function a(t,e,n){return"table"==n?(t[e].logo,'<a href="'+t[e].link+'" onclick="window.open(this.href); return false;">'+e+"</a>"):null==t[e].logo?'<a href="'.concat(t[e].link,'" onclick="window.open(this.href); return false;">').concat(e,"</a>"):'<a href="'.concat(t[e].link,'" onclick="window.open(this.href); return false;"><img class="runner-logo" src="').concat(t[e].logo,'" />').concat(e,"</a>")}function i(t){if(t.includes("COMPLETED"))var e=t.split(" - ")[0];else e=t;return e}$(document).ready(function(){$("tr:not(.day-split):not(.second-row) td:nth-child(2)").each(function(){n.push($(this).text())}),$("tr:not(.day-split):not(.second-row) td:nth-child(3)").each(function(){o.push($(this).text())}),null==localStorage.getItem("scheduleHighlights")?(localStorage.setItem("scheduleHighlights",JSON.stringify({})),c=JSON.parse(localStorage.getItem("scheduleHighlights"))):(c=JSON.parse(localStorage.getItem("scheduleHighlights")),chrome.storage.sync.set({scheduleHighlights:c},function(){console.log("Schedule highlights saved to sync storage")})),$(".text-gdq-black.well").after('<h4 class="text-gdq-black well" id="star-highlight-notice">Clicking the <i class="fa fa-star-o"></i> beside the run will highlight it!<br >Use this to keep track of runs you want to watch.</h4>'),$("tr:not(.day-split):not(.second-row) td:nth-child(1)").each(function(t){$(this).html('<input type="checkbox" class="highlight-run" name="checkbox" id="theater-mode'.concat(t,'"> <label for="theater-mode').concat(t,'">').concat($(this).text(),"</label>"));var e=$(this);$("#theater-mode".concat(t)).change(function(){if($(this).is(":checked")){e.parent().css("background-color","#F0E68C"),e.parent().next(".second-row").css("background-color","#F0E68C");var t=i(e.next("td").text());c[t]=!0,chrome.storage.sync.set({scheduleHighlights:c},function(t){console.log("Schedule highlights updated and saved to sync storage")}),localStorage.setItem("scheduleHighlights",JSON.stringify(c)),console.log("Starred and highlighted ".concat(t," on the schedule"))}else{e.parent().css("background-color","#FFFFFF"),e.parent().next(".second-row").css("background-color","#FFFFFF");var t=i(e.next("td").text());c[t]=!1,localStorage.setItem("scheduleHighlights",JSON.stringify(c)),chrome.storage.sync.set({scheduleHighlights:c},function(){console.log("Schedule highlights updated")}),console.log("Removed the star and highlight for ".concat(t," on the schedule"))}}),1==c[e.next("td").text()]&&$("#theater-mode".concat(t)).prop("checked",!0).change()}),console.log("Adding Runners"),$.getJSON("https://gist.githubusercontent.com/theoriginalcamper/edab0ae312451b94c8d4a01104f900c8/raw/5d0e45e1235e23bd2f01787f9c92b35040362e28/agdq2023_runners.json").done(function(t){console.log(t);var e=t;$.each(o,function(t,n){$("tr:not(.day-split):not(.second-row) td:nth-child(3)").filter(function(){return $(this).text()===n}).each(function(t,o){var c=n.split(", "),i={};console.log(n),0!=n.length&&($.each(c,function(t,n){i[n]=e[n]}),$(this).html(function(t,e){var n=_.keys(t),o="by ";if("table"==e&&(o=""),n.length>2){var c=n.pop(),i=n.pop();$.each(n,function(n,c){o+=a(t,c,e)+", "}),o+=a(t,i,e)+" ",o+="and ",o+=a(t,c,e)}else if(2==n.length){var c=n.pop(),i=n.pop();o+=a(t,i,e),o+=" and ",o+=a(t,c,e)}else 1==n.length?(n[0],o+=a(t,n[0],e)):(console.log("Error no runners."),o="");return o}(i,"table")))})})}),console.log("Starting to add links"),$("td:contains(".concat("Super Mario World","):first")).text("Super Mario World Race"),$("td:contains(".concat("The Legend of Zelda: Ocarina of Time",")")).eq(1).text("The Legend of Zelda: Ocarina of Time Glitch Exhibition"),$.getJSON("https://gist.githubusercontent.com/theoriginalcamper/11d77c85b1397c46a3b993b3c1cba326/raw/agdq2023-vod.json").done(function(t){console.log(t);var e=_.keys(t);console.log(e),$.each(e,function(e,n){var o=function(t,e){var n="https://www.twitch.tv/gamesdonequick/v/".concat(e[t]["video-link"],"?t=").concat(e[t].time);if(void 0!==e[t].youtube){var o=e[t].youtube;return"".concat(t,' - <i class="fa fa-check"></i> COMPLETED <a href="').concat(n,'" class="vod-link"><i class="fa fa-twitch"></i></a> <a href="').concat(o,'" class="vod-link"><i class="fa fa-youtube"></i></a>')}return'<a href="'.concat(n,'" class="vod-link">').concat(t,' - <i class="fa fa-check"></i> COMPLETED <i class="fa fa-twitch"></i> Twitch Only</a>')}(n,t);$("tr:not(.day-split):not(.second-row) td:nth-child(2)").filter(function(t){return $(this).text()==n}).html(o)}),console.log("Done")}),console.log("Starting to add bid war indications"),$("#star-highlight-notice").before('<h4 class="text-gdq-black well"><a href="https://gamesdonequick.com/tracker/bids/AGDQ2023">Donation Incentives Bid War Tracker</a></h4>')})}});
//# sourceMappingURL=gdqVodContentscript.js.map