# Disclaimer
This extension is an unverified extension. To use following this guide, you need to use one of the supported versions:
[Firefox Extension Workshop](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/#signing-your-addons))


# Join all events on Kom Club

This browser extension allows you to quickly join all ride events listed on Kom Club. When you click the extension button, it will automatically redirect you to Kom Club, get all ride events and join all of then (if you didn't joined).

## How to Build and Run

1. **Build the Extension**

   Use [web-ext](https://github.com/mozilla/web-ext) to build the extension package:

 ```sh
   npx web-ext build --overwrite-dest
   ```

   This will create a .zip file in the web-ext-artifacts directory.

## Firefox Developer Setting

To install unsigned extensions in Firefox (for development purposes), you need to disable signature enforcement:

1. Open a new tab and go to: `about:config`
2. Search for: `xpinstall.signatures.required`
3. Double-click the preference to set it to `false`

This allows you to load and use your extension without needing it to be signed by Mozilla.

## Install the Extension Temporarily
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click on "Load Temporary Add-on".
3. Select the `manifest.json` file from your extension directory.
4. The extension will be loaded temporarily and will be available for use until you restart Firefox.


## Install the Extension Permanently
1. Open Firefox and go to `about:addons`.
2. Click on the gear icon in the top right corner and select "Install Add-on From File...".
    - You can also drag and drop the .zip file into the Firefox add-ons page to install it.
3. Select the .zip file you created in the `web-ext-artifacts` directory.
4. The extension will be installed and will appear in your list of add-ons with the message ``Automatic Events to Kom Club could not be verified for use in LibreWolf. Proceed with caution.``.

3. **How It Works**

    - It don't validate if you are logged in or not, so you need to be logged in to Kom Club before using the extension.
   - When you click the extension button:
     1. The extension opens the Kom Club events page in a new tab.

     2. After the page loads, it automatically selects the current events tab and applies the bike filter.

     3. It collects all available bike event links from the page.

     4. For each collected event link:
        - It opens the event in a new tab.
        - Once the event page loads, it automatically clicks the "Join Challenge" button (if available).
        - The event tab closes automatically after 3 seconds.

4. **Permissions**

   The extension requires the following permissions:

   - Access to tabs and activeTab.
   - Access to kom.club and strava.com to automate the download process.

5. **Icons**

   Icons are provided in the images directory for various sizes.
