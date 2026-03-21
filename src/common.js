import {storage} from "./prefs.js";

export function onError(error) {
  console.log(`Error: ${error}`);
}

function openTabs(pinned_websites, openInAll, newWindow) {
  let getExistingPinnedTabs = browser.tabs.query({ "pinned": true });

  new Promise((resolve) => {
    if (pinned_websites.length === 0) {
      resolve();
      return;
    }

    getExistingPinnedTabs
      .then((existingPinnedTabs) => {
        let tabs = existingPinnedTabs;
        if (newWindow && newWindow.id) {
          // Filter out tabs only from the current window
          tabs = tabs.filter((tab) => tab.windowId === newWindow.id);
        }
        let pinIds = tabs.map((tab) => tab.id);
        return browser.tabs.remove(pinIds);
      })
      .then(() => {
        resolve();
      });
  }).then(() => {
    // Resolve windowIds that will be targeted by new pins
    new Promise((resolve) => {
      if (typeof newWindow !== 'undefined') {
        // We only want to pin tabs in the new window
        resolve([newWindow.id]);
        return;
      }

      if (openInAll) {
        browser.windows.getAll().then(allWindows => {
          resolve(allWindows.map(currentWindow => currentWindow.id));
        })
      } else {
        // Resolve undefined to open it only in the current window
        resolve([undefined]);
      }
    }).then(windowIds => {
      windowIds.forEach(windowId => {
        pinned_websites.forEach(function(website) {
          browser.tabs.create({
            active: false,
            pinned: true,
            url: website,
            windowId,
          }).then(_ => {});
        });
      })
    });
  });

}

export async function executeTabOpening(newWindow) {
  const pinnedWebsites = await storage.get_pinned_websites();
  const inAllWindows = await storage.get_pin_in_all_windows();
  if (!newWindow || inAllWindows === true) {
    openTabs(pinnedWebsites, inAllWindows, newWindow)
  }
}