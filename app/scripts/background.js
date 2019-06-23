'use strict';

window.current_game = null;
window.current_game_title = null;
window.current_link = null;
window.current_runners = null;
window.current_estimate = null;
window.current_category = null;
window.current_calendar = null;
window.current_number_calendar_items = 4;

window.runnerJSON = null;
window.scheduleJSON = null;
window.fuzzySet = null;
window.highlightsTitle = null;

window.gdqRunnerJSON = null;
window.gdqScheduleJSON = null;
window.gdqFuzzySet = null;
window.gdqFuzzySearchArray = null;
window.gdqHighlightsTitle = 'scheduleHighlights';

window.esaRunnerJSON = null;
window.esaScheduleJSON = null;
window.esaFuzzySet = null;
window.esaFuzzySearchArray = null;
window.esaHighlightsTitle = 'esa16scheduleHighlights';

window.checkForUpdatedScheduleJSON = null;

window.portForMessage = null;

$.getJSON('/json/sgdq2019_runners.json').done(function(resp) {
    gdqRunnerJSON = resp;
});
$.getJSON('/json/sgdq2019_schedule.json').done(function(resp) {
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
            console.log(msg);
            if (msg.message == "request") {
                $.ajax({
                  datatype: "json",
                  url: "https://api.twitch.tv/channels/gamesdonequick",
                  beforeSend: function(req) {
                    req.setRequestHeader('Client-ID', 'b7r2pt8m5gawx9u2ur2d9rx26xo6h7w')
                  },
                  success: function(resp) {
                    console.log("Completed request to Twitch");

                    if (current_game != resp.game) {
                        console.log("The Current Game being run is: " + resp.game);

                        current_game = resp.game;
                        getSpeedrunData(current_game, port);
                        console.log(current_link);
                    } else {
                        console.log("Still the same");
                    }
                  }
                });
            } else if (msg.message == "schedule") {
                console.log(msg.calendarItemsNumber);
                current_number_calendar_items = msg.calendarItemsNumber;
                getSpeedrunData(current_game, port);
            } else if (msg.message == "refresh") {
                $.ajax({
                  datatype: "json",
                  url: "https://api.twitch.tv/channels/gamesdonequick",
                  beforeSend: function(req) {
                    req.setRequestHeader('Client-ID', 'b7r2pt8m5gawx9u2ur2d9rx26xo6h7w')
                  },
                  success: function(resp) {
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

window.getSpeedrunData = (game, port) => {
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
        if (port.name == 'gdq') {
            $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/99cf3867bf38cd66b52d95640a6689a0/raw/sgdq2019_schedule.json").done(function (resp) {
                console.log("Request for Schedule JSON sent")
                if (_.difference(_.keys(resp), _.keys(scheduleJSON)) == []) {
                    console.log("JSON is not updated");
                    checkForUpdatedScheduleJSON = setInterval(function() {
                        $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/99cf3867bf38cd66b52d95640a6689a0/raw/sgdq2019_schedule.json").done(function (resp) {
                            if (_.difference(_.keys(resp), _.keys(scheduleJSON)) != []) {
                                gdqScheduleJSON = resp;
                                scheduleJSON = gdqScheduleJSON;
                                clearInterval(checkForUpdatedScheduleJSON);
                                getSpeedrunData(current_game, portForMessage);
                            }
                        });
                    }, 60000);
                } else {
                    // Set Schedule JSON equal to the updated gist version
                    console.log("JSON has been updated. Using new version!");
                    gdqScheduleJSON = resp;
                    scheduleJSON = gdqScheduleJSON;
                    gameData = scheduleJSON[game];
                }
            });
        } else if (port.name == 'esa') {
            $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/cde736fb9e43b34cf8f49c0c82d7c564/raw/esa_schedule2016.json").done(function (resp) {
                console.log("Request for Schedule JSON sent")
                if (_.difference(_.keys(resp), _.keys(scheduleJSON)) == []) {
                    console.log("JSON is not updated");
                    checkForUpdatedScheduleJSON = setInterval(function() {
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

            if (_.isEmpty(data)) {
              current_calendar["highlights"] = {};
            } else {
              current_calendar["highlights"] = data[highlightsTitle];
            }

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
            $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/250f581aec12ecd9a6510feeb9216b2a/raw/sgdq2019_runners.json").done(function (resp) {
                if (_.difference(_.keys(resp), _.keys(runnerJSON)) == []) {
                    checkForUpdatedRunnerJSON = setInterval(function() {
                        $.getJSON("https://gist.githubusercontent.com/theoriginalcamper/250f581aec12ecd9a6510feeb9216b2a/raw/sgdq2019_runners.json").done(function (resp) {
                            if (_.difference(_.keys(resp), _.keys(runnerJSON)) != []) {
                                gdqRunnerJSON = resp;
                                runnerJSON = gdqRunnerJSON;
                                clearInterval(checkForUpdatedRunnerJSON);
                                getSpeedrunData(current_game, portForMessage);
                            }
                        });
                    }, 60000);
                } else {
                    gdqRunnerJSON = resp;
                    runnerJSON = gdqRunnerJSON;
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
        if (portForMessage != null) {
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
    if (tab.url.indexOf("http://gamesdonequick.com") > -1 && changeInfo.url === undefined) {
        if (portForMessage != null) {
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
    if (tab.url.indexOf("https://discordapp.com/channels/140605087511740416/140605087511740416") > -1 && changeInfo.url === undefined) {
        if (current_game_title != current_game) {
            getSpeedrunData(current_game, portForMessage)
        } else {
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
    if (tab.url.indexOf("https://www.esamarathon.com") > -1 && changeInfo.url === undefined) {
        if (portForMessage.name == 'esa') {
            if (current_game_title != current_game) {
                getSpeedrunData(current_game, portForMessage)
            } else {
                portForMessage.postMessage({ status: "reload",
                    game: current_game_title,
                    runner: current_runners,
                    estimate: current_estimate,
                    category: current_category,
                    link: current_link,
                    calendar: current_calendar });
            }
        }
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf("http://www.esamarathon.com") > -1 && changeInfo.url === undefined) {
        if (portForMessage.name == 'esa') {
            if (current_game_title != current_game) {
                getSpeedrunData(current_game, portForMessage)
            } else {
                portForMessage.postMessage({ status: "reload",
                    game: current_game_title,
                    runner: current_runners,
                    estimate: current_estimate,
                    category: current_category,
                    link: current_link,
                    calendar: current_calendar });
            }
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
