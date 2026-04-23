const TARGET_URL = "https://www.kom.club/challenges.asp?status=active&filter=bike";

// Collect links from the current page
function colectUrls() {
    return `
        (function() {
            var list = document.getElementsByClassName('col-sm-6 challenge-list');
            
            var links = [];
            Array.from(list).forEach(element => {
                let internDiv = element.children[0];

                // Check if the element is visible
                const isVisualElementActive = element.offsetHeight;

                // Filter out ads and invalid cards
                const isElementCardWithoutAd =
                    internDiv.localName !== 'a' &&
                    !internDiv.classList.contains('col-sm-4') &&
                    !Boolean(element.style['padding-top']);

                // Validate structure before extracting link
                if (isVisualElementActive && element.childElementCount == 4 && isElementCardWithoutAd) {
                    const link = element.children[0].children[0];
                    if (link.tagName === 'A' && link.href) {
                        links.push(link.href);
                    }
                }
            });

            return links;
        })();
    `;
}

// Manual list of pages (pagination)
const PAGES = [
    TARGET_URL,
    TARGET_URL + "&page=2",
    TARGET_URL + "&page=3"
];

// MAIN
browser.browserAction.onClicked.addListener(async () => {

    let allLinks = [];

    // Loop through each page
    PAGES.forEach((pageUrl, pageIndex) => {
        setTimeout(() => {
            // Open page in new tab
            browser.tabs.create({ url: pageUrl }, function (tab) {
                // Wait for page to fully load
                browser.tabs.onUpdated.addListener(function listener(tabId, info) {
                    if (tabId === tab.id && info.status === 'complete') {
                        browser.tabs.onUpdated.removeListener(listener);
                        // Extra delay to ensure content is rendered
                        setTimeout(() => {
                            // Execute script to collect links
                            browser.tabs.executeScript(tab.id, {
                                code: colectUrls()
                            }).then(results => {
                                const links = results[0] || [];
                                allLinks.push(...links);
                                // Close the page tab after collecting
                                browser.tabs.remove(tab.id);
                            });
                        }, 1000);
                    }
                });
            });
        }, pageIndex * 3000); // Delay between page loads
    });

    // Process collected links
    setTimeout(() => {
        // Remove duplicate links
        allLinks = [...new Set(allLinks)];

        // Open each challenge and perform action
        allLinks.forEach((url, idx) => {
            setTimeout(() => {
                browser.tabs.create({ url }, function (newTab) {
                    browser.tabs.onUpdated.addListener(function clickListener(tabId2, info2) {
                        if (tabId2 === newTab.id && info2.status === 'complete') {
                            browser.tabs.onUpdated.removeListener(clickListener);
                            // Click "join challenge" button if it exists
                            browser.tabs.executeScript(newTab.id, {
                                code: `
                                    setTimeout(() => {
                                        var btn = document.querySelector('[data-cy="challenge_join_button"]');
                                        if(btn) btn.click();
                                    }, 2000);
                                `
                            }).then(() => {
                                // Close tab after action
                                setTimeout(() => {
                                    browser.tabs.remove(newTab.id);
                                }, 3000);
                            });
                        }
                    });

                });

            }, idx * 4000); // Prevent overload
        });

    }, 8000); // Wait time for all pages to be processed
});