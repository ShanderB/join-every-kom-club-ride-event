const TARGET_URL = "https://www.kom.club/?register=true&state=&code=3bf32931c16bb587d93bb8bf2588fb3fdbacf734&scope=";

// Function that returns the code to be executed in the tab to collect event links
function coletarLinks(tabId) {
    // Shows the tab id in the console (for debugging)
    console.log(tabId);
    return `
        (async function() {
            // Selects the current events tab
            var challengesTab = window.document.getElementById('challenges-tab');
            if (challengesTab && challengesTab.children[1] && challengesTab.children[1].children[0]) {
                challengesTab.children[1].children[0].click();
            }

            // Waits 1 second to ensure the tab is open
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Filters only bike events
            var bikeFilter = window.document.getElementById('filter_bike');
            if (bikeFilter) {
                bikeFilter.click();
            }

            // Waits another second to ensure the filter is applied
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Collects all challenge list elements
            var list = window.document.getElementsByClassName('col-sm-6 challenge-list');
            
            // For each list element, checks if it is a valid card and collects the link
            var links = [];
            Array.from(list).forEach(element => {
                let internDiv = element.children[0];
                const isVisualElementActive = element.offsetHeight;
                const isElementCardWithoutAd = internDiv.localName !== 'a' && !internDiv.classList.contains('col-sm-4') && !Boolean(element.style['padding-top']);
                if (isVisualElementActive && element.childElementCount == 4 && isElementCardWithoutAd) {
                    const link = element.children[0].children[0];
                    if (link.tagName === 'A' && link.href) {
                        links.push(link.href);
                    }
                }
            });

            // Returns the list of found links
            return links;
        })();
    `;
}

// Listener for the extension icon click
browser.browserAction.onClicked.addListener(async () => {
    // Opens the events page
    browser.tabs.create({ url: TARGET_URL }, function (tab) {
        // Waits for the page to fully load
        browser.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
                browser.tabs.onUpdated.removeListener(listener);
                // Waits 1 extra second to ensure all requests are finished
                setTimeout(() => {
                    // Executes the script to collect event links
                    browser.tabs.executeScript(tab.id, {
                        code: coletarLinks(tab.id)
                    }).then(results => {
                        const links = results[0] || [];
                        console.log("Collected links:", results);
                        // Closes the collection tab
                        browser.tabs.remove(tab.id);
                        // For each collected link, opens the page, performs the action, and closes
                        links.forEach((url, idx) => {
                            setTimeout(() => {
                                browser.tabs.create({ url }, function (newTab) {
                                    browser.tabs.onUpdated.addListener(function clickListener(tabId2, info2) {
                                        if (tabId2 === newTab.id && info2.status === 'complete') {
                                            browser.tabs.onUpdated.removeListener(clickListener);
                                            // Clicks the join challenge button, if it exists
                                            browser.tabs.executeScript(newTab.id, {
                                                code: `
                                                    var btn = window.document.getElementsByClassName('Button--btn--1i5yb Button--primary--Phrgk btn-sm btn-block text-footnote ChallengeJoinButton--button--Q7s71')[0];
                                                    if(btn) btn.click();
                                                `
                                            }).then(() => {
                                                // Waits 3 seconds to ensure the action is performed and closes the tab
                                                setTimeout(() => {
                                                    browser.tabs.remove(newTab.id);
                                                }, 3000);
                                            });
                                        }
                                    });
                                });
                            }, idx * 4000); // Spaces out the openings to avoid overload
                        });
                    });
                }, 1000);
            }
        });
    });
});