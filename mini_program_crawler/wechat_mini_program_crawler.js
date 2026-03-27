/**
 * Mini Program Crawler Script
 * 
 * Note: This script is designed to be used within the WeChat built-in browser environment.
 */

// Dictionary-based mini-program search crawler
const initialString = 'weixin://resourceid/AppletDiscover/app.html#/search/';
// Keywords for mini-program search
const keywords = [
"x","y"// input keywords
];

// Global variables initialization
window.index = 1;
window.round = 1;
window.nickName = []; // Standardize variable name (camelCase)
window.description = []; // Standardize variable name (avoid abbreviations)

// Traverse each keyword for mini-program search
keywords.forEach(keyword => {
  const searchUrl = initialString + keyword; // Rename for clarity
  
  // Timer 1: Navigate to search page (5s delay + interval per round)
  setTimeout(() => {
    console.log('Navigating to search URL:', searchUrl);
    window.location.href = searchUrl;
  }, 5000 + 82000 * (window.round - 1));

  // Timer 2: Crawl mini-program data (15s delay + interval per round)
  setTimeout(() => {
    // Get all mini-program wrapper elements
    const appWrappers = document.querySelectorAll('.app_wrapper');
    console.log('Found mini-program wrappers count:', appWrappers.length);
    
    let currentIndex = 0; // Use block-scoped variable (let) instead of var

    // Recursive function to process each mini-program wrapper
    function processWrapper() {
      const currentWrapper = appWrappers[currentIndex];
      
      // Extract mini-program nickname (content__item-title)
      const titleElement = currentWrapper.querySelector('.content__item-title');
      if (titleElement) {
        const nickNameText = titleElement.querySelector('span').textContent;
        console.log('Mini-program Nickname:', nickNameText);
        window.nickName.push(nickNameText);
        window.index++;
      }

      // Extract mini-program description (content__item-type)
      const typeElement = currentWrapper.querySelector('.content__item-type');
      if (typeElement) {
        const descText = typeElement.querySelector('span').textContent;
        console.log('Mini-program Type/Desc:', descText);
        window.description.push(descText);
      }

      // Trigger right-click (contextmenu) event on current wrapper
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      currentWrapper.dispatchEvent(contextMenuEvent);

      // Click the 2nd option in right-click menu (400ms delay)
      setTimeout(() => {
        const rightMenuLinks = document.querySelectorAll('.menu_wrapper .right-menu a');
        if (rightMenuLinks.length >= 2) {
          rightMenuLinks[1].click();
          console.log('Clicked 2nd option in right-click menu');
        } else {
          console.warn('Right-click menu link (index 1) not found');
        }
      }, 400);

      // Move to next wrapper (recursive call) if not last
      currentIndex++;
      if (currentIndex < appWrappers.length) {
        setTimeout(processWrapper, 1000);
      }
    }

    // Start processing wrappers if any exist
    if (appWrappers.length > 0) {
      processWrapper();
    } else {
      console.warn('No mini-program wrappers found for keyword:', keyword);
    }

  }, 15000 + 82000 * (window.round - 1));

  window.round++;
});

// Timer 3: Store crawled data into IndexedDB after all rounds
setTimeout(() => {
  // Open IndexedDB (database name: "miniProgramCrawlerDB")
  const dbOpenRequest = indexedDB.open('miniProgramCrawlerDB');

  // Create object store if database is first opened/upgraded
  dbOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    // Object store: "miniApps" (auto-increment ID as key)
    const miniAppStore = db.createObjectStore('miniApps', { autoIncrement: true });
    // Create index for "id" (non-unique) for quick query
    miniAppStore.createIndex('idIndex', 'id', { unique: false });
    console.log('IndexedDB object store "miniApps" created/upgraded');
  };

  // Success callback for database open
  dbOpenRequest.onsuccess = (event) => {
    const db = event.target.result;
    // Start readwrite transaction
    const transaction = db.transaction('miniApps', 'readwrite');
    const miniAppStore = transaction.objectStore('miniApps');

    console.log('Crawled nicknames:', window.nickName);
    console.log('Crawled data count:', window.nickName.length);

    // Store each mini-program data (nickname + description)
    for (let i = 0; i < window.nickName.length; i++) {
      const miniAppData = {
        id: i,
        nickName: window.nickName[i],
        description: window.description[i] || '' // Avoid undefined if no description
      };
      console.log('Storing data:', miniAppData);
      miniAppStore.add(miniAppData);
    }

    // Transaction completion callback
    transaction.oncomplete = () => {
      db.close();
      console.log('All data stored successfully. IndexedDB closed.');
    };

    // Transaction error callback
    transaction.onerror = (event) => {
      console.error('Error storing data:', event.target.errorCode);
    };
  };

  // Database open error callback
  dbOpenRequest.onerror = (event) => {
    console.error('Failed to open IndexedDB:', event.target.errorCode);
  };

}, 82000 * window.round + 50000);