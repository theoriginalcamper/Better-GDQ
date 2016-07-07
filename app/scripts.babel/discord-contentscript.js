$(document).ready(function() {
	console.log("Hello Discord!");

	console.log($('.messages-wrapper'));

	var userListStatus = null;
	var twitchActive = false;
	

    var checkLinks = setInterval(function(){
    	if ($(".topic").length > 0){ // Check if element has been found
	      	console.log('Add Switch to Links Panel');
	      	addTwitchSwitch();
	      	clearInterval(checkLinks);

	      	$('input[name="twitch-player-display"]').on('switchChange.bootstrapSwitch', function(event, state) {
		        console.log('Clicked Twitch Switch.');
		        console.log($("[name='twitch-player-display']").bootstrapSwitch('state'));
		        if ($('input[name="twitch-player-display"]').bootstrapSwitch('state')) {
		            updateTwitchPlayer('add');
		        } else {
		            updateTwitchPlayer('remove');
		        }
		    });
		}
    },1000);

    function addTwitchSwitch() {
    	$('.links').html('<div id="twitch-switch"><label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label></div>');
	    $('#twitch-switch').append(`<input type="checkbox" data-size="mini" name="twitch-player-display">`);
	      	
	    $("[name='twitch-player-display']").bootstrapSwitch();
    }

    function updateTwitchPlayer(msg) {
        if(msg == 'add') {
            console.log('Switch is on. Adding Twitch iframe and modifying UI.');	

            if($('.header-toolbar button:nth-child(2)').hasClass('active')) {
            	userListStatus = true;
            	$('.header-toolbar button:nth-child(2)').click();
            } else {
            	userListStatus = false;
            }

            $('button.active').click();

            twitchActive = true;

            updateDiscordUI('add');

            $('.app').before(`<div id="twitch-container" style="width: ${$(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width()}px; height: ${$(document).height() - $('.title-wrap').outerHeight() - $('.links').outerHeight()}px; position: fixed; z-index:100; top: ${$('.title-wrap').outerHeight()}px; left: ${$('.guilds-wrapper').width()}px;"><iframe id="twitch-embed" src="https://player.twitch.tv/?channel=gamesdonequick" width="100%" height="100%" frameborder="0" scrolling="no" allowFullscreen="true" class="center-block"></iframe></div>`);
        	
        } else if (msg == 'remove') {
            console.log('Switch is off. Removing Twitch iframe and UI changes.');
            $('#twitch-container').remove();
            twitchActive = false;
            updateDiscordUI('remove');

            if(userListStatus == true) {
            	$('.header-toolbar button:nth-child(2)').click();
            }
            
        }
    }

    function updateDiscordUI(msg) {
    	console.log("TwitchActive: " + twitchActive);
    	if (msg == 'add') {
    		console.log("Rearranging Discord UI");
			$('.messages-wrapper').parent().css('align-items', 'flex-end');
            $('.messages-wrapper').css('width', '48%');
            $('.messages-wrapper').next('form').css({'width': '46%', 'margin-right': '2%', 'margin-left': '0px'});
    	} else if (msg == 'remove') {
    		console.log("Discord UI returned to normal");
    		$('.messages-wrapper').parent().removeAttr('style');
            $('.messages-wrapper').removeAttr('style');
            $('.messages-wrapper').next('form').removeAttr('style');
    	}
    }

    var checkForActiveGuild = setInterval(function() {
    	if ($(".selected").length > 0) { // Check if element has been found
    		$('.guild').on('click', function() {
    			if (twitchActive) {
    				if ($(this).has('a[href="/channels/140605087511740416/140605087511740416"]').length > 0) {
    					$('#twitch-container').css('display', '');
            			var uiUpdate = setInterval(function() {
            				if($('.guild-header').length > 0 && $('.guild-header header span').text() == 'GamesDoneQuick') {

            					updateDiscordUI('add');
            					clearInterval(uiUpdate);
            				}
            			}, 1000);
    				} else {
    					$('#twitch-container').css('display', 'none');
            			updateDiscordUI('remove');
    				}
    			}

    		});

    		clearInterval(checkForActiveGuild);
		}
    },1000);

});