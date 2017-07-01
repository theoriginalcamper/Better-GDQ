var gameArray = [];
var runnerArray = [];
var storageObj = null;
$(document).ready(function() {
	retrieveGameTitleList();
	loadHighlightStorage();
	addHighlights();
	addRunnerLinks();
	addVodLinks();
	addBidWars();
});


function retrieveGameTitleList() {
	$('tr:not(.day-split):not(.second-row) td:nth-child(2)').each(function() {
		gameArray.push($(this).text());
	});

	$('tr:not(.day-split):not(.second-row) td:nth-child(3)').each(function() {
		runnerArray.push($(this).text());
	});
}

function loadHighlightStorage() {
	if(localStorage.getItem('scheduleHighlights') == null) {
		localStorage.setItem('scheduleHighlights', JSON.stringify({}));
		storageObj = JSON.parse(localStorage.getItem('scheduleHighlights'));
	} else {
		storageObj = JSON.parse(localStorage.getItem('scheduleHighlights'));
		chrome.storage.sync.set({'scheduleHighlights': storageObj}, function() {
			console.log('Schedule highlights saved to sync storage');
		});
	}
}

function addHighlights() {
	$('.text-gdq-black.well').after('<h4 class="text-gdq-black well" id="star-highlight-notice">Clicking the <i class="fa fa-star-o"></i> beside the run will highlight it!<br >Use this to keep track of runs you want to watch.</h4>');

	$('tr:not(.day-split):not(.second-row) td:nth-child(1)').each(function(index) {
		$(this).html(`<input type="checkbox" class="highlight-run" name="checkbox" id="theater-mode${index}"> <label for="theater-mode${index}">${$(this).text()}</label>`)
		var that = $(this)
		$(`#theater-mode${index}`).change(function() {
        	if($(this).is(":checked")) {
            	that.parent().css('background-color', '#F0E68C');
            	that.parent().next('.second-row').css('background-color', '#F0E68C');

            	var gameTitle = getGameTitleString(that.next('td').text());

            	storageObj[gameTitle] = true;

            	chrome.storage.sync.set({'scheduleHighlights': storageObj}, function(data) {
            		console.log("Schedule highlights updated and saved to sync storage");
            	});
            	localStorage.setItem('scheduleHighlights', JSON.stringify(storageObj));
            	console.log(`Starred and highlighted ${gameTitle} on the schedule`);
            } else {
            	that.parent().css('background-color', '#FFFFFF');
            	that.parent().next('.second-row').css('background-color', '#FFFFFF');

            	var gameTitle = getGameTitleString(that.next('td').text());

            	storageObj[gameTitle] = false;

            	localStorage.setItem('scheduleHighlights', JSON.stringify(storageObj));
            	chrome.storage.sync.set({'scheduleHighlights': storageObj}, function() {
            		console.log("Schedule highlights updated");
            	});
            	console.log(`Removed the star and highlight for ${gameTitle} on the schedule`);
            }
        });

    	if (storageObj[that.next('td').text()] == true) {
    		$(`#theater-mode${index}`).prop("checked", true).change();
    	}
    });
}

function addBidWars() {
	console.log("Starting to add bid war indications");
	$('#star-highlight-notice').before('<h4 class="text-gdq-black well"><a href="https://gamesdonequick.com/tracker/bids/sgdq2017">Donation Incentives Bid War Tracker</a></h4>');
}

function addRunnerLinks() {
	console.log("Adding Runners");

	$.getJSON(chrome.extension.getURL('/json/sgdq2017_runners.json')).done(function (resp) {
	    console.log(resp);
	    var runnerJSON = resp;

	    $.each(runnerArray, function(index, runnerString) {
	    	$(`tr:not(.day-split):not(.second-row) td:nth-child(3)`).filter(function() {
			    return $(this).text() === runnerString;
				}).each(function(index, element) {
	    		var runners = runnerString.split(', ');
	    		var runnerObjects = {};

	    		console.log(runnerString);
	    		$.each(runners, function(index, runner) {
	    			runnerObjects[runner] = runnerJSON[runner];
	    		})
	    		$(this).html(generateFormattedRunnerString(runnerObjects, 'table'));
	    	});
	    });
	});
}

function generateFormattedRunnerString(runners, location) {
    var runners_keys = _.keys(runners);
    var runner_string = "by ";
    if (location == 'table') {
    		runner_string = "";
    }
    if (runners_keys.length > 2) {
        var last_runner = runners_keys.pop();
        var second_runner = runners_keys.pop();
        $.each(runners_keys, function (index, runner_key) {
            runner_string += generateRunnerElement(runners, runner_key, location) + ', ';
        });

        runner_string += generateRunnerElement(runners, second_runner, location) + ' ';
        runner_string += 'and ';
        runner_string += generateRunnerElement(runners, last_runner, location);
    } else if (runners_keys.length == 2) {
        var last_runner = runners_keys.pop();
        var second_runner = runners_keys.pop();

        runner_string += generateRunnerElement(runners, second_runner,location);
        runner_string += ' and ';
        runner_string += generateRunnerElement(runners, last_runner, location);
    } else if (runners_keys.length == 1) {
        var runner_key = runners_keys[0];
        runner_string += generateRunnerElement(runners, runners_keys[0], location);
    } else {
        console.log("Error no runners.");
        runner_string = "";
    }
    return runner_string;
}

function generateRunnerElement(runnerObject, runner_key, location) {
	if (location == 'table') {
		if (runnerObject[runner_key]["logo"] == null) {
        	return '<a href="' + runnerObject[runner_key]["link"] + '" onclick="window.open(this.href); return false;">' + runner_key + '</a>';
   		} else {
        	return '<a href="' + runnerObject[runner_key]["link"] + '" onclick="window.open(this.href); return false;">' + runner_key + '</a>';
    	}
	} else {
		if (runnerObject[runner_key]["logo"] == null) {
	        return `<a href="${runnerObject[runner_key]["link"]}" onclick="window.open(this.href); return false;">${runner_key}</a>`;
	    } else {
	        return `<a href="${runnerObject[runner_key]["link"]}" onclick="window.open(this.href); return false;"><img class="runner-logo" src="${runnerObject[runner_key]["logo"]}" />${runner_key}</a>`;
	    }
	}
}

function addVodLinks() {
	console.log("Starting to add links");
	$(`td:contains(${"Super Mario World"}):first`).text('Super Mario World Race');
	$(`td:contains(${"The Legend of Zelda: Ocarina of Time"})`).eq(1).text('The Legend of Zelda: Ocarina of Time Glitch Exhibition');

	$.getJSON("https://gist.githubusercontent.com/theoriginalcamper/8b9870ae4a5158695eb08520c07b849d/raw/sgdq2017-vod.json").done(function(data) {
		console.log(data);
		var titles = _.keys(data);
		console.log(titles);

		$.each(titles, function(index, title) {
			// console.log(title);
			var templateString = generateVodString(title, data);
			$(`tr:not(.day-split):not(.second-row) td:nth-child(2)`).filter(function(index) {return $(this).text() == title}).html(templateString);
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
