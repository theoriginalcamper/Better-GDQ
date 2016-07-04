"use strict";

$(document).ready(function () {
	addVodLinks();
});

function addVodLinks() {
	console.log("Starting to add links");
	$.getJSON("https://gist.githubusercontent.com/theoriginalcamper/30bddc447895b64988412671cfc12898/raw/sgdq2016-vod.json").done(function (data) {
		console.log(data);
		var titles = _.keys(data);
		console.log(titles);

		$.each(titles, function (index, title) {
			console.log(title);
			var templateString = generateVodString(title, data);
			$("td:contains(" + title + "):first").html(templateString);
		});

		console.log("Done");
	});
}

function generateVodString(title, data) {
	var twitchString = "https://www.twitch.tv/gamesdonequick/v/" + data[title]["video-link"] + "?t=" + data[title]["time"];

	if (typeof data[title]["youtube"] != 'undefined') {
		var youtubeString = data[title]["youtube"];
		return title + " - <i class=\"fa fa-check\"></i> COMPLETED <a href=\"" + twitchString + "\" class=\"vod-link\"><i class=\"fa fa-twitch\"></i></a> <a href=\"" + youtubeString + "\" class=\"vod-link\"><i class=\"fa fa-youtube\"></i></a>";
	} else {
		return "<a href=\"" + twitchString + "\" class=\"vod-link\">" + title + " - <i class=\"fa fa-check\"></i> COMPLETED <i class=\"fa fa-twitch\"></i> Twitch Only</a>";
	}
}