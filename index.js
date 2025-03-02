// include the Node.js 'path' module at the top of your file
const path = require('path')
const { app, BrowserWindow, Menu, nativeImage, session, Tray } = require('electron')
const { windowStateKeeper } = require("./stateKeeper")
// const isDevelopment = process.env.NODE_ENV !== "production";
const isDevelopment = require("electron-is-dev");
const { readFileSync, writeFileSync, existsSync } = require('fs');

// const iconPath = isDevelopment ? path.join('assets', 'icon.png') : path.resolve(app.getAppPath(), 'assets', 'icon.png');
const iconPath = path.join(
    isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
    "icon.ico"
)
console.log(`iconPath: ${iconPath}`)
 
// Calendar view URLs
const CALENDAR_BASE_URL = 'https://calendar.google.com/calendar/u/0/r'
const CALENDAR_VIEWS = {
    AGENDA: `${CALENDAR_BASE_URL}/agenda`,
    DAY: `${CALENDAR_BASE_URL}/day`,
    WEEK: `${CALENDAR_BASE_URL}/week`,
    MONTH: `${CALENDAR_BASE_URL}/month`,
    YEAR: `${CALENDAR_BASE_URL}/year`
}
const DEFAULT_VIEW = 'AGENDA';
const GOOGLE_ACCOUNTS = `https://accounts.google.com`
let cssInjected = false;
let cssContent = '';

// Function to detect calendar view from URL
const detectViewFromUrl = (url) => {
    if (!url || !url.includes('calendar.google.com')) return null;
    
    if (url.includes('/agenda')) return 'AGENDA';
    if (url.includes('/day')) return 'DAY';
    if (url.includes('/week')) return 'WEEK';
    if (url.includes('/month')) return 'MONTH';
    if (url.includes('/year')) return 'YEAR';
    
    return null;
};

// Function to save the last selected view
const saveLastView = (view) => {
    try {
        const prefsPath = path.join(
            isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
            "preferences.json"
        );
        
        // Read existing preferences or create new ones
        let preferences = {};
        if (existsSync(prefsPath)) {
            try {
                const prefsContent = readFileSync(prefsPath).toString();
                preferences = JSON.parse(prefsContent);
                
                // If the view hasn't changed, don't write to the file
                if (preferences.lastView === view) {
                    console.log(`Last view already set to ${view}, skipping save`);
                    return;
                }
            } catch (error) {
                console.log(`Error reading preferences: ${error}`);
            }
        }
        
        // Update the last view
        preferences.lastView = view;
        
        // Save the preferences
        writeFileSync(prefsPath, JSON.stringify(preferences, null, 2));
        console.log(`Saved last view: ${view}`);
    } catch (error) {
        console.log(`Error saving last view: ${error}`);
    }
};

// Function to get the last selected view
const getLastView = () => {
    try {
        const prefsPath = path.join(
            isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
            "preferences.json"
        );
        
        if (existsSync(prefsPath)) {
            const prefsContent = readFileSync(prefsPath).toString();
            const preferences = JSON.parse(prefsContent);
            if (preferences.lastView && CALENDAR_VIEWS[preferences.lastView]) {
                console.log(`Loaded last view: ${preferences.lastView}`);
                return preferences.lastView;
            }
        }
    } catch (error) {
        console.log(`Error loading last view: ${error}`);
    }
    
    return DEFAULT_VIEW;
};

// Load CSS content once at startup
const loadCssContent = () => {
    const stylesPath = path.join(
        isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
        "styles.css"
    )
    cssContent = readFileSync(stylesPath).toString()
    console.log(`CSS Content Loaded`)
}

const setHomeCss = (mainWindow) => {
    if (!cssContent) {
        loadCssContent();
    }
    
    // Get the current URL to determine which view we're in
    mainWindow.webContents.executeJavaScript(`window.location.href`).then(url => {
        console.log(`Current URL for CSS application: ${url}`);
        
        // Determine which view we're in
        let currentView = 'unknown';
        if (url.includes('/agenda')) currentView = 'agenda';
        if (url.includes('/day')) currentView = 'day';
        if (url.includes('/week')) currentView = 'week';
        if (url.includes('/month')) currentView = 'month';
        if (url.includes('/year')) currentView = 'year';
        
        console.log(`Detected view for CSS: ${currentView}`);
        
        // Remove any previously injected CSS
        if (cssInjected) {
            try {
                mainWindow.webContents.removeInsertedCSS(cssContent);
                console.log(`Previous CSS removed`);
            } catch (error) {
                console.log(`Error removing CSS: ${error}`);
            }
            cssInjected = false;
        }
        
        // Insert CSS - use robust CSS if available, otherwise use original CSS
        let cssToApply = cssContent;
        
        // In development mode, we can try to use the robust CSS
        if (isDevelopment) {
            try {
                const robustStylesPath = path.join(process.cwd(), "/resources/robust-styles.css");
                const robustCss = readFileSync(robustStylesPath).toString();
                if (robustCss) {
                    cssToApply = robustCss;
                    console.log('Using robust CSS');
                }
            } catch (error) {
                console.log('Robust CSS not available, using original CSS');
            }
        }
        
        // Add view-specific CSS
        cssToApply += `
        /* View-specific overrides for ${currentView} view */
        body {
            overflow: auto !important;
        }
        
        /* Ensure proper sizing for all views */
        body, html {
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
        }
        
        /* Hide unnecessary elements */
        .gb_Cd, .gb_Zd, .gb_xd, .gb_Kd, .gb_Qe, .gb_3c, .gb_J, .gb_cd, .gb_0, .gb_Kd, 
        .gb_Wa, .gb_Mf, .gb_H, .gb_3a, .gb_4a, .gb_Od, .gb_Ic, .gb_Sd, .gb_z, .gb_cd, 
        .gb_Mf, .gb_0, .gb_D, .gb_jb, .gb_Mf, .gb_0, .gb_B, .gb_Za, .gb_0, .gb_P, .gbii, 
        .gb_Q, .gb_R, .gb_Ka, .gb_La, .gb_Na {
            display: none !important;
        }
        `;
        
        // Add specific overrides based on the current view
        if (currentView === 'month') {
            cssToApply += `
            /* Month view specific overrides */
            table {
                table-layout: fixed !important;
                width: 100% !important;
                border-collapse: collapse !important;
            }
            
            td {
                border: 1px solid rgba(0, 0, 0, 0.12) !important;
                padding: 2px !important;
                vertical-align: top !important;
                height: auto !important;
                min-height: 40px !important;
            }
            
            th {
                text-align: center !important;
                padding: 4px 0 !important;
                font-weight: bold !important;
                font-size: 12px !important;
                width: 14.28% !important;
                max-width: 14.28% !important;
                overflow: hidden !important;
                white-space: nowrap !important;
                text-overflow: ellipsis !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
            }
            
            /* Show abbreviated day names */
            th span.abbr, th span.short {
                display: block !important;
                visibility: visible !important;
                font-size: 12px !important;
                font-weight: bold !important;
                text-align: center !important;
            }
            
            /* Fix day name row in alternative layout */
            div[role="row"].wuX2hf {
                height: auto !important;
                min-height: 24px !important;
                max-height: 30px !important;
                display: flex !important;
                justify-content: space-between !important;
                width: 100% !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
            }
            
            div[role="columnheader"] {
                width: 14.28% !important;
                max-width: 14.28% !important;
                text-align: center !important;
                padding: 4px 0 !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }
            
            /* Show abbreviated day names in div-based layout */
            div[role="columnheader"] .EeuFAf {
                display: block !important;
                font-size: 12px !important;
                text-align: center !important;
                font-weight: bold !important;
                padding: 0 !important;
                margin: 0 !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* For the specific layout in the screenshot */
            tr:first-child td, tr:first-child th {
                text-align: center !important;
                font-weight: bold !important;
                font-size: 12px !important;
                padding: 4px 0 !important;
                height: 24px !important;
                min-height: 24px !important;
                max-height: 30px !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
            }
            
            /* Fix event colors */
            [data-gcw-event], .NlL62b {
                border-radius: 4px !important;
                padding: 2px 4px !important;
                margin: 1px 0 !important;
                background-color: transparent !important;
                border: 1px solid currentColor !important;
                color: inherit !important;
            }
            
            /* Make all calendar events transparent */
            .g3dbUc, .NlL62b, .Jmftzc, [data-eventid], [data-chip], div[data-eventid], 
            div[data-chip], div[jslog], div[jscontroller="L7wjp"] {
                background-color: transparent !important;
                border: 1px solid rgba(0, 0, 0, 0.3) !important;
                color: inherit !important;
            }
            
            /* Fix create button */
            div[role="button"][aria-label="Create"], 
            button.E9bth-BIzmGd[jsname="todz4c"] {
                border-radius: 20px !important;
                padding: 8px 16px !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: transparent !important;
                border: 1px solid rgba(0, 0, 0, 0.12) !important;
                color: inherit !important;
                font-weight: 500 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: background-color 0.2s, box-shadow 0.2s !important;
            }
            
            div[role="button"][aria-label="Create"]:hover,
            button.E9bth-BIzmGd[jsname="todz4c"]:hover {
                background-color: rgba(0, 0, 0, 0.04) !important;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* Style the "+" icon in the create button */
            .E9bth-Q0XOV i, 
            div[role="button"][aria-label="Create"] i {
                margin-right: 4px !important;
                font-size: 18px !important;
            }
            
            /* Style the text in the create button */
            .E9bth-nBWOSb, 
            div[role="button"][aria-label="Create"] span {
                font-size: 14px !important;
                font-weight: 500 !important;
            }
            `;
        } else if (currentView === 'week') {
            cssToApply += `
            /* Week view specific overrides */
            div[role="row"].wuX2hf {
                height: auto !important;
                min-height: 24px !important;
                max-height: 30px !important;
                display: flex !important;
                justify-content: space-between !important;
                width: 100% !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
            }
            
            div[role="columnheader"] {
                width: 14.28% !important;
                max-width: 14.28% !important;
                text-align: center !important;
                padding: 4px 0 !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }
            
            /* Show abbreviated day names */
            div[role="columnheader"] .EeuFAf {
                display: block !important;
                font-size: 12px !important;
                text-align: center !important;
                font-weight: bold !important;
                padding: 0 !important;
                margin: 0 !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Fix event colors */
            [data-gcw-event], .NlL62b {
                border-radius: 4px !important;
                padding: 2px 4px !important;
                margin: 1px 0 !important;
                background-color: transparent !important;
                border: 1px solid currentColor !important;
                color: inherit !important;
            }
            
            /* Fix create button */
            div[role="button"][aria-label="Create"],
            button.E9bth-BIzmGd[jsname="todz4c"] {
                border-radius: 20px !important;
                padding: 8px 16px !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
                background: transparent !important;
                border: 1px solid rgba(0, 0, 0, 0.12) !important;
                color: inherit !important;
                font-weight: 500 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: background-color 0.2s, box-shadow 0.2s !important;
            }
            
            div[role="button"][aria-label="Create"]:hover,
            button.E9bth-BIzmGd[jsname="todz4c"]:hover {
                background-color: rgba(0, 0, 0, 0.04) !important;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* Style the "+" icon in the create button */
            .E9bth-Q0XOV i, 
            div[role="button"][aria-label="Create"] i {
                margin-right: 4px !important;
                font-size: 18px !important;
            }
            
            /* Style the text in the create button */
            .E9bth-nBWOSb, 
            div[role="button"][aria-label="Create"] span {
                font-size: 14px !important;
                font-weight: 500 !important;
            }
            `;
        }
        
        mainWindow.webContents.insertCSS(cssToApply).then(key => {
            cssInjected = true;
            console.log(`CSS Applied Successfully for ${currentView} view`);
        }).catch(err => {
            console.log(`Error applying CSS: ${err}`);
        });
    }).catch(err => {
        console.log(`Error getting current URL: ${err}`);
        
        // Fallback to applying CSS without view detection
        // Remove any previously injected CSS
        if (cssInjected) {
            try {
                mainWindow.webContents.removeInsertedCSS(cssContent);
                console.log(`Previous CSS removed (fallback)`);
            } catch (error) {
                console.log(`Error removing CSS: ${error}`);
            }
            cssInjected = false;
        }
        
        // Insert CSS - use robust CSS if available, otherwise use original CSS
        let cssToApply = cssContent;
        
        // In development mode, we can try to use the robust CSS
        if (isDevelopment) {
            try {
                const robustStylesPath = path.join(process.cwd(), "/resources/robust-styles.css");
                const robustCss = readFileSync(robustStylesPath).toString();
                if (robustCss) {
                    cssToApply = robustCss;
                    console.log('Using robust CSS (fallback)');
                }
            } catch (error) {
                console.log('Robust CSS not available, using original CSS (fallback)');
            }
        }
        
        mainWindow.webContents.insertCSS(cssToApply).then(key => {
            cssInjected = true;
            console.log(`CSS Applied Successfully (fallback)`);
        }).catch(err => {
            console.log(`Error applying CSS: ${err}`);
        });
    });
}

// Function to inject a script that adds data attributes to elements
const injectAttributeScript = (mainWindow) => {
    mainWindow.webContents.executeJavaScript(`
        // Function to add data attributes to elements based on their roles and functions
        function addDataAttributes() {
            // Add a helper function to safely query elements
            function querySelectorAllSafe(selector) {
                try {
                    return document.querySelectorAll(selector);
                } catch (e) {
                    console.log('Error querying: ' + selector, e);
                    return [];
                }
            }
            
            // Detect which calendar view we're in
            function detectCalendarView() {
                const url = window.location.href;
                if (url.includes('/agenda')) return 'agenda';
                if (url.includes('/day')) return 'day';
                if (url.includes('/week')) return 'week';
                if (url.includes('/month')) return 'month';
                if (url.includes('/year')) return 'year';
                return 'unknown';
            }
            
            const currentView = detectCalendarView();
            console.log('GCW: Detected calendar view: ' + currentView);
            document.body.setAttribute('data-gcw-view', currentView);
            
            // Hide unnecessary elements
            const unnecessaryElements = document.querySelectorAll('.gb_Cd, .gb_Zd, .gb_xd, .gb_Kd, .gb_Qe, .gb_3c, .gb_J, .gb_cd, .gb_0, .gb_Kd, .gb_Wa, .gb_Mf, .gb_H, .gb_3a, .gb_4a, .gb_Od, .gb_Ic, .gb_Sd, .gb_z, .gb_cd, .gb_Mf, .gb_0, .gb_D, .gb_jb, .gb_Mf, .gb_0, .gb_B, .gb_Za, .gb_0, .gb_P, .gbii, .gb_Q, .gb_R, .gb_Ka, .gb_La, .gb_Na');
            unnecessaryElements.forEach(el => {
                el.style.display = 'none';
            });
            
            // Apply view-specific fixes immediately
            if (currentView === 'month') {
                // Fix the month view layout
                fixMonthView();
            } else if (currentView === 'week') {
                // Fix the week view layout
                fixWeekView();
            }
            
            // Make all calendar events transparent
            makeEventsTransparent();
            
            // Fix the create button
            querySelectorAllSafe('div[role="button"][aria-label="Create"], button.E9bth-BIzmGd[jsname="todz4c"]').forEach(el => {
                el.setAttribute('data-gcw-create-button', 'true');
                // Restore proper styling
                el.style.borderRadius = '24px';
                el.style.padding = '8px 16px';
                el.style.fontWeight = '500';
                el.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                el.style.backgroundColor = 'transparent';
                el.style.border = '1px solid rgba(0, 0, 0, 0.12)';
                el.style.color = 'inherit';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                
                // Add hover effect with event listeners
                el.addEventListener('mouseenter', () => {
                    el.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                    el.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
                });
                
                el.addEventListener('mouseleave', () => {
                    el.style.backgroundColor = 'transparent';
                    el.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                });
                
                // Style the icon if present
                const icon = el.querySelector('.E9bth-Q0XOV i, i');
                if (icon) {
                    icon.style.marginRight = '4px';
                    icon.style.fontSize = '18px';
                }
                
                // Style the text if present
                const text = el.querySelector('.E9bth-nBWOSb, span:not(.E9bth-Q0XOV)');
                if (text) {
                    text.style.fontSize = '14px';
                    text.style.fontWeight = '500';
                }
            });
            
            console.log('GCW: Data attributes added to elements for ' + currentView + ' view');
            
            // Function to make all calendar events transparent
            function makeEventsTransparent() {
                // Target all possible event elements using various selectors
                const eventSelectors = [
                    '.g3dbUc', // Month view events
                    '.NlL62b', // Common event class
                    '.Jmftzc', // Event time/title
                    '[data-eventid]', // Elements with event ID
                    '[data-chip]', // Event chips
                    'div[jslog*="20394"]', // Events with specific jslog
                    'div[jscontroller="L7wjp"]', // Events with specific controller
                    '.FAxxKc' // Another event class
                ];
                
                // Join all selectors and query for matching elements
                try {
                    const eventElements = document.querySelectorAll(eventSelectors.join(', '));
                    
                    console.log('GCW: Found ' + eventElements.length + ' event elements to make transparent');
                    
                    // Apply transparent styling to all event elements
                    eventElements.forEach(el => {
                        el.style.backgroundColor = 'transparent';
                        el.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                        el.style.color = 'inherit';
                        el.style.borderRadius = '4px';
                        el.style.padding = '2px 4px';
                        
                        // Also check for any child elements with background colors
                        const childrenWithBg = el.querySelectorAll('[style*="background"]');
                        childrenWithBg.forEach(child => {
                            child.style.backgroundColor = 'transparent';
                        });
                    });
                } catch (e) {
                    console.log('Error making events transparent:', e);
                }
            }
            
            // Function to specifically fix month view
            function fixMonthView() {
                console.log('GCW: Fixing month view layout');
                
                // Fix table layout
                document.querySelectorAll('table').forEach(table => {
                    table.style.tableLayout = 'fixed';
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                });
                
                // Fix all cells
                document.querySelectorAll('td').forEach(cell => {
                    cell.style.border = '1px solid rgba(0, 0, 0, 0.12)';
                    cell.style.padding = '2px';
                    cell.style.verticalAlign = 'top';
                    cell.style.height = 'auto';
                    cell.style.minHeight = '40px';
                });
                
                // Make all event elements transparent
                const eventSelectors = [
                    '.g3dbUc', // Month view events
                    '.NlL62b', // Common event class
                    '.Jmftzc', // Event time/title
                    '[data-eventid]', // Elements with event ID
                    '[data-chip]', // Event chips
                    'div[jslog*="20394"]', // Events with specific jslog
                    'div[jscontroller="L7wjp"]' // Events with specific controller
                ];
                
                // Join all selectors and query for matching elements
                const eventElements = document.querySelectorAll(eventSelectors.join(', '));
                
                // Apply transparent styling to all event elements
                eventElements.forEach(el => {
                    el.style.backgroundColor = 'transparent';
                    el.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                    el.style.color = 'inherit';
                    el.style.borderRadius = '4px';
                    el.style.padding = '2px 4px';
                    
                    // Also check for any child elements with background colors
                    const childrenWithBg = el.querySelectorAll('[style*="background"]');
                    childrenWithBg.forEach(child => {
                        child.style.backgroundColor = 'transparent';
                    });
                });
            }
            
            // Function to specifically fix week view
            function fixWeekView() {
                console.log('GCW: Applying week view specific fixes');
                
                // Fix the day name row in week view
                const dayNameRows = document.querySelectorAll('div[role="row"].wuX2hf');
                dayNameRows.forEach(row => {
                    row.setAttribute('data-gcw-day-name-row', 'true');
                    row.style.height = 'auto';
                    row.style.minHeight = '24px';
                    row.style.maxHeight = '30px';
                    row.style.borderBottom = '1px solid rgba(0, 0, 0, 0.12)';
                    
                    // Fix each column header in the row
                    row.querySelectorAll('[role="columnheader"]').forEach(header => {
                        header.setAttribute('data-gcw-day-header', 'true');
                        header.style.width = '14.28%'; // 1/7 of the width
                        header.style.maxWidth = '14.28%';
                        header.style.textAlign = 'center';
                        header.style.padding = '4px 0';
                        header.style.overflow = 'hidden';
                        
                        // Hide the full day name
                        const fullDayName = header.querySelector('.XuJrye');
                        if (fullDayName) {
                            fullDayName.style.display = 'none';
                        }
                        
                        // Show only the abbreviated day name
                        const shortDayName = header.querySelector('.EeuFAf');
                        if (shortDayName) {
                            shortDayName.style.display = 'block';
                            shortDayName.style.fontSize = '12px';
                            shortDayName.style.textAlign = 'center';
                            shortDayName.style.fontWeight = 'bold';
                            shortDayName.style.padding = '0';
                            shortDayName.style.margin = '0';
                            shortDayName.style.visibility = 'visible';
                            shortDayName.style.opacity = '1';
                        }
                    });
                });
            }
        }
        
        // Run immediately and then set up a mutation observer to handle dynamic content
        addDataAttributes();
        
        // Set up a mutation observer to handle dynamically added content
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                addDataAttributes();
            }
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Return true to indicate successful execution
        true;
    `).then(() => {
        console.log('Attribute script injected successfully');
    }).catch(err => {
        console.log('Error injecting attribute script:', err);
    });
}

// Generate a CSS file with data attributes instead of class names
const generateRobustCSS = () => {
    if (isDevelopment) {
        try {
            const stylesPath = path.join(process.cwd(), "/resources/styles.css");
            const robustStylesPath = path.join(process.cwd(), "/resources/robust-styles.css");
            
            // Check if robust CSS file already exists
            if (existsSync(robustStylesPath)) {
                console.log('Robust CSS file already exists, skipping generation');
                return readFileSync(robustStylesPath).toString();
            }
            
            let css = readFileSync(stylesPath).toString();
            
            // Replace class-based selectors with data attribute selectors
            const replacements = [
                // Common elements across views
                { from: 'div[role="gridcell"]', to: 'div[data-gcw-gridcell]' },
                { from: 'div[role="row"]', to: 'div[data-gcw-row]' },
                { from: 'div[role="button"]', to: 'div[data-gcw-button]' },
                { from: 'div[role="presentation"]', to: 'div[data-gcw-presentation]' },
                { from: 'button.nUt0vb', to: 'button[data-gcw-date-circle]' },
                { from: '.NlL62b', to: '[data-gcw-event]' },
                
                // Divider lines
                { from: 'div[aria-hidden="true"].uVnp9b', to: 'div[data-gcw-divider]' },
                { from: 'div[role="rowgroup"] > div[aria-hidden="true"]:not(.uVnp9b):not([data-gcw-divider])', 
                  to: 'div[role="rowgroup"] > div[aria-hidden="true"]:not([data-gcw-divider])' },
                
                // Agenda view specific
                { from: '.r4nke', to: '[data-gcw-date-section]' },
                { from: '.Jmftzc.gVNoLb', to: '[data-gcw-event-time]' },
                { from: '.Jmftzc.EiZ8Dd', to: '[data-gcw-event-title]' },
                
                // Month view specific
                { from: '.g3dbUc', to: '[data-gcw-month-event]' },
                { from: 'td.rymPhb', to: '[data-gcw-month-date-cell]' },
                
                // Year view specific
                { from: '.JPdR6b', to: '[data-gcw-year-month]' },
                
                // Navigation elements
                { from: '.d29e1c', to: '[data-gcw-nav-button]' },
                
                // View headers
                { from: '.rSoRzd', to: '[data-gcw-view-header]' },
                
                // Day names
                { from: '.yzifAd', to: '[data-gcw-day-name]' },
                { from: '[role="columnheader"]', to: '[data-gcw-day-header]' },
                { from: '.XuJrye', to: '[data-gcw-day-name-full]' },
                { from: '.EeuFAf', to: '[data-gcw-day-name-short]' },
                { from: 'div[role="row"].wuX2hf', to: '[data-gcw-day-name-row]' },
                
                // Create button
                { from: 'div[role="button"][aria-label="Create"]', to: '[data-gcw-create-button]' },
                
                // Header
                { from: 'header', to: '[data-gcw-header]' },
                
                // Grid
                { from: 'div[role="grid"]', to: '[data-gcw-grid]' }
            ];
            
            replacements.forEach(({ from, to }) => {
                // Use a more robust replacement approach
                const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedFrom, 'g');
                css = css.replace(regex, to);
            });
            
            // Add view-specific CSS
            css += `
/* Common styles for all views */
[data-gcw-create-button] {
    background-color: transparent !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    color: inherit !important;
    border-radius: 24px !important;
    padding: 8px 16px !important;
    font-weight: 500 !important;
    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15) !important;
}

[data-gcw-header] {
    padding: 8px !important;
    box-sizing: border-box !important;
}

[data-gcw-grid] {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: auto !important;
}

[data-gcw-event] {
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

/* Day name fixes for all views */
[data-gcw-day-header] {
    padding: 2px !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

[data-gcw-day-name-full] {
    display: none !important; /* Hide full day names */
}

[data-gcw-day-name-short] {
    display: block !important;
    font-size: 12px !important;
    text-align: center !important;
    font-weight: bold !important;
    padding: 4px 0 !important;
    margin: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
}

[data-gcw-day-name-row] {
    height: auto !important;
}

/* Agenda view specific styles */
body[data-gcw-view="agenda"] [data-gcw-event] {
    margin: 4px 0 !important;
    padding: 4px !important;
}

/* Day/Week view specific styles */
body[data-gcw-view="day"] [data-gcw-event],
body[data-gcw-view="week"] [data-gcw-event] {
    padding: 2px 4px !important;
    font-size: 12px !important;
    background-color: transparent !important;
    border: 1px solid currentColor !important;
}

body[data-gcw-view="day"] [data-gcw-day-name],
body[data-gcw-view="week"] [data-gcw-day-name] {
    font-size: 12px !important;
    padding: 2px 0 !important;
    text-align: center !important;
    overflow: hidden !important;
}

/* Week view specific styles */
body[data-gcw-view="week"] [data-gcw-day-header] {
    width: 14.28% !important; /* 1/7 of the width */
    max-width: 14.28% !important;
}

/* Month view specific styles */
body[data-gcw-view="month"] [data-gcw-month-date-cell] {
    padding: 2px !important;
    height: auto !important;
    min-height: 40px !important;
}

body[data-gcw-view="month"] [data-gcw-month-event] {
    font-size: 11px !important;
    line-height: 16px !important;
    padding: 0 4px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    background-color: transparent !important;
    border: 1px solid rgba(0, 0, 0, 0.3) !important;
    color: inherit !important;
}

body[data-gcw-view="month"] table {
    table-layout: fixed !important;
    width: 100% !important;
}

/* Year view specific styles */
body[data-gcw-view="year"] [data-gcw-year-month] {
    padding: 4px !important;
    margin: 2px !important;
}
`;
            
            writeFileSync(robustStylesPath, css);
            console.log('Generated robust CSS file with view-specific styles');
            
            return css;
        } catch (error) {
            console.log('Error generating robust CSS:', error);
            return null;
        }
    }
    return null;
}

// Function to specifically check and fix divider lines
const fixDividerLines = (mainWindow) => {
    mainWindow.webContents.executeJavaScript(`
        // Function to ensure divider lines are visible
        function fixDividerLines() {
            // Detect which calendar view we're in
            function detectCalendarView() {
                const url = window.location.href;
                if (url.includes('/agenda')) return 'agenda';
                if (url.includes('/day')) return 'day';
                if (url.includes('/week')) return 'week';
                if (url.includes('/month')) return 'month';
                if (url.includes('/year')) return 'year';
                return 'unknown';
            }
            
            const currentView = detectCalendarView();
            
            // Target the specific divider lines by class
            const dividers = document.querySelectorAll('div[aria-hidden="true"].uVnp9b');
            
            if (dividers.length > 0) {
                console.log('GCW: Found ' + dividers.length + ' divider lines to fix in ' + currentView + ' view');
                
                dividers.forEach(divider => {
                    // Ensure the divider is visible by directly setting styles
                    divider.style.display = 'block';
                    divider.style.height = '1px';
                    divider.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
                    divider.style.margin = '0';
                    divider.style.width = '100%';
                    divider.setAttribute('data-gcw-fixed', 'true');
                });
            }
            
            // Fix the create button
            const createButtons = document.querySelectorAll('div[role="button"][aria-label="Create"], button.E9bth-BIzmGd[jsname="todz4c"]');
            if (createButtons.length > 0) {
                console.log('GCW: Found ' + createButtons.length + ' create buttons to fix');
                
                createButtons.forEach(button => {
                    button.style.borderRadius = '24px';
                    button.style.padding = '8px 16px';
                    button.style.fontWeight = '500';
                    button.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                    button.style.backgroundColor = 'transparent';
                    button.style.border = '1px solid rgba(0, 0, 0, 0.12)';
                    button.style.color = 'inherit';
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    
                    // Style the icon if present
                    const icon = button.querySelector('.E9bth-Q0XOV i, i');
                    if (icon) {
                        icon.style.marginRight = '4px';
                        icon.style.fontSize = '18px';
                    }
                    
                    // Style the text if present
                    const text = button.querySelector('.E9bth-nBWOSb, span:not(.E9bth-Q0XOV)');
                    if (text) {
                        text.style.fontSize = '14px';
                        text.style.fontWeight = '500';
                    }
                });
            }
            
            // Make all event elements transparent
            makeEventsTransparent();
            
            // Apply view-specific fixes
            if (currentView === 'month') {
                fixMonthView();
                return true;
            } else if (currentView === 'week') {
                fixWeekView();
                return true;
            } else if (currentView === 'year') {
                fixYearView();
                return true;
            }
            
            return dividers.length > 0;
            
            // Function to make all calendar events transparent
            function makeEventsTransparent() {
                // Target all possible event elements using various selectors
                const eventSelectors = [
                    '.g3dbUc', // Month view events
                    '.NlL62b', // Common event class
                    '.Jmftzc', // Event time/title
                    '[data-eventid]', // Elements with event ID
                    '[data-chip]', // Event chips
                    'div[jslog*="20394"]', // Events with specific jslog
                    'div[jscontroller="L7wjp"]', // Events with specific controller
                    '.FAxxKc' // Another event class
                ];
                
                // Join all selectors and query for matching elements
                try {
                    const eventElements = document.querySelectorAll(eventSelectors.join(', '));
                    
                    console.log('GCW: Found ' + eventElements.length + ' event elements to make transparent');
                    
                    // Apply transparent styling to all event elements
                    eventElements.forEach(el => {
                        el.style.backgroundColor = 'transparent';
                        el.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                        el.style.color = 'inherit';
                        el.style.borderRadius = '4px';
                        el.style.padding = '2px 4px';
                        
                        // Also check for any child elements with background colors
                        const childrenWithBg = el.querySelectorAll('[style*="background"]');
                        childrenWithBg.forEach(child => {
                            child.style.backgroundColor = 'transparent';
                        });
                    });
                } catch (e) {
                    console.log('Error making events transparent:', e);
                }
            }
            
            // Function to fix month view
            function fixMonthView() {
                console.log('GCW: Fixing month view layout');
                
                // Fix table layout
                document.querySelectorAll('table').forEach(table => {
                    table.style.tableLayout = 'fixed';
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                });
                
                // Fix all cells
                document.querySelectorAll('td').forEach(cell => {
                    cell.style.border = '1px solid rgba(0, 0, 0, 0.12)';
                    cell.style.padding = '2px';
                    cell.style.verticalAlign = 'top';
                    cell.style.height = 'auto';
                    cell.style.minHeight = '40px';
                });
                
                // Make all event elements transparent
                const eventSelectors = [
                    '.g3dbUc', // Month view events
                    '.NlL62b', // Common event class
                    '.Jmftzc', // Event time/title
                    '[data-eventid]', // Elements with event ID
                    '[data-chip]', // Event chips
                    'div[jslog*="20394"]', // Events with specific jslog
                    'div[jscontroller="L7wjp"]' // Events with specific controller
                ];
                
                // Join all selectors and query for matching elements
                const eventElements = document.querySelectorAll(eventSelectors.join(', '));
                
                // Apply transparent styling to all event elements
                eventElements.forEach(el => {
                    el.style.backgroundColor = 'transparent';
                    el.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                    el.style.color = 'inherit';
                    el.style.borderRadius = '4px';
                    el.style.padding = '2px 4px';
                    
                    // Also check for any child elements with background colors
                    const childrenWithBg = el.querySelectorAll('[style*="background"]');
                    childrenWithBg.forEach(child => {
                        child.style.backgroundColor = 'transparent';
                    });
                });
            }
            
            // Function to fix week view
            function fixWeekView() {
                console.log('GCW: Fixing week view layout');
                
                // Fix the day name row in week view
                const dayNameRows = document.querySelectorAll('div[role="row"].wuX2hf');
                dayNameRows.forEach(row => {
                    row.setAttribute('data-gcw-day-name-row', 'true');
                    row.style.height = 'auto';
                    row.style.minHeight = '24px';
                    row.style.maxHeight = '30px';
                    row.style.borderBottom = '1px solid rgba(0, 0, 0, 0.12)';
                    
                    // Fix each column header in the row
                    row.querySelectorAll('[role="columnheader"]').forEach(header => {
                        header.setAttribute('data-gcw-day-header', 'true');
                        header.style.width = '14.28%'; // 1/7 of the width
                        header.style.maxWidth = '14.28%';
                        header.style.textAlign = 'center';
                        header.style.padding = '4px 0';
                        header.style.overflow = 'hidden';
                        
                        // Hide the full day name
                        const fullDayName = header.querySelector('.XuJrye');
                        if (fullDayName) {
                            fullDayName.style.display = 'none';
                        }
                        
                        // Show only the abbreviated day name
                        const shortDayName = header.querySelector('.EeuFAf');
                        if (shortDayName) {
                            shortDayName.style.display = 'block';
                            shortDayName.style.fontSize = '12px';
                            shortDayName.style.textAlign = 'center';
                            shortDayName.style.fontWeight = 'bold';
                            shortDayName.style.padding = '0';
                            shortDayName.style.margin = '0';
                            shortDayName.style.visibility = 'visible';
                            shortDayName.style.opacity = '1';
                        }
                    });
                });
            }
            
            // Function to fix year view
            function fixYearView() {
                console.log('GCW: Fixing year view layout');
                
                const monthContainers = document.querySelectorAll('[data-gcw-year-month]');
                if (monthContainers.length > 0) {
                    monthContainers.forEach(container => {
                        container.style.border = '1px solid rgba(0, 0, 0, 0.12)';
                        container.style.borderRadius = '4px';
                        container.style.margin = '4px';
                        container.style.padding = '4px';
                    });
                    
                    return true;
                }
                
                return false;
            }
        }
        
        // Run immediately
        const result = fixDividerLines();
        
        // Set up a periodic check for divider lines and view-specific fixes
        setInterval(fixDividerLines, 2000);
        
        // Return result
        result;
    `).then((result) => {
        if (result) {
            console.log('View-specific fixes applied successfully');
        } else {
            console.log('No view-specific fixes needed');
        }
    }).catch(err => {
        console.log('Error applying view-specific fixes:', err);
    });
}

// modify your existing createWindow() function
const createWindow = () => {
    // Load CSS content at startup
    loadCssContent();
    
    // Generate robust CSS in development mode
    if (isDevelopment) {
        generateRobustCSS();
    }
    
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 400,

        maximizable: true,
        minimizable: true,
        icon: iconPath,

        skipTaskbar: !isDevelopment,
        alwaysOnTop: !isDevelopment, // Only set alwaysOnTop in production mode
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    // Load the last selected view or default to AGENDA
    const lastView = getLastView();
    mainWindow.loadURL(CALENDAR_VIEWS[lastView]);
    
    // Handle new window/link clicks
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        mainWindow.loadURL(url)
        return { action: 'deny' };
    });

    // Listen for navigation events
    mainWindow.webContents.on("will-navigate", (e, url) => {
        console.log(`will-navigate to: ${url}`)
        
        // Save the view if navigating to a calendar view
        const view = detectViewFromUrl(url);
        if (view) {
            saveLastView(view);
        }
    })
    
    // Listen for when page starts loading
    mainWindow.webContents.on("did-start-loading", () => {
        console.log(`Page started loading`)
    })
    
    // Listen for when page finishes loading
    mainWindow.webContents.on("did-finish-load", () => {
        const currentURL = mainWindow.webContents.getURL();
        console.log(`Page finished loading: ${currentURL}`)
        
        // Save the current view if it's a calendar view
        if (currentURL.includes('calendar.google.com')) {
            const view = detectViewFromUrl(currentURL);
            if (view) {
                saveLastView(view);
            }
            
            // First inject the attribute script
            injectAttributeScript(mainWindow);
            
            // Then apply CSS with a small delay
            setTimeout(() => {
                setHomeCss(mainWindow);
                
                // Specifically fix divider lines
                setTimeout(() => {
                    fixDividerLines(mainWindow);
                }, 1000);
            }, 500);
        }
    })
    
    // Listen for redirect navigation events (for OAuth)
    mainWindow.webContents.on("did-redirect-navigation", (e, url) => {
        console.log(`Redirected to: ${url}`)
        
        // Save the view if redirected to a calendar view
        const view = detectViewFromUrl(url);
        if (view) {
            saveLastView(view);
        }
    })
    
    // Apply CSS initially
    setHomeCss(mainWindow)
    
    windowStateKeeper('main')
        .then((mwk) => {
            if (mwk) {
                const { x, y, width, height } = mwk;
                if (x !== undefined && y !== undefined && width && height) {
                    mainWindow.setBounds({ x, y, width, height });
                }
                mwk.track(mainWindow);
            }
        })
        .catch((e) => {
            console.log(`Error in windowStateKeeper:`, e);
        });

    if (isDevelopment) {
        mainWindow.webContents.openDevTools({ mode: "undocked" });
    }
    else {
        mainWindow.setMenu(null)
        app.setLoginItemSettings({
            openAtLogin: true,
        });
    }

    const isSingleInstance = app.requestSingleInstanceLock()

    if (!isSingleInstance) {
        app.quit()
        mainWindow.focus()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }

    createTray(mainWindow)
}

const createTray = (mainWindow) => {
    // Load your tray icon image
    const trayIcon = nativeImage.createFromPath(iconPath);

    // Create the tray
    const tray = new Tray(trayIcon);

    // Create a context menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Calendar Views', submenu: [
                {
                    label: 'Agenda', click: () => {
                        mainWindow.loadURL(CALENDAR_VIEWS.AGENDA);
                        saveLastView('AGENDA');
                    }
                },
                // {
                //     label: 'Day', click: () => {
                //         mainWindow.loadURL(CALENDAR_VIEWS.DAY);
                //         saveLastView('DAY');
                //     }
                // },
                // {
                //     label: 'Week', click: () => {
                //         mainWindow.loadURL(CALENDAR_VIEWS.WEEK);
                //         saveLastView('WEEK');
                //     }
                // },
                {
                    label: 'Month', click: () => {
                        mainWindow.loadURL(CALENDAR_VIEWS.MONTH);
                        saveLastView('MONTH');
                    }
                },
                {
                    label: 'Year', click: () => {
                        mainWindow.loadURL(CALENDAR_VIEWS.YEAR);
                        saveLastView('YEAR');
                    }
                }
            ]
        },
        { type: 'separator' },
        {
            label: 'Reload', click: () => {
                mainWindow.reload();
                // Wait for reload to complete before applying CSS
                // The did-finish-load event will handle reapplying CSS
            }
        },
        {
            label: 'Logout', click: () => {
                session.defaultSession.clearStorageData()
                mainWindow.loadURL(CALENDAR_VIEWS.AGENDA)
            }
        },
        {
            label: 'Quit', click: () => {
                app.quit()
            }
        }
    ]);

    // Set the context menu for the tray
    tray.setContextMenu(contextMenu);

    // Add a tooltip (optional)
    tray.setToolTip('Google Calendar Widget');
    tray.setTitle("GCW")

    // Show the tray icon
    tray.on('click', () => {
        mainWindow.show();
    });

    console.log(`Tray icon added`)
};

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});