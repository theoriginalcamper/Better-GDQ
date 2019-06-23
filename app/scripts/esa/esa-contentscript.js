'use strict';

// Timer Variables

var refreshTimer = null;
var refreshRate = 300000;

var port = chrome.runtime.connect({name: "esa"});

var page_elem = document.querySelector('body');
console.log(page_elem);

var runners_paragraph = document.createElement('p');
var game_link_a = document.createElement('a'); 

runners_paragraph.id = "gdq-runners-information";
game_link_a.id = "gdq-speedrun-link";
game_link_a.className = "speedrun-link";

$.get(chrome.extension.getURL('/html/gdq-footer.html'), function(data) {
    $($.parseHTML(data)).appendTo(page_elem);
});

$.get(chrome.extension.getURL('/html/esa-settings-menu.html'), function(data) {
    var menu_ul = $(".settings-menu");
    $($.parseHTML(data)).appendTo(menu_ul);
    $('#options > .dropup').css('vertical-align', 'top');
});

$(page_elem).on('click', 'ul.dropdown-menu', function (e) {
  e.stopPropagation();
});


$(document).ready(function() {
	var twitchHeight = null;
	var twitchChatHeight = null;
	var checkTwitchHeight = setInterval(function() {
		if ($('.twitch').length > 0) {
			twitchHeight = $('.twitch').height();
			console.log(twitchHeight + 'px');
			clearInterval(checkTwitchHeight);
		}
	}, 1000);

	var checkTwitchChatHeight = setInterval(function() {
		if ($('.twitchchat iframe').length > 0) {
			twitchChatHeight = $('.twitchchat iframe').height();
			console.log(twitchHeight + 'px');
			clearInterval(checkTwitchChatHeight);
		}
	}, 1000);

    $(page_elem).css('margin-bottom', '70px');
    $('.game-information').append(game_link_a);
    $('.game-information').append(runners_paragraph);

    $("#refresh-timer-update").on('submit', function(e) {
        e.preventDefault();

        var updateRefreshTimerValue = $('#refresh-timer-update').serializeArray()[0]["value"];

        updateRefreshRate(updateRefreshTimerValue);

        return false;
    });

    $("#schedule-items-update").on('submit', function(e) {
        e.preventDefault();

        var updateScheduleItemsValue = $('#schedule-items-update').serializeArray()[0]["value"];

        console.log(updateScheduleItemsValue);
        sendUpdateCalendarItemsNumber(updateScheduleItemsValue);

        return false;
    });

    $(".fa.fa-refresh").click(function() {
        this.className = 'fa fa-refresh fa-spin';
        console.log('Refreshing...');
        requestDataFromBackground();
        var that = this;
        setTimeout(function() {
            that.className = 'fa fa-refresh';
            console.log("Refresh complete.")
        }, 2000);
    });

    $(".fa.fa-cog").click(function() {
        this.className = 'fa fa-cog fa-spin';
        var that = this;
        setTimeout(function() {
            that.className = 'fa fa-cog';
        }, 2000);
    });

    $("[name='quakenet-chat-switch']").bootstrapSwitch();
    $("[name='theater-mode']").bootstrapSwitch();

    /*
        QUAKENET IRC THEATER MODE BUTTON
    */

    $('input[name="theater-mode"]').on('switchChange.bootstrapSwitch', function (event, state) {
        if ($('input[name="quakenet-chat-switch"]').bootstrapSwitch('state')) {
            updateQuakeChat('remove');
            $('input[name="quakenet-chat-switch"]').bootstrapSwitch('state', false, true);
        }
        
        if ($('input[name="theater-mode"]').bootstrapSwitch('state')) {
            $('.col-sm-8.padding-right-none').html('');
            $.get(chrome.extension.getURL('/html/esa-quakenet-theater-mode.html'), function (data) {
                console.log("Adding theater mode!")
                console.log($.parseHTML(data));
                $('.navbar').before($.parseHTML(data));
            });
            $('#footer').addClass('theater-footer').removeClass('standard-footer');
        } else {
            $('#theater-mode-div').remove();
            $('.col-sm-8.padding-right-none').html(`<iframe src="http://player.twitch.tv/?channel=esamarathon" frameborder="0" scrolling="no" allowFullscreen="true" class="twitch" id="twitch" style="height: ${twitchHeight}px"></iframe>`);
            $('#footer').addClass('standard-footer').removeClass('theater-footer');
        }
    });

    $('input[name="quakenet-chat-switch"]').on('switchChange.bootstrapSwitch', function(event, state) {
        console.log('Clicked QUAKENET Switch.');
        console.log(this);
        console.log("Quake State:");
        console.log($('input[name="quakenet-chat-switch"]').bootstrapSwitch('state'));

        if ($('input[name="quakenet-chat-switch"]').bootstrapSwitch('state')) {
            updateQuakeChat('add');
        } else {
            updateQuakeChat('remove');
        }
    });

    function updateQuakeChat(msg) {
        if(msg == 'add') {
            console.log('Switch is on. Adding Chat iframe and modifying UI.');
            $.get(chrome.extension.getURL('/html/esa-quakenet-chat.html'), function(data) {
                $('.twitchchat').html($.parseHTML(data));
                $('.twitchchat').height(twitchHeight);
            });
        } else if (msg == 'remove') {
            console.log('Switch is off. Removing UI.');
            $('#quakenet-chat').remove();
            $('#quakenet-clear').remove();
            $('.twitchchat').html(`<iframe src="http://twitch.tv/esamarathon/chat?popout=" style="height: ${twitchHeight}px"></iframe>`);
            $('.twitchchat iframe').height(twitchChatHeight);
        }
    }
});

//Port Listeners

var port = chrome.runtime.connect({name: "esa"});
port.postMessage({message: "request"});
port.onMessage.addListener(function(msg) {
    if (msg.status == "changed") {
        console.log(msg);
        console.log("The Current Game is: " + msg.game);
        if ($()) {
            updateUI(msg);
            updateCalendarUI(msg.calendar);   
        }
    } else if (msg.status == "unchanged") {
        console.log("Current game has not changed since last request");
    } else if (msg.status == "reload") {
        console.log("Reload has occurred");
        console.log(msg);
        console.log("The Current Game is: " + msg.game);
        updateUI(msg);
        updateCalendarUI(msg.calendar);
    }
});

/*
  Object
    Game
    Runner
    Estimate
    Category
    Link
*/

function updateUI(msg) {
    runners_paragraph.innerHTML = generateFormattedRunnerString(msg.runner);
    game_link_a.href = msg.link;
    game_link_a.onclick = function() {
        window.open(this.href); 
        return false;
    }
    
    if (msg.category != null) {
        game_link_a.innerHTML = msg.game + ' (' + msg.category +')';
    } else {
        game_link_a.innerHTML = msg.game;
    }
}

function updateCalendarUI(msg) {
    console.log("Calendar updating...");
    console.log(msg);
    if (msg != null) {
        $('#schedule-table tbody').empty();
        
        var scheduleString = "";
        _.each(msg.order, function(gameTitle, index) {
            scheduleString += generateScheduleItemString(msg.schedule[gameTitle], msg.highlights, index + 1);
        });

        $('#collapseCalendarHeader').css('margin-bottom', '20px');
        $('#schedule-table tbody').html(scheduleString);

        console.log("Calendar updated.")
    } else {
        return;
    }
}

function generateFormattedRunnerString(runners) {
    var runners_keys = _.keys(runners);
    var runner_string = "by ";
    if (runners_keys.length > 2) {
        var last_runner = runners_keys.pop()
        var  second_runner = runners_keys.pop();
        $.each(runners_keys, function(index, runner_key) {
            runner_string += generateRunnerElement(runners, runner_key) + ', ';
        });

        runner_string += generateRunnerElement(runners, second_runner) + ' ';
        runner_string += 'and '
        runner_string += generateRunnerElement(runners, last_runner);
    } else if (runners_keys.length == 2) {
        var last_runner = runners_keys.pop()
        var  second_runner = runners_keys.pop();
        
        runner_string += generateRunnerElement(runners, second_runner);
        runner_string += ' and ';
        runner_string += generateRunnerElement(runners, last_runner);
    } else if (runners_keys.length == 1) {
        var runner_key = runners_keys[0];
        runner_string += generateRunnerElement(runners, runners_keys[0]);
    } else {
        console.log("Error no runners.")
        runner_string = "";
    }
    return runner_string;
}

function generateRunnerElement(runnerObject, runner_key) {
    if (runnerObject[runner_key]["logo"] == null) {
        return `<a href="${runnerObject[runner_key]["link"]}" onclick="window.open(this.href); return false;">${runner_key}</a>`;
    } else {
        return `<a href="${runnerObject[runner_key]["link"]}" onclick="window.open(this.href); return false;"><img class="runner-logo" src="${runnerObject[runner_key]["logo"]}" />${runner_key}</a>`;
    }
}

function generateScheduleItemString(scheduleItemObject, highlightsObject, index) {
    var runnerString = generateFormattedRunnerString(scheduleItemObject.runner);
    if (scheduleItemObject.category != null) {
        var titleString = scheduleItemObject.title + ' (' + scheduleItemObject.category +')';
    } else {
        var titleString = scheduleItemObject.title;
    }
    
    console.log(highlightsObject);
    

    if (typeof highlightsObject[scheduleItemObject.title] == 'undefined' || highlightsObject[scheduleItemObject.title] == false) {
        var highlightStyle = '';
    } else {
        var highlightStyle = 'background-color:#555555;';
        titleString = '<i class="fa fa-star"></i> ' + titleString;
    }

    var scheduleItemString = `<tr style=${highlightStyle}>
                                <th scope="row">${index}</th>
                                <td style="text-shadow: 0px 0px #000;">
                                    <a class="speedrun-link" id="next-game-title" href="${scheduleItemObject.link}" onclick="window.open(this.href); return false;"> ${titleString}</a>
                                    <p class="runners-links" id="next-runners-information">${runnerString}</p>
                                </td>
                                <td style="width: 114px; text-shadow: 0px 0px #000;">
                                    <p class="text-right"><i class="fa fa-clock-o" aria-hidden="true"></i> ${scheduleItemObject.estimate}</p>
                                </td>
                              </tr>`;


    return scheduleItemString;
}

function calculateRefreshRate(minutes) {
    // body...
    var milliseconds = minutes * 60000;

    return milliseconds;
}

function updateRefreshRate(newRate) {
    if (newRate == "Set Refresh Timer:") {
        console.log("No change in refresh timer value.");

        $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            title: 'Refresh Timer Update:',
            message: 'Please choose an option from the menu!',
        },{
        // settings
            element: 'body',
            position: null,
            type: "danger",
            allow_dismiss: true,
            newest_on_top: true,
            showProgressbar: false,
            z_index: 10001,
            placement: {
                from: "top",
                align: "right"
            }
        });

        return;
    } else if (typeof parseInt(newRate) == "number" && parseInt(newRate) > 0) {
        clearInterval(refreshTimer);
        var milliseconds = calculateRefreshRate(parseInt(newRate));
        setInterval(requestDataFromBackground, milliseconds);
        console.log("Refresh Timer has been updated to: " + newRate + " minutes or " + milliseconds + " milliseconds");

        $.notify({
            icon: 'glyphicon glyphicon-time',
            title: 'Refresh Timer Update:',
            message: 'Updated to refresh every ' + newRate + ' minutes',
        },{
        // settings
            element: 'body',
            position: null,
            type: "success",
            allow_dismiss: true,
            newest_on_top: true,
            showProgressbar: false,
            z_index: 10001,
            placement: {
                from: "top",
                align: "right"
            }
        });
    }
}

function sendUpdateCalendarItemsNumber(newCalendarItemsNumber) {
    if (newCalendarItemsNumber == "Set # of Runs to Display:") {
        console.log("No change in numbers of runs to display in schedule.");

        $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            title: 'Schedule Items Update',
            message: 'Please choose an option from the menu!',
        },{
        // settings
            element: 'body',
            position: null,
            type: "danger",
            allow_dismiss: true,
            newest_on_top: true,
            showProgressbar: false,
            z_index: 10001,
            placement: {
                from: "top",
                align: "right"
            }
        });

        return;
    } else if (typeof parseInt(newCalendarItemsNumber) == "number" && parseInt(newCalendarItemsNumber) > 0) {
        port.postMessage({message: "schedule", calendarItemsNumber: parseInt(newCalendarItemsNumber)});

        $.notify({
            icon: 'glyphicon glyphicon-time',
            title: 'Schedule Items Update:',
            message: 'Updated to display ' + newCalendarItemsNumber + ' runs.',
        },{
        // settings
            element: 'body',
            position: null,
            type: "success",
            allow_dismiss: true,
            newest_on_top: true,
            showProgressbar: false,
            z_index: 10001,
            placement: {
                from: "top",
                align: "right"
            }
        });
    }
}

function requestDataFromBackground() {
    port.postMessage({message: "request"});
}
refreshTimer = setInterval(requestDataFromBackground, refreshRate);