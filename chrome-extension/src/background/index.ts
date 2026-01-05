// File: src/background/index.ts
import FuzzySet from 'fuzzyset';
console.log('Service Worker loaded.');
// --- Type Definitions for TypeScript ---
interface Runner {
  logo: string;
  link: string;
}

interface RunnerData {
  [runnerName: string]: {
    logo?: string;
    link: string;
  };
}

interface RunnerMap {
  [runnerName: string]: {
    logo?: string;
    link: string;
  };
}

interface GameData {
  key?: string;
  index?: number;
  title: string;
  runner: string;
  estimate: string;
  category: string;
  link: string;
}

interface Schedule {
  [gameKey: string]: GameData;
}

let activePorts = {};

// --- Configuration Object (replaces duplicated logic) ---
// A single source of truth for each event's configuration.
const eventConfigs = {
  gdq: {
    scheduleJsonUrl: chrome.runtime.getURL('/json/agdq2026_schedule.json'),
    runnersJsonUrl: chrome.runtime.getURL('/json/agdq2026_runners.json'),
    gistScheduleUrl:
      'https://gist.githubusercontent.com/theoriginalcamper/29ed47490fd525ea005b287a35369257/raw/agdq2026_schedule.json',
    storageKeys: {
      schedule: 'gdqSchedule',
      runners: 'gdqRunners',
    },
    twitchUserId: '22510310',
  },
};

// --- Event Listeners ---

/**
 * Runs once when the extension is first installed or updated.
 * Ideal for setting up initial data and alarms.
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension Installed. Initializing data...');
  await initializeData();

  // Create an alarm to periodically check for schedule updates from Gist
  chrome.alarms.create('fetch-schedule-updates', {
    delayInMinutes: 0.1,
    periodInMinutes: 6, // Check every hour
  });
});

/**
 * Handles the alarm event to trigger periodic tasks.
 */
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === 'fetch-schedule-updates') {
    console.log('Alarm triggered: Checking for schedule updates...');
    // You would add the logic to check both GDQ and ESA gists here
    console.log(activePorts);
    for (const tabId in activePorts) {
      await sendUpdateToContentScript(parseInt(tabId));
    }
  }
});

/**
 * Handles long-lived connections from UI components (like the popup).
 */
chrome.runtime.onConnect.addListener(port => {
  const config = eventConfigs[port.name as keyof typeof eventConfigs];
  if (!config) {
    console.error(`Invalid port name received: ${port.name}`);
    return;
  }
  activePorts[port.sender.tab.id] = port;
  console.log(`Connection established for: ${port.name}`);

  port.onMessage.addListener(async msg => {
    if (msg.message === 'request' || msg.message === 'refresh') {
      await handleDataRequest(config, port);
    }
  });

  port.onDisconnect.addListener(function (disconnectedPort) {
    console.warn('Content script disconnected:', disconnectedPort.sender.tab.id);
    // Clean up the disconnected port from your activePorts map
    delete activePorts[disconnectedPort.sender.tab.id];
  });
});

async function sendUpdateToContentScript(tabId) {
  const port = activePorts[tabId];
  if (port) {
    try {
      await handleDataRequest(eventConfigs.gdq, port);
    } catch (e) {
      console.error('Error sending message to content script:', e);
      // This error might indicate the port is already disconnected,
      // which onDisconnect should handle.
    }
  }
}

// --- Core Logic Functions ---

/**
 * Fetches initial data from local JSON files and stores it.
 */
async function initializeData() {
  try {
    for (const key in eventConfigs) {
      const config = eventConfigs[key as keyof typeof eventConfigs];
      const schedule = await fetch(config.scheduleJsonUrl).then(res => res.json());
      const runners = await fetch(config.runnersJsonUrl).then(res => res.json());

      const enrichedSchedule = enrichSchedule(schedule);

      console.log(schedule);
      console.log(runners);
      await chrome.storage.local.set({
        [config.storageKeys.schedule]: enrichedSchedule,
        [config.storageKeys.runners]: runners,
      });
    }
    console.log('Initial schedule and runner data loaded into chrome.storage.local');
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

/**
 * Main handler for processing a data request from the popup.
 */
async function handleDataRequest(config: typeof eventConfigs.gdq, port: chrome.runtime.Port) {
  try {
    // IMPORTANT: Store credentials securely. This is just for demonstration.
    // In a real app, use an auth flow or a backend proxy.
    const CLIENT_ID = process.env['CEB_CLIENT_ID'];
    const AUTH_TOKEN = process.env['CEB_AUTH_TOKEN'];

    const twitchResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${config.twitchUserId}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Client-Id': CLIENT_ID,
      },
    });

    if (!twitchResponse.ok) {
      throw new Error(`Twitch API Error: ${twitchResponse.statusText}`);
    }

    const twitchData = await twitchResponse.json();
    const stream = twitchData.data[0];

    if (!stream) {
      console.log(`${port.name} is not currently live.`);
      port.postMessage({ status: 'offline' });
      return;
    }

    const currentGameName = stream.game_name;

    // Store the current game in session storage (cleared when browser closes)
    await chrome.storage.session.set({ currentGame: currentGameName });

    // TODO: Re-implement the logic to find game in schedule, get runners,
    // find next games, and post the full message back to the port.
    // This will involve reading from `chrome.storage.local`.
    chrome.storage.local
      .get('gdqSchedule')
      .then(result => {
        console.log(result.gdqSchedule);
        console.log(result.gdqSchedule[currentGameName]);
      })
      .catch(error => {
        console.error('Error retrieving myKey: ', error);
      });

    await buildAndPostGameData(currentGameName, config, port);

    console.log(`Current game for ${port.name}: ${currentGameName}`);
    // port.postMessage({ status: 'changed', game: currentGameName });
  } catch (error) {
    console.error(`Failed to handle data request for ${port.name}:`, error);
    port.postMessage({ status: 'error', message: error.message });
  }
}

/**
 * Enriches a raw schedule object with index and key properties for each game.
 * @param scheduleObject The raw schedule object from a JSON file.
 * @returns The enriched schedule object.
 */
function enrichSchedule(scheduleObject: Schedule): Schedule {
  const enriched: Schedule = {};
  Object.keys(scheduleObject).forEach((gameKey, index) => {
    enriched[gameKey] = {
      ...scheduleObject[gameKey],
      key: gameKey,
      index: index,
    };
  });
  return enriched;
}

/**
 * Fetches the latest schedule from Gist, compares it to the local version,
 * and updates storage if it's new.
 * @param config The configuration for the event (e.g., eventConfigs.gdq).
 * @returns {Promise<boolean>} True if the schedule was updated, false otherwise.
 */
async function fetchAndUpdateScheduleFromGist(config: typeof eventConfigs.gdq): Promise<boolean> {
  try {
    console.log('Fetching latest schedule from Gist...');
    const gistSchedule: Schedule = await fetch(config.gistScheduleUrl).then(res => res.json());

    const localData = await chrome.storage.local.get(config.storageKeys.schedule);
    const localSchedule = localData[config.storageKeys.schedule];

    // A reliable way to check for differences is to compare the stringified versions.
    // We compare against the raw Gist data, not the enriched version.
    if (JSON.stringify(Object.keys(gistSchedule)) === JSON.stringify(Object.keys(localSchedule))) {
      console.log('Gist schedule is the same as the local version. No update needed.');
      return false;
    }

    console.log('New schedule found on Gist! Updating local storage.');
    const enrichedSchedule = enrichSchedule(gistSchedule);

    await chrome.storage.local.set({
      [config.storageKeys.schedule]: enrichedSchedule,
    });

    return true; // Signal that an update occurred.
  } catch (error) {
    console.error('Failed to fetch or process Gist schedule:', error);
    return false; // Signal that no update occurred.
  }
}

/**
 * The main function to gather all game, runner, and calendar data and post it back.
 * @param currentGameName The game name received from the Twitch API.
 * @param config The configuration object for the current event (GDQ).
 * @param port The port to post the message back to.
 * @param isRetry A flag to prevent infinite loops if a Gist fetch doesn't solve the issue.
 */
async function buildAndPostGameData(
  currentGameName: string,
  config: typeof eventConfigs.gdq,
  port: chrome.runtime.Port,
  isRetry = false,
) {
  // 1. Get all necessary data from storage first.
  const storageData = await chrome.storage.local.get([config.storageKeys.schedule, config.storageKeys.runners]);
  const unsortedSchedule: Schedule = storageData[config.storageKeys.schedule];
  const allRunners: RunnerData = storageData[config.storageKeys.runners];

  if (!unsortedSchedule || !allRunners) {
    port.postMessage({ status: 'error', message: 'Schedule or runner data not found in storage.' });
    return;
  }

  const sortedScheduleArray: GameData[] = Object.values(unsortedSchedule).sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  // 2. Find the game in the schedule, using fuzzy matching as a fallback.
  const scheduleKeys = Object.keys(unsortedSchedule);
  const fuzzyMatcher = FuzzySet(scheduleKeys);
  let gameData = unsortedSchedule[currentGameName];
  let finalGameName = currentGameName;

  if (!gameData) {
    console.log(`Direct match for "${currentGameName}" not found. Trying fuzzy search...`);
    const fuzzyResult = fuzzyMatcher.get(currentGameName);
    if (fuzzyResult && fuzzyResult[0] && fuzzyResult[0][0] > 0.7) {
      // Using a 0.7 confidence threshold
      finalGameName = fuzzyResult[0][1];
      gameData = unsortedSchedule[finalGameName];
      console.log(`Fuzzy search found match: "${finalGameName}"`);
    }
  }

  // TODO: Implement logic to check Gist for an updated schedule if gameData is still not found.
  // This would involve another fetch call and comparing the new data with existing data.

  if (!gameData) {
    // --- THIS IS THE EXPLICIT SAFEGUARD ---
    // If this is a retry and we still haven't found the game, give up immediately.
    if (isRetry) {
      console.error(`Game not found even after Gist update. Aborting.`);
      port.postMessage({ status: 'not_found', game: currentGameName });
      return;
    }
    // ------------------------------------

    console.log(`Could not find "${currentGameName}" locally. Checking Gist for updates...`);

    const wasUpdated = await fetchAndUpdateScheduleFromGist(config);

    if (wasUpdated) {
      console.log('Re-running search with updated schedule...');
      // Re-run the function, but this time, pass `true` for the `isRetry` flag.
      return buildAndPostGameData(currentGameName, config, port, true);
    }
  }

  // 3. Get runner info for the current game.
  const currentRunners = getRunnerInfo(gameData.runner, allRunners);

  // 4. Get the next games for the calendar view.
  const numberOfCalendarItems = 4; // Default value from old script
  const calendar = await buildCalendar(finalGameName, sortedScheduleArray, allRunners, numberOfCalendarItems);

  // 5. Construct and post the final message.
  port.postMessage({
    status: 'changed',
    game: gameData.title,
    runner: currentRunners,
    estimate: gameData.estimate,
    category: gameData.category,
    link: gameData.link,
    calendar: calendar,
  });

  console.log(`Game data for "${gameData.title}" sent successfully.`);
}

/**
 * Takes a comma-separated runner string and looks up each runner's details.
 * @param runnerString The string of runners, e.g., "Elipsis, TheOriginalCamper".
 * @param allRunners The complete runner data object from storage.
 * @returns A map of runner names to their data.
 */
function getRunnerInfo(runnerString: string, allRunners: RunnerData): RunnerMap {
  const runnerNames = runnerString.split(',').map(part => part.trim());
  return runnerNames.reduce((acc, name) => {
    if (allRunners[name]) {
      acc[name] = allRunners[name];
    } else {
      // In a real scenario, you might want to handle missing runners.
      console.warn(`Runner "${name}" not found in runner data.`);
    }
    return acc;
  }, {} as RunnerMap);
}

/**
 * Builds the upcoming schedule object for the calendar view.
 * @param currentGameKey The key for the current game (e.g., "Super Mario 64").
 * @param schedule The full schedule object.
 * @param allRunners The full runner data object.
 * @param count The number of upcoming games to include.
 * @returns A calendar object ready to be sent to the content script.
 */
async function buildCalendar(
  currentGameKey: string,
  sortedSchedule: GameData[],
  allRunners: RunnerData,
  count: number,
) {
  // const scheduleKeys = Object.keys(schedule);
  // const currentIndex = scheduleKeys.indexOf(currentGameKey);

  // if (currentIndex === -1) {
  //   return { order: [], schedule: {}, highlights: {} };
  // }

  // // Get the keys for the next N games
  // const nextGameKeys = scheduleKeys.slice(currentIndex + 1, currentIndex + 1 + count);

  // // Build the schedule object for the upcoming games
  // const upcomingSchedule = nextGameKeys.reduce((acc, key) => {
  //   const game = schedule[key];
  //   acc[key] = {
  //     ...game,
  //     // Replace the runner string with the detailed runner object
  //     runner: getRunnerInfo(game.runner, allRunners),
  //   };
  //   return acc;
  // }, {} as { [key: string]: any });

  const currentIndex = sortedSchedule.findIndex(game => game.key === currentGameKey);

  if (currentIndex === -1) {
    return { order: [], schedule: {}, highlights: {} };
  }

  // Slice the array directly to get the next games
  const nextGames = sortedSchedule.slice(currentIndex + 1, currentIndex + 1 + count);

  // The rest of the logic is now simpler
  const upcomingSchedule = nextGames.reduce(
    (acc, game) => {
      acc[game.key] = {
        ...game,
        runner: getRunnerInfo(game.runner, allRunners),
      };
      return acc;
    },
    {} as { [key: string]: any },
  );

  // Get user's highlighted games from sync storage
  // Note: This is an example key. You'll need to decide how to store this.
  const highlightsData = await chrome.storage.sync.get('scheduleHighlights');
  const highlights = highlightsData.scheduleHighlights || {};

  // return {
  //   order: nextGameKeys,
  //   schedule: upcomingSchedule,
  //   highlights: highlights,
  // };
  return {
    order: nextGames.map(game => game.key), // The order is just the keys of the next games
    schedule: upcomingSchedule,
    highlights: highlights,
  };
}
