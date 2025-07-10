import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * @prop default_locale
 * if you want to support multiple languages, you can use the following reference
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
 *
 * @prop browser_specific_settings
 * Must be unique to your extension to upload to addons.mozilla.org
 * (you can delete if you only want a chrome extension)
 *
 * @prop permissions
 * Firefox doesn't support sidePanel (It will be deleted in manifest parser)
 *
 * @prop content_scripts
 * css: ['content.css'], // public folder
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extensionName__',
  browser_specific_settings: {
    gecko: {
      id: '{ce5e1ed3-f068-47c2-bf39-8e38e3bb01ec}',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  host_permissions: ['https://api.twitch.tv/*', 'https://gist.githubusercontent.com/*'],
  permissions: ['storage', 'tabs', 'alarms'],
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'icon-34.png',
  },
  icons: {
    '128': 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['https://discord.com/*'],
      js: ['twitch.embed.v1.js', 'content/discord.iife.js'],
      css: ['styles/fontawesome-min.css', 'styles/discord.css'],
      run_at: 'document_end',
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        '*.js',
        '*.css',
        '*.svg',
        'icon-128.png',
        'icon-34.png',
        'fonts/fontawesome-webfont.woff',
        'json/sgdq2025_schedule.json',
        'json/sgdq2025_runners.json',
      ],
      matches: ['https://discord.com/*'],
    },
  ],
} satisfies ManifestType;

export default manifest;
