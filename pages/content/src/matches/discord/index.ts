// // File: src/content/index.ts

// console.log('GDQ Content Script loaded on Discord!');

// /**
//  * Listens for messages from other parts of the extension (e.g., the service worker).
//  */
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log('Message received in content script:', message);

//   if (message.type === 'SHOW_GAME_INFO') {
//     // Example of future functionality: You could use this to display
//     // the current game information in a custom div on the Discord page.
//     alert(`The current game is: ${message.game}`);
//   }

//   // sendResponse is used to send a reply back to the sender.
//   sendResponse({ status: 'Message received successfully!' });
// });

// // Example of how to send a message from the content script to the service worker.
// // This could be triggered by a button click or another event on the page.
// function notifyServiceWorker() {
//   chrome.runtime.sendMessage({ message: 'Hello from the Discord page!' });
// }

// // You could call this function based on some user interaction on the page.
// // For example, finding a specific button and adding a click listener.

// console.log('[GDQ] Example content script loaded');

// File: src/content/index.ts

console.log('%c[GDQ]%c Content Script for Discord Loaded.', 'color: purple; font-weight: bold;', '');

// --- Type Definitions ---
// These should match the types you use in your background script
// to ensure data consistency.
interface Runner {
  logo?: string;
  link: string;
}

interface RunnerMap {
  [runnerName: string]: Runner;
}

interface GameData {
  status?: string;
  title: string;
  runner: RunnerMap;
  estimate: string;
  category?: string;
  calendar?: Object;
  link: string;
}

interface Calendar {
  order: string[];
  schedule: { [gameTitle: string]: GameData };
  highlights: { [gameTitle: string]: boolean };
}

const SELECTORS = {
  // A stable element to watch for to know the UI is loaded
  uiReadyAnchor: 'section[class*="panels_"]',
  // The user avatar panel at the bottom-left
  userPanel: 'section[class*="panels_"]',
  // The main chat view container
  chatContainer: 'div[class*="chat_"]',
  // The header bar above the chat
  titleHeader: 'section[class*="title_"]',
  // Title bar above the app
  titleBar: 'div[class*="bar_"]',
  // The leftmost server list
  guildsWrapper: 'nav[class*="guilds_"]',
  // The channel list sidebar
  sidebar: 'div[class*="sidebarList_"]',
  // The main container for chat messages
  messagesWrapper: 'div[class*="messagesWrapper_"]',
  // The button to toggle the server member list
  memberListButton: '[aria-label*="Member List"]',
  // Bar Icons Container
  channelHeaderTrailingIcons: 'div[class*="trailing_"]',
};

// --- Script State ---
// Using a state object is cleaner than global variables.
const state = {
  isTwitchPlayerActive: false,
  wasMemberListVisible: false,
  twitchPlayerSize: 'small' as 'small' | 'large',
  headerHeight: '48px',
};

let port;

// --- Main Initialization ---
// The script's entry point.
function main() {
  // setupMessageListener();
  observeDOMChanges();
  connectToBackground();
}

/**
 * Listens for messages from the background service worker and updates the UI.
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received from service worker!:', message);
    console.log('Message is:', message.status);
    if (message.status === 'changed' || message.status === 'reload') {
      console.log('Message inside loop');
      updateGdqHeaderUI(message);
      updateCalendarUI(message.calendar);
    }
    sendResponse({ status: 'Message processed by content script.' });
  });
}

/**
 * Uses MutationObserver to wait for Discord's UI to be ready.
 * This is far more efficient and reliable than setInterval.
 */
function observeDOMChanges(): void {
  const observer = new MutationObserver((mutations, obs) => {
    // Look for the user panel, which is a stable element at the bottom-left.
    const userPanel = document.querySelector(SELECTORS.uiReadyAnchor);
    const titleCheck = document.querySelector(SELECTORS.titleHeader);
    if (userPanel && titleCheck) {
      console.log('%c[GDQ]%c Discord UI is ready. Initializing GDQ elements.', 'color: purple; font-weight: bold;', '');
      injectGdqUi();
      // Once we've found it and initialized, we don't need to observe anymore.
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function connectToBackground() {
  // Disconnect any existing port to prevent multiple connections if called redundantly
  if (port && port.disconnect) {
    port.disconnect();
  }

  port = chrome.runtime.connect({ name: 'gdq' });

  port.onMessage.addListener(function (msg) {
    if (msg.status === 'changed' || msg.status === 'reload') {
      console.log('Message received from service worker:', msg);
      updateGdqHeaderUI(msg);
      updateCalendarUI(msg.calendar);
      console.log('The Current Game is: ' + msg.game);
    } else if (msg.status === 'unchanged') {
      console.log('Current game has not changed since last request (from port message)');
    }
    // No sendResponse needed here for port messages
  });

  port.onDisconnect.addListener(function () {
    console.log(
      '%c[GDQ]%c Port disconnected. Attempting to re-establish connection in 1 second...',
      'color: purple; font-weight: bold;',
      '',
    );
    // Clean up the disconnected port reference
    port = null;
    // Reconnect after a short delay to avoid a tight loop if there's a persistent issue
    setTimeout(connectToBackground, 1000); // Wait 1 second before retrying
  });

  // Initial message to request current data upon connection
  // This is good practice to get the current state when the content script loads or reconnects
  port.postMessage({ message: 'request' });
}

function injectCalendarToggleIcon(): void {
  const targetContainer = document.querySelector(SELECTORS.channelHeaderTrailingIcons);

  if (!targetContainer) {
    console.warn('Could not find the trailing icons container to inject the calendar toggle.');
    return;
  }

  // Prevent duplicate icons from being added on fast re-renders.
  if (document.getElementById('gdq-calendar-toggle-icon')) {
    return;
  }

  // 1. Create the icon element
  const icon = document.createElement('i');

  // 2. Assign an ID for easy event handling and give it FontAwesome classes
  icon.id = 'gdq-calendar-toggle-icon';
  icon.className = 'fa fa-calendar-check-o'; // Or 'fa-solid fa-calendar' for FA v6

  // 3. Apply styles to make it look like a native Discord icon
  icon.style.cursor = 'pointer';
  icon.style.color = 'var(--interactive-normal)'; // Use Discord's theme variable
  icon.style.margin = '0 8px'; // Give it some space
  icon.style.fontSize = '20px'; // Adjust size as needed
  icon.ariaLabel = 'Toggle GDQ Schedule';

  // Add hover effect to match Discord's UI
  icon.onmouseover = () => (icon.style.color = 'var(--interactive-hover)');
  icon.onmouseout = () => (icon.style.color = 'var(--interactive-normal)');

  // 4. Prepend it to the container so it appears first (leftmost)
  targetContainer.prepend(icon);
  console.log('%c[GDQ]%c Calendar toggle icon injected.', 'color: purple; font-weight: bold;', '');
}

/**
 * Injects the main GDQ header and Twitch switch into the page.
 */
function injectGdqUi(): void {
  // Inject FontAwesome stylesheet
  const styleNode = document.createElement('style');
  styleNode.textContent = `@font-face { font-family: FontAwesome; src: url(${chrome.runtime.getURL('/fonts/fontawesome-webfont.woff')});}`;
  document.head.appendChild(styleNode);

  // Inject the Twitch Player embed script
  const chatContainer = document.querySelector(SELECTORS.chatContainer);
  const titleHeader = document.querySelector(SELECTORS.titleHeader);
  const guildsWrapper = document.querySelector(SELECTORS.guildsWrapper) as HTMLElement;
  const sidebar = document.querySelector(SELECTORS.sidebar) as HTMLElement;

  if (!chatContainer || !titleHeader || !guildsWrapper || !sidebar) {
    console.log(chatContainer);
    console.log(titleHeader);
    console.log(guildsWrapper);
    console.log(sidebar);
    console.error('Could not find necessary Discord UI elements to inject header.');
    return;
  }

  const headerHeight = (titleHeader as HTMLElement).offsetHeight ?? 48;
  const headerLeftOffset = guildsWrapper.offsetWidth + sidebar.offsetWidth;
  const barHeight = document.querySelector('div[class^="bar_"]');
  state.headerHeight = `${headerHeight}px`;

  const headerHTML = `
    <header id="gdq-header" style="width: ${document.querySelector('div[class^="chat_"] > div[class^="subtitleContainer_"] > section > div > div[class^="children"]')?.clientWidth}px; height: ${headerHeight}px; min-height: ${headerHeight}px; position: fixed; top: ${barHeight?.clientHeight}px; left: ${headerLeftOffset}px; z-index: 101; overflow: hidden; background-color: var(--background-base-lower); color: var(--icon-tertiary); border-bottom: var(--border-subtle, hsla(229, 7%, 45%, .12)); border-top: var(--border-subtle, hsla(229, 7%, 45%, .12));">
      <div class="extension-container" style="padding: 0 16px;">
        <div id="gdq-options" style="float: right; display: flex; align-items: center; gap: 15px; font-size: 18px; height: 48px">
            <i class="fa fa-calendar" id="calendar-toggle" style="cursor: pointer;"></i>
            <i class="fa fa-refresh" id="refresh-button" style="cursor: pointer;"></i>
        </div>
        <div class="game-information" style="height: 100%; padding-top: 4px;">
            <div style="margin-bottom: 5px;"> <b>Current Game: </b>
                <a id="gdq-speedrun-link" class="speedrun-link" target="_blank"></a>
            </div>
            <div id="gdq-runners-information"><b>Runners: </b><a target="_blank" style="color: var(--text-link);"></a></div>
        </div>
        <div style="clear:both;"></div>
        <div id="collapseCalendar" style="display: none; padding-top: 10px;">
          <p><i class="fa fa-calendar" style="margin-right: 10px;"></i> Next Runs</p>
          <table class="table" id="schedule-table" style="width: 100%; border-collapse: collapse;">
            <tbody></tbody>
          </table>
        </div>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('beforeend', headerHTML);

  const userPanel = document.querySelector(SELECTORS.userPanel);
  if (userPanel) {
    const switchHTML = `
      <div id="twitch-switch-container" style="padding: 10px; border-top: 1px solid var(--background-modifier-accent); display: flex; align-items: center; justify-content: space-between;">
        <label for="twitch-player-display" style="font-weight: bold; color: var(--header-primary);">Twitch Player</label>
        
        <div id="twitch-switch">
          <label class="switch">
            <input type="checkbox" id="twitch-player-display">
            <span class="slider round"></span>
          </label>
          <i class="fa fa-expand" id="player-size-icon" style="margin-left: 10px; cursor: pointer; display: none;"></i>
        </div>
      </div>
    `;
    userPanel.insertAdjacentHTML('beforeend', switchHTML);
  }

  injectCalendarToggleIcon();
  addEventListeners();
  initGuildListeners();
  requestInitialData();
}

/**
 * Adds all necessary event listeners to the injected UI.
 */
function addEventListeners(): void {
  document.getElementById('refresh-button')?.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    target.classList.add('fa-spin');

    // Use the established port to send the message
    if (port) {
      port.postMessage({ message: 'refresh' });
    } else {
      console.error('Cannot refresh: Port to background script is not connected.');
    }

    setTimeout(() => target.classList.remove('fa-spin'), 2000);
  });

  document.getElementById('calendar-toggle')?.addEventListener('click', () => {
    const calendar = document.getElementById('collapseCalendar');
    const header = document.getElementById('gdq-header');

    if (calendar && header) {
      const isVisible = calendar.style.display !== 'none';
      calendar.style.display = isVisible ? 'none' : 'block';
      header.style.height = isVisible ? `${state.headerHeight}px` : 'auto';
    }
  });

  document.getElementById('twitch-player-display')?.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    updateTwitchPlayer(target.checked ? 'add' : 'remove');
  });

  document.getElementById('gdq-calendar-toggle-icon')?.addEventListener('click', () => {
    const calendar = document.getElementById('collapseCalendar');
    const header = document.getElementById('gdq-header');
    const icon = document.getElementById('gdq-calendar-toggle-icon');

    if (calendar && header) {
      // const isCalendarVisible = calendar.style.display !== 'none';
      // calendar.style.display = isCalendarVisible ? 'none' : 'block';

      // We still need to show/hide our main header bar which contains the calendar.
      const isHeaderVisible = header.style.display !== 'none';
      header.style.display = isHeaderVisible ? 'none' : 'block';

      icon?.classList.toggle('fa-calendar-check-o');
      icon?.classList.toggle('fa-calendar-times-o');
    }
  });

  document.getElementById('player-size-icon')?.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    state.twitchPlayerSize = state.twitchPlayerSize === 'small' ? 'large' : 'small';
    adjustTwitchPlayerSize();
    target.classList.toggle('fa-expand');
    target.classList.toggle('fa-compress');
  });
}

function applyStylesAfterNavigation(): void {
  const chat = document.querySelector(SELECTORS.chatContainer);
  if (!chat) return;

  // 1. Define what the observer will do when a mutation is detected.
  const callback: MutationCallback = (mutations, observer) => {
    // We are looking for a mutation where nodes are added.
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const messagesWrapper = document.querySelector(SELECTORS.messagesWrapper) as HTMLElement;
        if (messagesWrapper) {
          console.log(
            '%c[GDQ]%c React re-render detected. Applying styles to new messages wrapper.',
            'color: purple; font-weight: bold;',
            '',
          );

          // --- YOUR STYLING LOGIC GOES HERE ---
          // For example, let's say we are adjusting the width like before.
          if (state.isTwitchPlayerActive) {
            state.twitchPlayerSize = 'large';
            const messagesWrapperParent =
              document.querySelector<HTMLElement>('[class^="messagesWrapper"]')?.parentElement;
            if (messagesWrapperParent) {
              messagesWrapperParent.style.alignItems = 'flex-end';
            }
            adjustTwitchPlayerSize();
          }
          // ------------------------------------

          // 3. IMPORTANT: We've done our job, so disconnect the observer
          // to prevent it from running again unnecessarily.
          observer.disconnect();
          return; // Exit after we've found our element and styled it.
        }
      }
    }
  };

  // 2. Create and configure the observer to watch the chat container.
  const observer = new MutationObserver(callback);
  observer.observe(chat, {
    childList: true, // Watch for nodes being added or removed.
    subtree: true, // Watch descendants as well.
  });

  // As a fallback, if React doesn't re-render within a short time,
  // disconnect the observer to avoid memory leaks.
  setTimeout(() => observer.disconnect(), 5000);
}

const initGuildListeners = () => {
  // Check if element has been found
  if (document.querySelectorAll('[class*="guilds_"]').length > 0) {
    const serverContainer = document.querySelector('div[aria-label*="Servers"]');
    if (serverContainer) {
      serverContainer.addEventListener('click', event => {
        const target = event.target as HTMLElement;
        console.log(target);
        // Check if the clicked element or its parent matches '[class^="listItem_"] > div'
        const listItemDiv = target.closest('div[class^="blobContainer_"]');
        if (listItemDiv) {
          console.log(listItemDiv);
          console.log(document.querySelectorAll('[class^="listItem_"] > div').length);

          if (state.isTwitchPlayerActive) {
            const hasGamesDoneQuick =
              listItemDiv.hasAttribute('data-dnd-name') &&
              listItemDiv.getAttribute('data-dnd-name') == 'GamesDoneQuick';
            console.log(hasGamesDoneQuick);
            if (hasGamesDoneQuick) {
              applyStylesAfterNavigation();
              const twitchContainer = document.getElementById('twitch-container');
              if (twitchContainer) {
                twitchContainer.style.display = '';
              }
              const twitchSwitch = document.getElementById('twitch-switch');
              if (twitchSwitch) {
                twitchSwitch.style.display = '';
              }

              updateDiscordUI('add');
            } else {
              const twitchContainer = document.getElementById('twitch-container');

              if (twitchContainer) {
                twitchContainer.style.display = 'none';
              }

              const twitchSwitch = document.getElementById('twitch-switch');
              if (twitchSwitch) {
                twitchSwitch.style.display = 'none';
              }
              updateDiscordUI('remove');
            }
          }
        }
      });
    }
  }
};
/**
 * Sends an initial message to the service worker to get the current game data.
 */
function requestInitialData(): void {
  chrome.runtime.sendMessage({ message: 'request' });
}

// --- UI Update Functions ---

function updateGdqHeaderUI(data: GameData): void {
  console.log('%c[GDQ]%c Updating Header UI', 'color: purple; font-weight: bold;', '');
  console.log(data);
  const link = document.getElementById('gdq-speedrun-link') as HTMLAnchorElement;
  const runners = document.getElementById('gdq-runners-information');
  if (!link || !runners) return;

  link.href = data.link;
  link.textContent = data.category ? `${data.game} (${data.category})` : data.game;
  runners.innerHTML = generateFormattedRunnerString(data.runner, 'header');
}

function updateCalendarUI(calendar: Calendar | null): void {
  const tbody = document.querySelector('#schedule-table tbody');
  if (!tbody || !calendar) return;

  tbody.innerHTML = calendar.order
    .map((gameTitle, index) => {
      const item = calendar.schedule[gameTitle];
      return generateScheduleItemString(item, calendar.highlights, index + 1);
    })
    .join('');
}

function updateTwitchPlayer(action: 'add' | 'remove'): void {
  if (action === 'add') {
    state.isTwitchPlayerActive = true;
    const memberListButton = document.querySelector(SELECTORS.memberListButton);
    state.wasMemberListVisible = memberListButton?.classList.contains('selected-') ?? false;
    if (state.wasMemberListVisible) {
      (memberListButton as HTMLElement).click();
    }

    const guildsWrapper = document.querySelector(SELECTORS.guildsWrapper) as HTMLElement;
    const header = document.querySelector(SELECTORS.titleHeader) as HTMLElement;
    const userPanel = document.querySelector(SELECTORS.userPanel) as HTMLElement;
    const titleBar = document.querySelector(SELECTORS.titleBar) as HTMLElement;

    const container = document.createElement('div');
    container.id = 'twitch-container';
    container.style.position = 'fixed';
    container.style.top = `${header.offsetHeight + titleBar.offsetHeight}px`;
    container.style.left = `${guildsWrapper.offsetWidth}px`;
    container.style.height = `calc(100vh - ${header.offsetHeight}px - ${userPanel.offsetHeight}px - ${titleBar.offsetHeight}px)`;
    container.style.width = `document.documentElement.clientWidth - document.querySelector(SELECTORS.guildsWrapper).offsetWidth - (document.querySelector('[class^="chat"]').offsetWidth * (parseFloat(document.querySelector('[class^="messagesWrapper"]').style.width)) / 100)px`;
    container.style.zIndex = '100';
    document.body.appendChild(container);

    // This part remains the same, relying on the manifest-injected script.
    new (window as any).Twitch.Embed('twitch-container', {
      width: '100%',
      height: '100%',
      layout: 'video',
      channel: 'gamesdonequick',
      parent: ['discord.com'],
    });

    document.getElementById('player-size-icon')!.style.display = 'inline-block';
    updateDiscordUI('add');
  } else {
    state.isTwitchPlayerActive = false;
    document.getElementById('twitch-container')?.remove();
    document.getElementById('player-size-icon')!.style.display = 'none';

    updateDiscordUI('remove');

    if (state.wasMemberListVisible) {
      const memberListButton = document.querySelector(SELECTORS.memberListButton) as HTMLElement;
      memberListButton?.click();
    }
  }
}

function updateDiscordUI(msg: 'add' | 'remove'): void {
  // Assuming 'twitchActive' is a globally accessible variable or passed into the function.
  // For type safety, consider defining its type if it's not already.
  console.log('TwitchActive: ' + state.isTwitchPlayerActive);

  const messagesWrapperParent = document.querySelector<HTMLElement>('[class^="messagesWrapper"]')?.parentElement;
  const messagesWrapper = document.querySelector<HTMLElement>('[class^="messagesWrapper"]');
  const messagesForm = document.querySelector<HTMLElement>('[class^="messagesWrapper"]')
    ?.nextElementSibling as HTMLElement | null;
  const playerSizeIcon = document.getElementById('player-size-icon');

  if (msg === 'add') {
    console.log('%c[GDQ]%c Rearranging Discord UI', 'color: purple; font-weight: bold;', '');
    if (messagesWrapperParent) {
      messagesWrapperParent.style.alignItems = 'flex-end';
      console.log('%c[GDQ]%c Applied chat flex-end');
    }
    // Assuming 'adjustTwitchPlayerSize' and 'twitchPlayerSizeState' are defined elsewhere.
    // Ensure 'twitchPlayerSizeState' has a defined type if not already.
    state.twitchPlayerSize = 'small';
    adjustTwitchPlayerSize();
    if (playerSizeIcon) {
      playerSizeIcon.style.display = 'inline-block';
    }
  } else if (msg === 'remove') {
    console.log('%c[GDQ]%c Discord UI returned to normal', 'color: purple; font-weight: bold;', '');
    if (messagesWrapperParent) {
      messagesWrapperParent.removeAttribute('style');
    }
    if (messagesWrapper) {
      messagesWrapper.removeAttribute('style');
    }
    if (messagesForm) {
      messagesForm.removeAttribute('style');
    }
    if (playerSizeIcon) {
      playerSizeIcon.style.display = 'none';
    }
  }
}

function adjustTwitchPlayerSize(): void {
  // Ensure twitchPlayerSizeState is accessible in this scope and typed appropriately,
  // e.g., 'let twitchPlayerSizeState: 'large' | 'small';' elsewhere.

  const twitchContainer = document.getElementById('twitch-container');
  var messagesWrapper = document.querySelector<HTMLElement>('[class^="messagesWrapper"]');
  // Using `as HTMLElement | null` because nextElementSibling returns `Element | null`
  const messagesForm = messagesWrapper?.nextElementSibling as HTMLElement | null;
  const unreadMentionsIndicatorTop = document.querySelector<HTMLElement>('[class^="unreadMentionsIndicatorTop_"]');

  if (state.twitchPlayerSize === 'large') {
    console.log('[GDQ] Switching to large Twitch player display.', 'color: purple; font-weight: bold;', '');
    if (twitchContainer) {
      twitchContainer.style.width = '70%';
    }
    if (messagesWrapper) {
      messagesWrapper.style.width = '32%';
    }
    if (messagesForm) {
      messagesForm.style.width = '29%';
      messagesForm.style.marginRight = '2%';
      messagesForm.style.marginLeft = '0px';
    }
  } else if (state.twitchPlayerSize === 'small') {
    console.log('%c[GDQ]%c Switching to small Twitch player display.', 'color: purple; font-weight: bold;', '');
    // Original line commented out: $('#twitch-container').css('width', twitchPlayerInitialSize);
    // If twitchPlayerInitialSize is needed, ensure it's defined and accessible.
    // console.log(messagesWrapper)
    messagesWrapper = document.querySelector<HTMLElement>('[class^="messagesWrapper"]');
    if (messagesWrapper) {
      messagesWrapper.style.width = '48%';
    }
    if (messagesForm) {
      messagesForm.style.width = '44%';
      messagesForm.style.marginRight = '2%';
      messagesForm.style.marginLeft = '0px';
    }

    // Calculate twitch-container width based on other elements
    let calculatedWidth = document.documentElement.clientWidth; // Equivalent to $(document).width()
    if (unreadMentionsIndicatorTop) {
      calculatedWidth -= unreadMentionsIndicatorTop.offsetWidth; // Equivalent to .outerWidth()
    }
    if (messagesWrapper) {
      // Note: jQuery's .width() often refers to content width.
      // If you need the *full* rendered width (content + padding + border), use offsetWidth.
      // If you truly need *only* content width, consider getComputedStyle(element).width
      // For now, assuming offsetWidth is the desired equivalent for layout calculations.
      calculatedWidth -= messagesWrapper.offsetWidth;
    }

    if (twitchContainer) {
      twitchContainer.style.width = `${calculatedWidth}px`;
    }
  }
}

// --- HTML Generation Helpers ---

function generateFormattedRunnerString(runners: RunnerMap, location: 'header' | 'table'): string {
  const runnerNames = Object.keys(runners);
  let runnerString = location === 'header' ? '<b>Runners: </b>' : 'by ';

  if (runnerNames.length === 0) return '';
  if (runnerNames.length === 1) return runnerString + generateRunnerElement(runners, runnerNames[0]);

  const last = runnerNames.pop()!;
  return (
    runnerString +
    runnerNames.map(name => generateRunnerElement(runners, name)).join(', ') +
    ' and ' +
    generateRunnerElement(runners, last)
  );
}

function generateRunnerElement(runnerObject: RunnerMap, name: string): string {
  const runner = runnerObject[name];
  const logoImg = runner.logo
    ? `<img class="runner-logo" src="${runner.logo}" style="width: 14px; vertical-align: middle; margin-right: 4px;"/>`
    : '';
  return `<a href="${runner.link}" target="_blank" style="color: var(--text-link);">${logoImg}${name}</a>`;
}

function generateScheduleItemString(item: GameData, highlights: { [key: string]: boolean }, index: number): string {
  const isHighlighted = highlights[item.title];
  const highlightStyle = isHighlighted ? 'background-color: var(--background-modifier-hover);' : '';
  const starIcon = isHighlighted ? '<i class="fa fa-star"></i> ' : '';
  const category = item.category ? ` (${item.category})` : '';

  return `
    <tr style="${highlightStyle}">
      <td style="text-align: center; vertical-align: middle; padding: 8px;">${index}</td>
      <td style="padding: 8px;">
        <a class="speedrun-link" href="${item.link}" target="_blank">${starIcon}${item.title}${category}</a>
        <p class="runners-links" style="font-size: 0.9em; color: var(--text-muted);">${generateFormattedRunnerString(item.runner, 'table')}</p>
      </td>
      <td style="text-align: center; vertical-align: middle; padding: 8px;">
        <i class="fa fa-clock-o"></i> ${item.estimate}
      </td>
    </tr>
  `;
}

// Start the script
main();
