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
			var hrefString = "https://www.twitch.tv/gamesdonequick/v/" + data[title]["video-link"] + "?t=" + data[title]["time"];
			var templateString = "<a href=\"" + hrefString + "\" class=\"vod-link\">" + title + " - <i class=\"fa fa-check\"></i> COMPLETED</a>";
			$("td:contains(" + title + "):first").html(templateString);
		});

		console.log("Done");
	});
}