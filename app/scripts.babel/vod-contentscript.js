var gameArray = [];
var timeArray = [];
var storageObj = null;
$(document).ready(function() {
	retrieveGameTitleList();
	loadHighlightStorage();
	addHighlights();
	addVodLinks();
});


function retrieveGameTitleList() {
	$('tr:not(.day-split):not(.second-row) td:nth-child(2)').each(function() {
		gameArray.push($(this).text());
	});

	$('tr:not(.day-split):not(.second-row) td:nth-child(1)').each(function() {
		timeArray.push($(this).text());
	});
}

function loadHighlightStorage() {
	if(localStorage.getItem('scheduleHighlights') == null) {
		localStorage.setItem('scheduleHighlights', JSON.stringify({}));
		storageObj = JSON.parse(localStorage.getItem('scheduleHighlights'));
	} else {
		storageObj = JSON.parse(localStorage.getItem('scheduleHighlights'));
	}
}

function addHighlights() {
	$('.text-gdq-black.well').after('<h4 class="text-gdq-black well ">Clicking the <i class="fa fa-star-o"></i> beside the run will highlight it!<br >Use this to keep track of runs you want to watch.</h4>');
	
	$('tr:not(.day-split):not(.second-row) td:nth-child(1)').each(function(index) {
		$(this).html(`<input type="checkbox" class="highlight-run" name="checkbox" id="theater-mode${index}"> <label for="theater-mode${index}">${$(this).text()}</label>`)
		var that = $(this)
		$(`#theater-mode${index}`).change(function() {
        	if($(this).is(":checked")) {
            	that.parent().css('background-color', '#F0E68C');
            	that.parent().next('.second-row').css('background-color', '#F0E68C');
            	
            	var gameTitle = getGameTitleString(that.next('td').text());
            	
            	storageObj[gameTitle] = true;

            	localStorage.setItem('scheduleHighlights', JSON.stringify(storageObj));
            	console.log(`Starred and highlighted ${gameTitle} on the schedule`);
            } else {
            	that.parent().css('background-color', '#FFFFFF');
            	that.parent().next('.second-row').css('background-color', '#FFFFFF');

            	var gameTitle = getGameTitleString(that.next('td').text());

            	storageObj[gameTitle] = false;

            	localStorage.setItem('scheduleHighlights', JSON.stringify(storageObj));
            	console.log(`Removed the star and highlight for ${gameTitle} on the schedule`);
            }
        });

    	if (storageObj[that.next('td').text()] == true) {
    		$(`#theater-mode${index}`).prop("checked", true).change();
    	}
    });
}

function addVodLinks() {
	console.log("Starting to add links");
	$.getJSON("https://gist.githubusercontent.com/theoriginalcamper/30bddc447895b64988412671cfc12898/raw/sgdq2016-vod.json").done(function(data) {
		console.log(data);
		var titles = _.keys(data);
		console.log(titles);

		$.each(titles, function(index, title) {
			console.log(title);
			var templateString = generateVodString(title, data);
			$(`td:contains(${title}):first`).html(templateString);
		});

		console.log("Done");
	});
}

function generateVodString(title, data) {
	var twitchString = `https://www.twitch.tv/gamesdonequick/v/${data[title]["video-link"]}?t=${data[title]["time"]}`

	if (typeof data[title]["youtube"] != 'undefined') {
		var youtubeString = data[title]["youtube"];
		return `${title} - <i class="fa fa-check"></i> COMPLETED <a href="${twitchString}" class="vod-link"><i class="fa fa-twitch"></i></a> <a href="${youtubeString}" class="vod-link"><i class="fa fa-youtube"></i></a>`
	} else {
		return `<a href="${twitchString}" class="vod-link">${title} - <i class="fa fa-check"></i> COMPLETED <i class="fa fa-twitch"></i> Twitch Only</a>`
	}
}

function getGameTitleString(title) {
	if (title.includes("COMPLETED")) {
		var gameTitleString = title.split(" - ")[0];
	} else {
		var gameTitleString = title;
	}

	return gameTitleString;
}