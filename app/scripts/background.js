'use strict';

// chrome.runtime.onInstalled.addListener(details => {
//   console.log('previousVersion', details.previousVersion);
//   if(details.reason == "install"){
//         console.log("This is a first install!");
//         chrome.storage.local.set({'currentVersion': chrome.runtime.getManifest().version});
//     }else if(details.reason == "update"){
//         var thisVersion = chrome.runtime.getManifest().version;
//         var previousVersion = null;
//         chrome.storage.local.get('previousVersion', function(data) {
//             previousVersion = data;
//         })

//         if (Object.keys(previousVersion).length == 0) {
//             chrome.storage.local.set({'previousVersion': })
//         } else {

//         }
//         console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
//         chrome.storage.local.set({'previousVersion': })
//     }
// });

var current_game = null;
var current_game_title = null;
var current_link = null;
var current_runners = null;
var current_estimate = null;
var current_category = null;
var current_calendar = null;
var current_number_calendar_items = 4;

var runnerJSON = null;
var scheduleJSON = null;
var fuzzySet = null;
var fuzzySearchArray = null;

var portForMessage = null;

$.getJSON('/json/sgdq_runners.json').done(function (resp) {
    runnerJSON = resp;
});
$.getJSON('/json/sgdq_schedule.json').done(function (resp) {
    scheduleJSON = resp;
    fuzzySearchArray = _.keys(scheduleJSON);
    fuzzySet = FuzzySet(fuzzySearchArray);
    console.log(fuzzySet);
});

chrome.runtime.onConnect.addListener(function (port) {
    portForMessage = port;
    console.assert(port.name == "gdq");
    if (port.name == "gdq") {
        port.onMessage.addListener(function (msg) {
            if (msg.message == "request") {
                $.getJSON("https://api.twitch.tv/channels/gamesdonequick").done(function (resp) {
                    console.log("Completed request to Twitch");

                    if (current_game != resp.game) {
                        console.log("The Current Game being run is: " + resp.game);

                        current_game = resp.game;
                        getSpeedrunData(current_game, port);
                        console.log(current_link);
                    } else {
                        console.log("Still the same");
                    }
                });
            } else if (msg.message == "schedule") {
                console.log(msg.calendarItemsNumber);
                current_number_calendar_items = msg.calendarItemsNumber;
                getSpeedrunData(current_game, port);
            } else if (msg.message == "refresh") {
                $.getJSON("https://api.twitch.tv/channels/gamesdonequick").done(function (resp) {
                    console.log("Completed request to Twitch");
                    if (current_game != resp.game) {
                        console.log("The Current Game being run is: " + resp.game);

                        current_game = resp.game;
                        getSpeedrunData(current_game, port);
                        console.log(current_link);
                    } else {
                        console.log("Still the same");
                        getSpeedrunData(current_game, port);
                    }
                });
            };
        });
    }
});

function getSpeedrunData(game, port) {
    var gameData = scheduleJSON[game];

    if (typeof gameData == 'undefined') {
        console.log("Current game cannot be found in the parsed schedule.");
        console.log("Returned a value of undefined.");
        console.log("Trying fuzzy text search...");
        var possibleGameTitle = fuzzySet.get(game);
        console.log(possibleGameTitle);

        if (possibleGameTitle[0][0] > 0.5) {
            gameData = scheduleJSON[possibleGameTitle[0][1]];
            console.log(gameData);
        }
    }

    if (typeof gameData != 'undefined') {
        if (typeof possibleGameTitle != 'undefined') {
            current_game = possibleGameTitle[0][1];
        } else {
            current_game = game;
        }

        current_game_title = gameData.title;
        current_runners = getRunnerData(gameData.runner);
        current_estimate = gameData.estimate;
        current_category = gameData.category;
        current_link = gameData.link;

        var next_games = [];
        var game_index = _.keys(scheduleJSON).indexOf(current_game);

        console.log(game_index);

        var next_game = null;
        current_calendar = {};
        var schedule_object = {};

        if (_.keys(scheduleJSON).length - game_index >= current_number_calendar_items) {
            _(current_number_calendar_items).times(function (index) {
                next_game = _.keys(scheduleJSON)[game_index + index + 1];

                next_games.push(next_game);
            });
        } else {
            _(_.keys(scheduleJSON).length - game_index).times(function (index) {
                next_game = _.keys(scheduleJSON)[game_index + index + 1];

                next_games.push(next_game);
            });
        }

        console.log(next_games);
        var schedule_object = _.reduce(next_games, function (object, gameTitle) {
            object[gameTitle] = $.extend({}, scheduleJSON[gameTitle]);
            object[gameTitle]["runner"] = getRunnerData($.extend({}, scheduleJSON[gameTitle])["runner"]);
            return object;
        }, {});

        current_calendar["order"] = next_games;
        current_calendar["schedule"] = schedule_object;

        console.log(current_calendar);

        console.log("Game Data for " + current_game_title + " has been retrieved.");

        port.postMessage({ status: "changed",
            game: current_game_title,
            runner: current_runners,
            estimate: current_estimate,
            category: current_category,
            link: current_link,
            calendar: current_calendar
        });

        console.log("Game Data sent!");
    } else {
        console.log("Fuzzy text search failed to find a game title above the required threshold.");
    }
}

function getRunnerData(runners) {
    var runnersArray = runners.split(", ");

    var runnersObject = _.reduce(runnersArray, function (object, runner) {
        var runnerData = runnerJSON[runner];
        object[runner] = { logo: runnerData.logo, link: runnerData.link };
        return object;
    }, {});

    return runnersObject;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("https://gamesdonequick.com") > -1 && changeInfo.url === undefined) {
        portForMessage.postMessage({ status: "reload",
            game: current_game_title,
            runner: current_runners,
            estimate: current_estimate,
            category: current_category,
            link: current_link,
            calendar: current_calendar });
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("http://gamesdonequick.com") > -1 && changeInfo.url === undefined) {
        portForMessage.postMessage({ status: "reload",
            game: current_game_title,
            runner: current_runners,
            estimate: current_estimate,
            category: current_category,
            link: current_link,
            calendar: current_calendar });
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("https://discordapp.com/channels/140605087511740416/140605087511740416") > -1 && changeInfo.url === undefined) {
        portForMessage.postMessage({ status: "reload",
            game: current_game_title,
            runner: current_runners,
            estimate: current_estimate,
            category: current_category,
            link: current_link,
            calendar: current_calendar });
    }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    // for (key in changes) {
    //     if ()
    //     var storageChange = changes[key];
    //     console.log('Storage key "%s" in namespace "%s" changed. ' +
    //                   'Old value was "%s", new value is "%s".',
    //                   key,
    //                   namespace,
    //                   storageChange.oldValue,
    //                   storageChange.newValue);
    // }
    console.log(changes);
    portForMessage.postMessage({ status: "version", changes: changes });
});