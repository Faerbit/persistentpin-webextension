import {setupMenuItems} from "./contextmenu.js";
import {executeTabOpening, onError} from "./common.js";

// Flag to mark whether the initialization had run
let initialized = false;


if (initialized === false) {
    // Set the flag in the beginning, we don't want to wait for promises to resolve for initialization
    initialized = true;
    await executeTabOpening();
    await setupMenuItems();

    browser.windows.onCreated.addListener((newWindow) => {
        executeTabOpening(newWindow).then(null, onError);
    })
}
