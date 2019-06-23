var runners_paragraph = document.createElement('div');
var game_link_container = document.createElement('div')
var game_link_a = '<a id="gdq-speedrun-link" class="speedrun-link" onclick="window.open(this.href); return false;"></a>'

runners_paragraph.id = "gdq-runners-information";
game_link_container.id = "gdq-link-container";

$(document).ready(function() {
	console.log("Hello Discord!");

	var userListStatus = null;
	var twitchActive = false;
	var headerHeight = null;
	var twitchPlayerInitialSize = $(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width();
	var twitchPlayerSizeState = 'small';

	var styleNode = document.createElement("style");
	styleNode.type = "text/css";
	styleNode.textContent = `@font-face { font-family: FontAwesome; src: url(${chrome.extension.getURL("/fonts/fontawesome-webfont.woff")});}`;
	document.head.appendChild(styleNode);

    var checkAccount = setInterval(function(){
    	if ($('[class*="usernameContainer"]').length > 0) {
				var guildList = $('[class^="listItem-2P"]').filter(function( index ) {
					var elementStyle = $('span', this).attr('style');
					if (typeof elementStyle !== 'undefined') {
						var styleList = elementStyle.split(';');
						var match = styleList.filter(value => /^opacity: 1$/.test(value));
						if (match.length > 0) {
							return $(this);
						}
					}
			  });

    		if(guildList.has('a[href^="/channels/140605087511740416/"]').length > 0 || guildList.has('a[href^="/channels/85369684286767104/"]').length > 0) { // Check if element has been found
		      	console.log('Add Switch to Links Panel');
		      	addInformationBar();
						addTwitchSwitch();

		      	clearInterval(checkAccount);

		      	$('input[name="twitch-player-display"]').on('switchChange.bootstrapSwitch', function(event, state) {
			        console.log(`Clicked Twitch Switch. Current switch state: ${$("[name='twitch-player-display']").bootstrapSwitch('state')}`);
			        if ($('input[name="twitch-player-display"]').bootstrapSwitch('state')) {
			            updateTwitchPlayer('add');
			        } else {
			            updateTwitchPlayer('remove');
			        }
			    });

				}
    	}
    },1000);

    var checkRefresh = setInterval(function(){
    	if ($(".fa-refresh").length > 0){ // Check if element has been found
	      	$(".fa.fa-refresh").click(function() {
	        	this.className = 'fa fa-refresh fa-spin';
		        console.log("Refreshing...");
		        refreshDataFromBackground();
		        var that = this;
		        console.log(that);
		        setTimeout(function() {
		            that.className = 'fa fa-refresh';
		            console.log("Refresh complete.")
		        }, 2000);
		    	});
	      	clearInterval(checkRefresh);
		  }
    },1000);

		var checkPlayerSize = setInterval(function(){
    	if ($("#player-size-icon").length > 0){ // Check if element has been found
					$("#player-size-icon").click(function() {
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
    },1000);

    function addTwitchSwitch() {
			$('[class*="usernameContainer"]').parent().parent().css('margin-bottom', '30px');
			$('#gdq-header').after(`<div id="twitch-switch" style="position: fixed; width: ${$('div[class^="channels-"]').width()}px; height: 22px; left: ${$('[class^="unreadMentionsIndicatorTop-"]').outerWidth()}px; bottom: 0;"><label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label></div>`);
			$('#twitch-switch').append(`<input type="checkbox" data-size="mini" name="twitch-player-display">`);
	    $('#twitch-switch').append(`<i class="fa fa-expand" id="player-size-icon" style="margin-left: 10px; display: none;"></i>`);

	    $("[name='twitch-player-display']").bootstrapSwitch();
    }

    function addInformationBar() {

			$('#app-mount').before(`
							<header id="gdq-header" style="width: ${$('div[class^="title-"]').width() - $('div[class^="title-"] > div[class^="toolbar-"]').width() - 10}px; height: ${$('div[class^="title-]').outerHeight() - 1}px; overflow: hidden; min-height: 48px; position: fixed; top: 0px; left: ${$('[class^="unreadMentionsIndicatorTop-"]').outerWidth() + $('div[class^="channels-"]').width()}px;">
								<div class="extension-container">
									<div id="options" style="transform: translateY(37.5%);">
										<i class="fa fa-calendar collapsed" data-toggle="collapse" data-target="#collapseCalendar" aria-expanded="false"></i>
										<i class="fa fa-refresh" id="settings-icon"></i>
									</div>

									<div class="game-information">
									</div>

									<div style="clear:both;"></div>
									<div class="collapse" id="collapseCalendar" style="padding-top: 10px; height: 0px;">
										<!-- Schedule -->
										<p><i class="fa fa-calendar" style="margin-right: 10px;"></i> Next Runs</p>
										<table class="table" id="schedule-table" style="border-collapse: collapse;">
											<tbody>
											</tbody>
										</table>
									</div>
								</div>
							</header>
			`);

    	headerHeight = $('#gdq-header').css('height');
    	console.log('Width: ' + $('#gdq-header').width());
    	$('.header-toolbar').css('margin-left', '0px');
    	$('.game-information').append(game_link_container);
    	$('#gdq-link-container').html(`<b>Current Game: </b>`);
    	$('#gdq-link-container').append(game_link_a);
    	$('.game-information').append(runners_paragraph);

	    $('#collapseCalendar').on('show.bs.collapse', function () {
				$('#gdq-header').css('height', 'auto');
			});

			$('#collapseCalendar').on('hide.bs.collapse', function () {
			  $('#gdq-header').css('height', headerHeight);
			});

    	port.postMessage({message: "refresh"});
    }

    function updateTwitchPlayer(msg) {
        if(msg == 'add') {
            console.log('Switch is on. Adding Twitch iframe and modifying UI.');

            $('button.active').click();

            twitchActive = true;

            updateDiscordUI('add');

						if($('[aria-label*="Member List"]').is('[class*="selected"]')) {
            	userListStatus = true;
            	$('[aria-label*="Member List"]').click();
							// twitchPlayerInitialSize = Math.round($(document).width() - $('[class^="guildsWrapper"]').width() - ($('[class^="chat"]').width() * (parseFloat($('[class^="messagesWrapper"]')[0].style.width)) / 100));
            } else {
            	userListStatus = false;
							// twitchPlayerInitialSize = $(document).width() - $('[class^="guildsWrapper"]').width() - $('[class^="messagesWrapper"]').width();
            }
						console.log(Math.round($(document).width() - $('[class^="unreadMentionsIndicatorTop-"]').outerWidth() - ($('[class^="chat"]').width() * (parseFloat($('[class^="messagesWrapper"]')[0].style.width)) / 100)));
						twitchPlayerInitialSize = Math.round($(document).width() - $('[class^="unreadMentionsIndicatorTop-"]').outerWidth() - ($('[class^="chat"]').width() * (parseFloat($('[class^="messagesWrapper"]')[0].style.width)) / 100));


						$('#app-mount').before(`<div id="twitch-container" style="width: ${twitchPlayerInitialSize}px; height: ${$(document).height() - $('div[class^="title-"]').outerHeight() - $('#twitch-switch').outerHeight()}px; position: fixed; z-index:100; top: ${$('div[class^="title-"]').outerHeight()}px; left: ${$('[class^="unreadMentionsIndicatorTop-"]').outerWidth()}px;"></div>`);
						$('#app-mount').before(`<script type="text/javascript">
					      new Twitch.Embed("twitch-container", {
					        width: "100%",
					        height: "100%",
									layout: "video",
									allowfullscreen: true,
					        channel: "gamesdonequick"
					      });
					    </script>`);

      } else if (msg == 'remove') {
            console.log('Switch is off. Removing Twitch iframe and UI changes.');
            $('#twitch-container').remove();
            twitchActive = false;
            updateDiscordUI('remove');

            if(userListStatus == true) {
            	$('[aria-label*="Member List"]').click();
            }

        }
    }

		function adjustTwitchPlayerSize(msg) {
			if (twitchPlayerSizeState == 'large') {
				// Switch to large display
				$('#twitch-container').css('width', '70%');
				$('[class^="messagesWrapper"]').css('width', '32%');
				$('[class^="messagesWrapper"]').next('form').css({'width': '29%', 'margin-right': '2%', 'margin-left': '0px'});
			} else if (twitchPlayerSizeState == 'small') {
				// Switch to small display
				// $('#twitch-container').css('width', twitchPlayerInitialSize);
				$('[class^="messagesWrapper"]').css('width', '48%');
				$('[class^="messagesWrapper"]').next('form').css({'width': '46%', 'margin-right': '2%', 'margin-left': '0px'});
				$('#twitch-container').css('width', $(document).width() - $('[class^="unreadMentionsIndicatorTop-"]').outerWidth() - $('[class^="messagesWrapper"]').width());
			}
		}

    function updateGDQHeaderDisplay(msg) {
    	if(msg == 'add') {
    		$('#gdq-header').css('display', '');
    	} else if (msg == 'remove') {
    		$('#gdq-header').css('display', 'none');
    	}
    }

    function updateDiscordUI(msg) {
    	console.log("TwitchActive: " + twitchActive);
    	if (msg == 'add') {
    		console.log("Rearranging Discord UI");
				$('[class^="messagesWrapper"]').parent().css('align-items', 'flex-end');
						adjustTwitchPlayerSize(twitchPlayerSizeState);
						$('#player-size-icon').css('display', 'inline-block');
    	} else if (msg == 'remove') {
    		console.log("Discord UI returned to normal");
    		$('[class^="messagesWrapper"]').parent().removeAttr('style');
            $('[class^="messagesWrapper"]').removeAttr('style');
            $('[class^="messagesWrapper"]').next('form').removeAttr('style');
						$('#player-size-icon').css('display', 'none');
    	}
    }

    function updateGDQHeaderUI(msg) {
	    $('#gdq-runners-information').html(generateFormattedRunnerString(msg.runner, 'header'));
	    $('#gdq-speedrun-link').attr('href', msg.link);

	    if (msg.category != null) {
	    	$('#gdq-speedrun-link').html(`${msg.game} (${msg.category})`);
	    } else {
	    	$('#gdq-speedrun-link').html(`${msg.game}`);
	    }
	}

	function updateCalendarUI(msg) {
	    console.log("Calendar updating...");
	    console.log(msg);
	    if (msg != null) {
					console.log("Calendar not null.");
	        $('#schedule-table tbody').empty();

	        var scheduleString = "";
	        _.each(msg.order, function(gameTitle, index) {
	            scheduleString += generateScheduleItemString(msg.schedule[gameTitle], msg.highlights, index + 1);
							console.log(scheduleString);
	        });

	        $('#schedule-table tbody').html(scheduleString);
	        console.log("Calendar updated.")
	    } else {
	        return;
	    }
	}

	function generateFormattedRunnerString(runners, location) {
	    var runners_keys = _.keys(runners);
	    var runner_string = "by ";

			if (location != 'table') {
				runner_string = "<b>Current Runners: </b>"
			}

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
	        return `<a href="${runnerObject[runner_key]["link"]}" onclick="window.open(this.href); return false;"><img class="runner-logo" src="${runnerObject[runner_key]["logo"]}" style="width: 14px;"/>${runner_key}</a>`;
    	}
	}

	function generateScheduleItemString(scheduleItemObject, highlightsObject, index) {
			console.log(scheduleItemObject);
			console.log(highlightsObject);
	    var runnerString = generateFormattedRunnerString(scheduleItemObject.runner, 'table');
	    if (scheduleItemObject.category != null) {
	        var titleString = scheduleItemObject.title + ' (' + scheduleItemObject.category +')';
	    } else {
	        var titleString = scheduleItemObject.title;
	    }

	    if (typeof highlightsObject[scheduleItemObject.title] == 'undefined' || highlightsObject[scheduleItemObject.title] == false) {
	        var highlightStyle = '';
	    } else {
	        var highlightStyle = 'background-color:#555555;';
	        titleString = '<i class="fa fa-star"></i> ' + titleString;
	    }

	    var scheduleItemString = `<tr style=${highlightStyle}>
																	<th scope="row" style="text-align: center; vertical-align: middle;">${index}</th>
	                                <td>
	                                    <a class="speedrun-link" id="next-game-title" href="${scheduleItemObject.link}" onclick="window.open(this.href); return false;"> ${titleString}</a>
	                                    <p class="runners-links" id="next-runners-information">${runnerString}</p>
	                                </td>
	                                <td style="text-align: center; vertical-align: middle;">
	                                    <p class="text-right"><i class="fa fa-clock-o" aria-hidden="true"></i> ${scheduleItemObject.estimate}</p>
	                                </td>
	                              </tr>`;


	    return scheduleItemString;
	}

    var checkForActiveGuild = setInterval(function() {

			var guildList = $('[class^="listItem-2P"]').filter(function( index ) {
				var elementStyle = $('span', this).attr('style');
				if (typeof elementStyle !== 'undefined') {
					var styleList = elementStyle.split(';');
					console.log(styleList);
					var match = styleList.filter(value => /^opacity: 1$/.test(value));
					if (match.length > 0) {
						return $(this);
					}
				}
			});

			console.log(guildList);
    	if ($('[class*="selected-"]').length > 0) { // Check if element has been found
    		$(document).on('click', '[class^="listItem-2P"] > [class^="blob"]', function() {
    			if (twitchActive) {
    				if ($(this).has('a[href^="/channels/140605087511740416/"]').length > 0 || $(this).has('a[href^="/channels/85369684286767104"]').length > 0) {
    					$('#twitch-container').css('display', '');

							var uiUpdate = setInterval(function() {
        				if($('[class^="channels"]').length > 0 && ($('[class^="channels"] header span').text() == 'GamesDoneQuick' || $('[class^="channels"] header span').text() == 'European Speedrunner Assembly')) {
									updateDiscordUI('add');
        					clearInterval(uiUpdate);
        				}
        			}, 500);
    				} else {
    					$('#twitch-container').css('display', 'none');
    					updateDiscordUI('remove');
    				}
    			}

					if($('#twitch-switch').length) {
						$('[class*=usernameContainer]', $('[class^="channels"]')).parent().parent().css('margin-bottom', '30px');
					}

    			if ($(this).has('a[href^="/channels/140605087511740416/"]').length > 0 || $(this).has('a[href^="/channels/85369684286767104"]').length > 0) {
    				updateGDQHeaderDisplay('add');
    			} else {
    				updateGDQHeaderDisplay('remove');
    			}
    		});

    		$('[class^="listItem-2P"] > [class^="listItemWrapper"]').on('click', function() {
    			updateGDQHeaderDisplay('remove');
    			if (twitchActive) {
							$('#twitch-container').css('display', 'none');
        			updateDiscordUI('remove');
    			}

    		});

    		clearInterval(checkForActiveGuild);
		}
    },1000);

    var port = chrome.runtime.connect({name: "gdq"});
    port.postMessage({message: "request"});
    port.onMessage.addListener(function(msg) {
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
    	port.postMessage({message: "request"});
	}
	function refreshDataFromBackground() {
    	port.postMessage({message: "refresh"});
	}
	setInterval(requestDataFromBackground, 300000);
});
