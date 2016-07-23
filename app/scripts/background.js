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
var highlightsTitle = null;

var gdqRunnerJSON = null;
var gdqScheduleJSON = null;
var gdqFuzzySet = null;
var gdqFuzzySearchArray = null;
var gdqHighlightsTitle = 'scheduleHighlights';

var esaRunnerJSON = null;
var esaScheduleJSON = null;
var esaFuzzySet = null;
var esaFuzzySearchArray = null;
var esaHighlightsTitle = 'esa16scheduleHighlights';

var checkForUpdatedScheduleJSON = null;

var portForMessage = null;

$.getJSON('/json/sgdq_runners.json').done(function (resp) {
    gdqRunnerJSON = resp;
});
$.getJSON('/json/sgdq_schedule.json').done(function (resp) {
    gdqScheduleJSON = resp;
    gdqFuzzySearchArray = _.keys(gdqScheduleJSON);
    gdqFuzzySet = FuzzySet(gdqFuzzySearchArray);
    console.log(gdqFuzzySet);
});

$.getJSON('/json/esa_runners.json').done(function (resp) {
    esaRunnerJSON = resp;
});
$.getJSON('/json/esa_schedule.json').done(function (resp) {
    esaScheduleJSON = resp;
    esaFuzzySearchArray = _.keys(esaScheduleJSON);
    esaFuzzySet = FuzzySet(esaFuzzySearchArray);
    console.log(esaFuzzySet);
});

chrome.runtime.onConnect.addListener(function (port) {
    portForMessage = port;
    if (port.name == "gdq") {
        console.assert(port.name == "gdq");
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
    } else if (port.name == "esa") {
        console.assert(port.name == "esa");
        port.onMessage.addListener(function (msg) {
            if (msg.message == "request") {
                $.getJSON("https://api.twitch.tv/channels/esamarathon").done(function (resp) {
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
                getSpeedrunData(current_game, port, esaScheduleJSON, esaRunnerJSON, esaHighlightsTitle, esaFuzzySet);
            } else if (msg.message == "refresh") {
                $.getJSON("https://api.twitch.tv/channels/esamarathon").done(function (resp) {
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
    console.log(port.name);

    if (port.name == 'gdq') {
        console.assert(port.name == 'gdq');
        scheduleJSON = gdqScheduleJSON;
        runnerJSON = gdqRunnerJSON;
        highlightsTitle = gdqHighlightsTitle;
        fuzzySet = gdqFuzzySet;
    } else if (port.name == 'esa') {
        console.assert(port.name == 'esa');
        scheduleJSON = esaScheduleJSON;
        runnerJSON = esaRunnerJSON;
        highlightsTitle = esaHighlightsTitle;
        fuzzySet = esaFuzzySet;
    }

    var gameData = scheduleJSON[game];

    if (typeof gameData == 'undefined') {
        // Query for gist version of Schedule JSON
        if (port.name == 'esa') {
            $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/cde736fb9e43b34cf8f49c0c82d7c564/raw/esa_schedule2016.json").done(function (resp) {
                console.log("Request for Schedule JSON sent");
                if (_.difference(_.keys(resp), _.keys(scheduleJSON)) == []) {
                    console.log("JSON is not updated");
                    checkForUpdatedScheduleJSON = setInterval(function () {
                        $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/cde736fb9e43b34cf8f49c0c82d7c564/raw/esa_schedule2016.json").done(function (resp) {
                            if (_.difference(_.keys(resp), _.keys(scheduleJSON)) != []) {
                                esaScheduleJSON = resp;
                                scheduleJSON = esaScheduleJSON;
                                clearInterval(checkForUpdatedScheduleJSON);
                                getSpeedrunData(current_game, portForMessage);
                            }
                        });
                    }, 60000);
                } else {
                    // Set Schedule JSON equal to the updated gist version
                    console.log("JSON has been updated. Using new version!");
                    esaScheduleJSON = resp;
                    scheduleJSON = esaScheduleJSON;
                    gameData = scheduleJSON[game];
                }
            });
        }

        // console.log("Current game cannot be found in the parsed schedule.");
        // console.log("Returned a value of undefined.");
        // console.log("Trying fuzzy text search...");
        // var possibleGameTitle = fuzzySet.get(game);
        // console.log(possibleGameTitle);

        // if (possibleGameTitle[0][0] > 0.5) {
        //     gameData = scheduleJSON[possibleGameTitle[0][1]];
        //     console.log(gameData);
        // }
    }

    if (typeof gameData != 'undefined') {
        clearInterval(checkForUpdatedScheduleJSON);
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

        if (_.keys(scheduleJSON).length - (game_index + 1) >= current_number_calendar_items) {
            _(current_number_calendar_items).times(function (index) {
                next_game = _.keys(scheduleJSON)[game_index + index + 1];

                next_games.push(next_game);
            });
        } else {
            _(_.keys(scheduleJSON).length - (game_index + 1)).times(function (index) {
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

        chrome.storage.sync.get(highlightsTitle, function (data) {
            current_calendar["order"] = next_games;
            current_calendar["schedule"] = schedule_object;
            current_calendar["highlights"] = data[highlightsTitle];

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
        });
    } else {
        console.log("Fuzzy text search failed to find a game title above the required threshold.");
    }
}

function getRunnerData(runners) {
    console.log(runners);
    var runnersArray = runners.split(", ");

    var runnersObject = _.reduce(runnersArray, function (object, runner) {
        var runnerData = runnerJSON[runner];
        if (typeof runnerData == "undefined") {
            $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/bfd9e975d7d3b06b5ff95dc39a8f774b/raw/esa_runners2016.json").done(function (resp) {
                if (_.difference(_.keys(resp), _.keys(runnerJSON)) == []) {
                    checkForUpdatedRunnerJSON = setInterval(function () {
                        $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/bfd9e975d7d3b06b5ff95dc39a8f774b/raw/esa_runners2016.json").done(function (resp) {
                            if (_.difference(_.keys(resp), _.keys(runnerJSON)) != []) {
                                esaRunnerJSON = resp;
                                runnerJSON = esaRunnerJSON;
                                clearInterval(checkForUpdatedRunnerJSON);
                                getSpeedrunData(current_game, portForMessage);
                            }
                        });
                    }, 60000);
                } else {
                    esaRunnerJSON = resp;
                    runnerJSON = esaRunnerJSON;
                    runnerData = runnerJSON[runner];
                    object[runner] = { logo: runnerData.logo, link: runnerData.link };
                    return object;
                }
            });
        } else {
            object[runner] = { logo: runnerData.logo, link: runnerData.link };
            return object;
        }
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("https://www.esamarathon.com") > -1 && changeInfo.url === undefined) {
        if (portForMessage.name == 'esa') {
            portForMessage.postMessage({ status: "reload",
                game: current_game_title,
                runner: current_runners,
                estimate: current_estimate,
                category: current_category,
                link: current_link,
                calendar: current_calendar });
        }
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("http://www.esamarathon.com") > -1 && changeInfo.url === undefined) {
        if (portForMessage.name == 'esa') {
            portForMessage.postMessage({ status: "reload",
                game: current_game_title,
                runner: current_runners,
                estimate: current_estimate,
                category: current_category,
                link: current_link,
                calendar: current_calendar });
        }
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