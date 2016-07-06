"use strict";

$(document).ready(function () {
  console.log("Hello Discord!");

  console.log($('.messages-wrapper'));

  var userListStatus = null;

  var checkMessagesContainer = setInterval(function () {
    if ($(".messages-wrapper").length > 0) {
      // Check if element has been found
      console.log('Add CSS to Messages Panel');
      $('.messages-wrapper').css('height', '400px');
      clearInterval(checkMessagesContainer);
    }
  }, 1000);

  var checkLinks = setInterval(function () {
    if ($(".topic").length > 0) {
      // Check if element has been found
      console.log('Add Switch to Links Panel');
      $('.topic').after('<div id="twitch-switch"><label for="twitch-player-display" id="twitch-player-display-label">Twitch Player Embed</label></div>');
      $('#twitch-switch').append("<input type=\"checkbox\" data-size=\"mini\" name=\"twitch-player-display\">");
      clearInterval(checkLinks);

      $("[name='twitch-player-display']").bootstrapSwitch();
      console.log($("[name='twitch-player-display']").bootstrapSwitch('state'));

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
  }, 1000);

  function updateTwitchPlayer(msg) {
    if (msg == 'add') {
      console.log('Switch is on. Adding Twitch iframe and modifying UI.');

      if ($('.header-toolbar button:nth-child(2)').hasClass('active')) {
        userListStatus = true;
        $('.header-toolbar button:nth-child(2)').click();
      } else {
        userListStatus = false;
      }

      $('button.active').click();
      $('.messages-wrapper').parent().css('align-items', 'flex-end');
      $('.messages-wrapper').css('width', '48%');
      $('.messages-wrapper').next('form').css({ 'width': '46%', 'margin-right': '2%', 'margin-left': '0px' });

      $('.app').before("<div id=\"twitch-container\" style=\"width: " + ($(document).width() - $('.guilds-wrapper').width() - $('.messages-wrapper').width()) + "px; height: " + ($(document).height() - $('.title-wrap').outerHeight()) + "px; position: fixed; z-index:100; top: " + $('.title-wrap').outerHeight() + "px; left: " + $('.guilds-wrapper').width() + "px;\"><iframe id=\"twitch-embed\" src=\"https://player.twitch.tv/?channel=gamesdonequick\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allowFullscreen=\"true\" class=\"center-block\"></iframe></div>");
    } else if (msg == 'remove') {
      console.log('Switch is off. Removing Twitch iframe and UI changes.');
      $('#twitch-container').remove();
      $('.messages-wrapper').parent().removeAttr('style');
      $('.messages-wrapper').removeAttr('style');
      $('.messages-wrapper').next('form').removeAttr('style');

      if (userListStatus == true) {
        $('.header-toolbar button:nth-child(2)').click();
      }
    }
  }
});