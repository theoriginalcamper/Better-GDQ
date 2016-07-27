var gameArray = [];
var storageObj = null;
$(document).ready(function() {
	retrieveGameTitleList();
	loadHighlightStorage();
	addHighlights();
    addSpeedrunLinks();
	addVodLinks();
});

function retrieveGameTitleList() {
	$('tr.border-top:not(.row2) td.center-sm').each(function() {
		gameArray.push($(this).text());
	});
}

function loadHighlightStorage() {
	if(localStorage.getItem('esa16scheduleHighlights') == null) {
		localStorage.setItem('esa16scheduleHighlights', JSON.stringify({}));
		storageObj = JSON.parse(localStorage.getItem('esa16scheduleHighlights'));
	} else {
		storageObj = JSON.parse(localStorage.getItem('esa16scheduleHighlights'));
		chrome.storage.sync.set({'esa16scheduleHighlights': storageObj}, function() {
			console.log('Schedule highlights saved to sync storage');
		});
	}
}

function addHighlights() {
	$('.schedulenote').after('<div class="panel panel-body center" id="star-highlight-notice" style="font-size: 16px;">Clicking the <i class="fa fa-star-o"></i> beside the run will highlight it!<br >Use this to keep track of runs you want to watch.</h4>');
	
	$('tr.border-top:not(.row2) td:nth-child(1)').each(function(index) {
		$(this).html(`<input type="checkbox" class="highlight-run" name="checkbox" id="theater-mode${index}"> <label for="theater-mode${index}">${$(this).text()}</label>`)
		var that = $(this)
		$(`#theater-mode${index}`).change(function() {
        	if($(this).is(":checked")) {
            	that.parent().css('background-color', '#444');
            	
            	var gameTitle = getGameTitleString(that.next('td').text());
            	
            	storageObj[gameTitle] = true;

            	chrome.storage.sync.set({'esa16scheduleHighlights': storageObj}, function(data) {
            		console.log("Schedule highlights updated and saved to sync storage");
            	});
            	localStorage.setItem('esa16scheduleHighlights', JSON.stringify(storageObj));
            	console.log(`Starred and highlighted ${gameTitle} on the schedule`);
            } else {
            	that.parent().css('background-color', 'transparent');

            	var gameTitle = getGameTitleString(that.next('td').text());

            	storageObj[gameTitle] = false;

            	localStorage.setItem('esa16scheduleHighlights', JSON.stringify(storageObj));
            	chrome.storage.sync.set({'esa16scheduleHighlights': storageObj}, function() {
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

function addSpeedrunLinks() {
	$.getJSON('https://gist.githubusercontent.com/theoriginalcamper/cde736fb9e43b34cf8f49c0c82d7c564/raw/esa_schedule2016.json').done(function (resp) {
		var scheduleJSON = resp;
		$('tr.border-top:not(.row2) td.center-sm:not(:has(> a))').each(function() {
			var clonedElement = $(this).clone()
            clonedElement.find('.visible-xs').remove();
            var clonedXS = $('.visible-xs', this);

            var gameTitle = clonedElement.text();
            console.log(gameTitle);
			if (scheduleJSON[gameTitle]['link'] != null) {
                console.log(gameTitle);
				$(this).html(`<a href="${scheduleJSON[gameTitle]['link']}">${gameTitle}</a>`);
                $(this).append(clonedXS);
			}
		});

        $('tr.border-top:not(.row2) td.center-sm:contains(Mega Man)').each(function() {
            var clonedElement = $(this).clone()
            clonedElement.find('.visible-xs').remove();
            var clonedXS = $('.visible-xs', this);

            var gameTitle = clonedElement.text();
            console.log(gameTitle);
            if (scheduleJSON[gameTitle]['link'] != null) {
                console.log(gameTitle);
                $(this).html(`<a href="${scheduleJSON[gameTitle]['link']}">${gameTitle}</a>`);
                $(this).append(clonedXS);
            }
        });
	});
}

function getGameTitleString(title) {
	if (title.includes("COMPLETED")) {
		var gameTitleString = title.split(" - ")[0];
	} else {
		var gameTitleString = title;
	}

	return gameTitleString;
}

function addVodLinks() {
    $.getJSON('https://gist.githubusercontent.com/theoriginalcamper/7ee2ff2401968aff754c7e045abbb14b/raw/esa2016-vod.json').done(function(data) {
        console.log(data);
        var titles = _.keys(data);
        console.log(titles);

        $.each(titles, function(index, title) {
            // console.log(title);
            var templateString = generateVodString(title, data);
            $(`tr.border-top:not(.row2) td.center-sm`).filter(function(index) {
                return $(this).text().indexOf(title) >= 0
            }).append(templateString);
        });

        console.log("Done");
    });
}

function generateVodString(title, data) {
    var twitchString = `https://www.twitch.tv/esamarathon/v/${data[title]["video-link"]}?t=${data[title]["time"]}`

    if (typeof data[title]["youtube"] != 'undefined') {
        var youtubeString = data[title]["youtube"];
        return ` - <i class="fa fa-check"></i> COMPLETED <a href="${twitchString}" class="vod-link"><i class="fa fa-twitch"></i></a> <a href="${youtubeString}" class="vod-link"><i class="fa fa-youtube-play"></i></a>`
    } else {
        return ` - <i class="fa fa-check"></i> COMPLETED <a href="${twitchString}" class="vod-link"><i class="fa fa-twitch"></i></a>`
    }
}