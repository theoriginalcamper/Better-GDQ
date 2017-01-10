'use strict';

var runners_paragraph = document.createElement('div');
var game_link_container = document.createElement('div');
var game_link_a = document.createElement('a');

runners_paragraph.id = "gdq-runners-information";
game_link_container.id = "gdq-link-container";
game_link_a.id = "gdq-speedrun-link";
game_link_a.className = "speedrun-link";

$(document).ready(function () {
	console.log("Hello Discord!");

	console.log($('.messages-wrapper'));

	var userListStatus = null;
	var twitchActive = false;
	var headerHeight = null;
	var twitchPlayerInitialSize = $(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width();
	var twitchPlayerSizeState = 'small';

	var styleNode = document.createElement("style");
	styleNode.type = "text/css";
	styleNode.textContent = '@font-face { font-family: FontAwesome; src: url(' + chrome.extension.getURL("/fonts/fontawesome-webfont.woff") + ');}';
	document.head.appendChild(styleNode);

	var linkNode = document.createElement("link");
	linkNode.type = "text/css";
	linkNode.href = "http://yui.yahooapis.com/pure/0.6.0/pure-min.css";
	document.head.appendChild(linkNode);

	var checkAccount = setInterval(function () {
		if ($(".account").length > 0) {
			if ($('.guild.selected').has('a[href^="/channels/140605087511740416/"]').length > 0 || $('.guild.selected').has('a[href^="/channels/85369684286767104/"]').length > 0) {
				// Check if element has been found
				console.log('Add Switch to Links Panel');
				addTwitchSwitch();
				addInformationBar();
				clearInterval(checkAccount);

				$('input[name="twitch-player-display"]').on('switchChange.bootstrapSwitch', function (event, state) {
					console.log('Clicked Twitch Switch.');
					console.log($("[name='twitch-player-display']").bootstrapSwitch('state'));
					if ($('input[name="twitch-player-display"]').bootstrapSwitch('state')) {
						updateTwitchPlayer('add');
					} else {
						updateTwitchPlayer('remove');
					}
				});
			}
		}
	}, 1000);

	var checkRefresh = setInterval(function () {
		if ($(".fa-refresh").length > 0) {
			// Check if element has been found
			$(".fa.fa-refresh").click(function () {
				this.className = 'fa fa-refresh fa-spin';
				console.log("Refreshing...");
				refreshDataFromBackground();
				var that = this;
				console.log(that);
				setTimeout(function () {
					that.className = 'fa fa-refresh';
					console.log("Refresh complete.");
				}, 2000);
			});
			clearInterval(checkRefresh);
		}
	}, 1000);

	var checkPlayerSize = setInterval(function () {
		if ($("#player-size-icon").length > 0) {
			// Check if element has been found
			$("#player-size-icon").click(function () {
				console.log("Clicked size icon");
				if ($("#player-size-icon").hasClass("fa-expand")) {
					console.log("EXPAND");
					twitchPlayerSizeState = 'large';
					adjustTwitchPlayerSize(twitchPlayerSizeState);
					this.className = 'fa fa-compress';
				} else if ($("#player-size-icon").hasClass("fa-compress")) {
					console.log("COMPRESS");
					console.log(twitchPlayerInitialSize);
					twitchPlayerSizeState = 'small';
					adjustTwitchPlayerSize(twitchPlayerSizeState);
					this.className = 'fa fa-expand';
				}
			});
			clearInterval(checkPlayerSize);
		}
	}, 1000);

	function addTwitchSwitch() {
		$('.account').after('<div id="twitch-switch"><label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label></div>');
		$('#twitch-switch').append('<input type="checkbox" data-size="mini" name="twitch-player-display">');
		$('#twitch-switch').append('<i class="fa fa-expand" id="player-size-icon" style="margin-left: 10px; display: none;"></i>');

		$("[name='twitch-player-display']").bootstrapSwitch();
	}

	function addInformationBar() {

		$('.app').before('\n\t\t\t\t\t\t\t<header id="gdq-header" style="width: ' + ($('.title-wrap').width() - $('.header-toolbar').width() + 10) + 'px; height: ' + ($('.title-wrap').outerHeight() - 1) + 'px; overflow: hidden; min-height: 48px; position: fixed; top: 0px; left: ' + ($('.guilds-wrapper').width() + $('.channels-wrap').width()) + 'px;">\n\t\t\t\t\t\t\t\t<div class="extension-container">\n\t\t\t\t\t\t\t\t\t<div id="options" style="transform: translateY(50%);">\n\t\t\t\t\t\t\t\t\t\t<i class="fa fa-calendar collapsed" data-toggle="collapse" data-target="#collapseCalendar" aria-expanded="false"></i>\n\t\t\t\t\t\t\t\t\t\t<i class="fa fa-refresh" id="settings-icon"></i>\n\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t\t<div class="game-information">\n\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t\t<div style="clear:both;"></div>\n\t\t\t\t\t\t\t\t\t<div class="collapse" id="collapseCalendar" style="padding-top: 10px; height: 0px;">\n\t\t\t\t\t\t\t\t\t\t<!-- Schedule -->\n\t\t\t\t\t\t\t\t\t\t<p><i class="fa fa-calendar" style="margin-right: 10px;"></i> Next Runs</p>\n\t\t\t\t\t\t\t\t\t\t<table class="table" id="schedule-table" style="border-collapse: collapse;">\n\t\t\t\t\t\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t\t\t\t\t</tbody>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</header>\n\t\t\t');

		headerHeight = $('#gdq-header').css('height');
		console.log('Width: ' + $('#gdq-header').width());
		$('.header-toolbar').css('margin-left', '0px');
		$('.game-information').append(game_link_container);
		$('#gdq-link-container').html('<b>Current Game: </b>');
		$('#gdq-link-container').append(game_link_a);
		$('.game-information').append(runners_paragraph);

		$('#collapseCalendar').on('show.bs.collapse', function () {
			$('#gdq-header').css('height', 'auto');
		});

		$('#collapseCalendar').on('hide.bs.collapse', function () {
			$('#gdq-header').css('height', headerHeight);
		});

		port.postMessage({ message: "refresh" });
	}

	function updateTwitchPlayer(msg) {
		if (msg == 'add') {
			console.log('Switch is on. Adding Twitch iframe and modifying UI.');

			if ($('.header-toolbar button:nth-child(3)').hasClass('active')) {
				userListStatus = true;
				$('.header-toolbar button:nth-child(3)').click();
			} else {
				userListStatus = false;
			}

			$('button.active').click();

			twitchActive = true;

			updateDiscordUI('add');
			twitchPlayerInitialSize = $(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width();

			$('.app').before('<div id="twitch-container" style="width: ' + ($(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width()) + 'px; height: ' + ($(document).height() - $('.title-wrap').outerHeight() - $('#twitch-switch').outerHeight()) + 'px; position: fixed; z-index:100; top: ' + $('.title-wrap').outerHeight() + 'px; left: ' + $('.guilds-wrapper').width() + 'px;"><iframe id="twitch-embed" src="https://player.twitch.tv/?channel=gamesdonequick" width="100%" height="100%" frameborder="0" scrolling="no" allowFullscreen="true" class="center-block"></iframe></div>');
		} else if (msg == 'remove') {
			console.log('Switch is off. Removing Twitch iframe and UI changes.');
			$('#twitch-container').remove();
			twitchActive = false;
			updateDiscordUI('remove');

			if (userListStatus == true) {
				$('.header-toolbar button:nth-child(3)').click();
			}
		}
	}

	function adjustTwitchPlayerSize(msg) {
		if (twitchPlayerSizeState == 'large') {
			// Switch to large display
			$('#twitch-container').css('width', '70%');
			$('.messages-wrapper').css('width', '32%');
			$('.messages-wrapper').next('form').css({ 'width': '29%', 'margin-right': '2%', 'margin-left': '0px' });
		} else if (twitchPlayerSizeState == 'small') {
			// Switch to small display
			$('#twitch-container').css('width', twitchPlayerInitialSize);
			$('.messages-wrapper').css('width', '48%');
			$('.messages-wrapper').next('form').css({ 'width': '46%', 'margin-right': '2%', 'margin-left': '0px' });
		}
	}

	function updateGDQHeaderDisplay(msg) {
		if (msg == 'add') {
			$('#gdq-header').css('display', '');
		} else if (msg == 'remove') {
			$('#gdq-header').css('display', 'none');
		}
	}

	function updateDiscordUI(msg) {
		console.log("TwitchActive: " + twitchActive);
		if (msg == 'add') {
			console.log("Rearranging Discord UI");
			$('.messages-wrapper').parent().css('align-items', 'flex-end');
			adjustTwitchPlayerSize(twitchPlayerSizeState);
			$('#player-size-icon').css('display', 'inline-block');
		} else if (msg == 'remove') {
			console.log("Discord UI returned to normal");
			$('.messages-wrapper').parent().removeAttr('style');
			$('.messages-wrapper').removeAttr('style');
			$('.messages-wrapper').next('form').removeAttr('style');
			$('#player-size-icon').css('display', 'none');
		}
	}

	function updateGDQHeaderUI(msg) {
		$('#gdq-runners-information').html(generateFormattedRunnerString(msg.runner, 'header'));
		$('#gdq-speedrun-link').attr('href', msg.link);

		if (msg.category != null) {
			$('#gdq-speedrun-link').html(msg.game + ' (' + msg.category + ')');
		} else {
			$('#gdq-speedrun-link').html('' + msg.game);
		}
	}

	function updateCalendarUI(msg) {
		console.log("Calendar updating...");
		console.log(msg);
		if (msg != null) {
			console.log("Calendar not null.");
			$('#schedule-table tbody').empty();

			var scheduleString = "";
			_.each(msg.order, function (gameTitle, index) {
				scheduleString += generateScheduleItemString(msg.schedule[gameTitle], msg.highlights, index + 1);
				console.log(scheduleString);
			});

			$('#schedule-table tbody').html(scheduleString);
			console.log("Calendar updated.");
		} else {
			return;
		}
	}

	function generateFormattedRunnerString(runners, location) {
		var runners_keys = _.keys(runners);
		var runner_string = "by ";
		if (runners_keys.length > 2) {
			if (location != 'table') {
				runner_string = "<b>Current Runners: </b>";
			}
			var last_runner = runners_keys.pop();
			var second_runner = runners_keys.pop();
			$.each(runners_keys, function (index, runner_key) {
				runner_string += generateRunnerElement(runners, runner_key) + ', ';
			});

			runner_string += generateRunnerElement(runners, second_runner) + ' ';
			runner_string += 'and ';
			runner_string += generateRunnerElement(runners, last_runner);
		} else if (runners_keys.length == 2) {
			if (location != 'table') {
				runner_string = "<b>Current Runners: </b>";
			}
			var last_runner = runners_keys.pop();
			var second_runner = runners_keys.pop();

			runner_string += generateRunnerElement(runners, second_runner);
			runner_string += ' and ';
			runner_string += generateRunnerElement(runners, last_runner);
		} else if (runners_keys.length == 1) {
			if (location != 'table') {
				runner_string = "<b>Current Runner: </b>";
			}
			var runner_key = runners_keys[0];
			runner_string += generateRunnerElement(runners, runners_keys[0]);
		} else {
			console.log("Error no runners.");
			runner_string = "";
		}
		return runner_string;
	}

	function generateRunnerElement(runnerObject, runner_key) {
		if (runnerObject[runner_key]["logo"] == null) {
			return '<a href="' + runnerObject[runner_key]["link"] + '" onclick="window.open(this.href); return false;">' + runner_key + '</a>';
		} else {
			return '<a href="' + runnerObject[runner_key]["link"] + '" onclick="window.open(this.href); return false;"><img class="runner-logo" src="' + runnerObject[runner_key]["logo"] + '" style="width: 14px;"/>' + runner_key + '</a>';
		}
	}

	function generateScheduleItemString(scheduleItemObject, highlightsObject, index) {
		console.log(scheduleItemObject);
		console.log(highlightsObject);
		var runnerString = generateFormattedRunnerString(scheduleItemObject.runner, 'table');
		if (scheduleItemObject.category != null) {
			var titleString = scheduleItemObject.title + ' (' + scheduleItemObject.category + ')';
		} else {
			var titleString = scheduleItemObject.title;
		}

		if (typeof highlightsObject[scheduleItemObject.title] == 'undefined' || highlightsObject[scheduleItemObject.title] == false) {
			var highlightStyle = '';
		} else {
			var highlightStyle = 'background-color:#555555;';
			titleString = '<i class="fa fa-star"></i> ' + titleString;
		}

		var scheduleItemString = '<tr style=' + highlightStyle + '>\n\t                                <th scope="row" style="text-align: center;">' + index + '</th>\n\t                                <td>\n\t                                    <a class="speedrun-link" id="next-game-title" href="' + scheduleItemObject.link + '" onclick="window.open(this.href); return false;"> ' + titleString + '</a>\n\t                                    <p class="runners-links" id="next-runners-information">' + runnerString + '</p>\n\t                                </td>\n\t                                <td style="text-align: center;">\n\t                                    <p class="text-right"><i class="fa fa-clock-o" aria-hidden="true"></i> ' + scheduleItemObject.estimate + '</p>\n\t                                </td>\n\t                              </tr>';

		return scheduleItemString;
	}

	var checkForActiveGuild = setInterval(function () {
		if ($(".selected").length > 0) {
			// Check if element has been found
			$('.guild').on('click', function () {
				if (twitchActive) {
					if ($(this).has('a[href^="/channels/140605087511740416/"]').length > 0 || $(this).has('a[href^="/channels/85369684286767104"]').length > 0) {
						$('#twitch-container').css('display', '');
						var uiUpdate = setInterval(function () {
							if ($('.guild-header').length > 0 && ($('.guild-header header span').text() == 'GamesDoneQuick' || $('.guild-header header span').text() == 'ESA16')) {
								updateDiscordUI('add');
								clearInterval(uiUpdate);
							}
						}, 500);
					} else {
						$('#twitch-container').css('display', 'none');
						updateDiscordUI('remove');
					}
				}

				if ($(this).has('a[href^="/channels/140605087511740416/"]').length > 0 || $(this).has('a[href^="/channels/85369684286767104"]').length > 0) {
					updateGDQHeaderDisplay('add');
				} else {
					updateGDQHeaderDisplay('remove');
				}
			});

			$('.dms').on('click', function () {
				updateGDQHeaderDisplay('remove');
				if (twitchActive) {
					$('#twitch-container').css('display', 'none');
					updateDiscordUI('remove');
				}
			});

			clearInterval(checkForActiveGuild);
		}
	}, 1000);

	var port = chrome.runtime.connect({ name: "gdq" });
	port.postMessage({ message: "request" });
	port.onMessage.addListener(function (msg) {
		if (msg.status == "changed") {
			console.log(msg);
			console.log("The Current Game is: " + msg.game);

			if ($('#gdq-header').length > 0) {
				updateGDQHeaderUI(msg);
				updateCalendarUI(msg.calendar);
			}
		} else if (msg.status == "unchanged") {
			console.log("Current game has not changed since last request");
		} else if (msg.status == "reload") {
			console.log("Reload has occurred");
			console.log(msg);
			console.log("The Current Game is: " + msg.game);
			if ($('#gdq-header').length > 0) {
				updateGDQHeaderUI(msg);
				updateCalendarUI(msg.calendar);
			}
		}
	});
	function requestDataFromBackground() {
		port.postMessage({ message: "request" });
	}
	function refreshDataFromBackground() {
		port.postMessage({ message: "refresh" });
	}
	setInterval(requestDataFromBackground, 300000);
});