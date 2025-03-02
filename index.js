// include the Node.js 'path' module at the top of your file
const path = require('path')
const { app, BrowserWindow, Menu, nativeImage, session, Tray } = require('electron')
const { windowStateKeeper } = require("./stateKeeper")
// const isDevelopment = process.env.NODE_ENV !== "production";
const isDevelopment = require("electron-is-dev");
const { readFileSync, writeFileSync } = require('fs');

// const iconPath = isDevelopment ? path.join('assets', 'icon.png') : path.resolve(app.getAppPath(), 'assets', 'icon.png');
const iconPath = path.join(
    isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
    "icon.ico"
)
console.log(`iconPath: ${iconPath}`)

const CALENDER_HOME = `https://calendar.google.com/calendar/u/0/r/agenda`
const GOOGLE_ACCOUNTS = `https://accounts.google.com`
let cssInjected = false;
let cssContent = '';

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
    
    mainWindow.webContents.insertCSS(cssToApply).then(key => {
        cssInjected = true;
        console.log(`CSS Applied Successfully`);
    }).catch(err => {
        console.log(`Error applying CSS: ${err}`);
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
            
            // Add data attributes to elements based on their role
            querySelectorAllSafe('[role="gridcell"]').forEach(el => {
                el.setAttribute('data-gcw-gridcell', 'true');
            });
            
            querySelectorAllSafe('[role="row"]').forEach(el => {
                el.setAttribute('data-gcw-row', 'true');
            });
            
            querySelectorAllSafe('[role="button"]').forEach(el => {
                el.setAttribute('data-gcw-button', 'true');
            });
            
            querySelectorAllSafe('[role="presentation"]').forEach(el => {
                el.setAttribute('data-gcw-presentation', 'true');
            });
            
            // Add data attributes to date elements and ensure they're circular
            querySelectorAllSafe('button.nUt0vb').forEach(el => {
                el.setAttribute('data-gcw-date-circle', 'true');
                
                // Directly apply styles to ensure circular shape
                el.style.width = '36px';
                el.style.height = '36px';
                el.style.minWidth = '36px';
                el.style.minHeight = '36px';
                el.style.maxWidth = '36px';
                el.style.maxHeight = '36px';
                el.style.borderRadius = '50%';
                el.style.padding = '0';
                el.style.margin = '0';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.overflow = 'hidden';
                el.style.boxSizing = 'border-box';
                el.style.flexShrink = '0';
                el.style.flexGrow = '0';
                
                // Fix the date number inside
                const dateNumber = el.querySelector('.x5FT4e');
                if (dateNumber) {
                    dateNumber.style.display = 'flex';
                    dateNumber.style.alignItems = 'center';
                    dateNumber.style.justifyContent = 'center';
                    dateNumber.style.width = '100%';
                    dateNumber.style.height = '100%';
                    dateNumber.style.margin = '0';
                    dateNumber.style.padding = '0';
                    dateNumber.style.textAlign = 'center';
                }
            });
            
            // Add data attributes to event elements
            querySelectorAllSafe('.NlL62b').forEach(el => {
                el.setAttribute('data-gcw-event', 'true');
            });
            
            // Add data attributes to divider lines - more comprehensive approach
            // First, identify by class
            querySelectorAllSafe('div[aria-hidden="true"].uVnp9b').forEach(el => {
                el.setAttribute('data-gcw-divider', 'true');
                // Ensure the divider is visible by directly setting styles
                el.style.display = 'block';
                el.style.height = '1px';
                el.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
                el.style.margin = '0';
                el.style.width = '100%';
            });
            
            // Also identify by structure and appearance
            querySelectorAllSafe('div[aria-hidden="true"]').forEach(el => {
                // Check if it has the uVnp9b class
                if (el.className && el.className.includes('uVnp9b')) {
                    el.setAttribute('data-gcw-divider', 'true');
                    // Ensure the divider is visible by directly setting styles
                    el.style.display = 'block';
                    el.style.height = '1px';
                    el.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
                    el.style.margin = '0';
                    el.style.width = '100%';
                }
                // Or check if it looks like a divider (thin horizontal line)
                else if (el.offsetHeight <= 1 && el.offsetWidth > 100) {
                    const style = window.getComputedStyle(el);
                    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                        style.backgroundColor !== 'transparent') {
                        el.setAttribute('data-gcw-divider', 'true');
                        // Ensure the divider is visible by directly setting styles
                        el.style.display = 'block';
                        el.style.height = '1px';
                        el.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
                        el.style.margin = '0';
                        el.style.width = '100%';
                    }
                }
            });
            
            // Add data attributes to date headers
            querySelectorAllSafe('div[role="rowgroup"]').forEach(el => {
                const dateHeader = el.querySelector('h2, h3');
                if (dateHeader) {
                    dateHeader.setAttribute('data-gcw-date-header', 'true');
                    dateHeader.parentElement.setAttribute('data-gcw-date-section', 'true');
                }
            });
            
            // Add data attributes to event time displays
            querySelectorAllSafe('.Jmftzc').forEach(el => {
                if (el.textContent.match(/\\d+:\\d+/)) {
                    el.setAttribute('data-gcw-event-time', 'true');
                } else {
                    el.setAttribute('data-gcw-event-title', 'true');
                }
            });
            
            console.log('GCW: Data attributes added to elements');
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
            
            let css = readFileSync(stylesPath).toString();
            
            // Replace class-based selectors with data attribute selectors
            const replacements = [
                { from: 'div[role="gridcell"]', to: 'div[data-gcw-gridcell]' },
                { from: 'div[role="row"]', to: 'div[data-gcw-row]' },
                { from: 'div[role="button"]', to: 'div[data-gcw-button]' },
                { from: 'div[role="presentation"]', to: 'div[data-gcw-presentation]' },
                { from: 'button.nUt0vb', to: 'button[data-gcw-date-circle]' },
                { from: '.NlL62b', to: '[data-gcw-event]' },
                // Special handling for divider lines - use both class and data attribute
                { from: 'div[aria-hidden="true"].uVnp9b', to: 'div[data-gcw-divider]' },
                { from: 'div[role="rowgroup"] > div[aria-hidden="true"]:not(.uVnp9b):not([data-gcw-divider])', 
                  to: 'div[role="rowgroup"] > div[aria-hidden="true"]:not([data-gcw-divider])' },
                { from: '.r4nke', to: '[data-gcw-date-section]' },
                { from: '.Jmftzc.gVNoLb', to: '[data-gcw-event-time]' },
                { from: '.Jmftzc.EiZ8Dd', to: '[data-gcw-event-title]' }
            ];
            
            replacements.forEach(({ from, to }) => {
                // Use a more robust replacement approach
                const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedFrom, 'g');
                css = css.replace(regex, to);
            });
            
            writeFileSync(robustStylesPath, css);
            console.log('Generated robust CSS file');
            
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
            // Target the specific divider lines by class
            const dividers = document.querySelectorAll('div[aria-hidden="true"].uVnp9b');
            
            if (dividers.length > 0) {
                console.log('GCW: Found ' + dividers.length + ' divider lines to fix');
                
                dividers.forEach(divider => {
                    // Ensure the divider is visible by directly setting styles
                    divider.style.display = 'block';
                    divider.style.height = '1px';
                    divider.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
                    divider.style.margin = '0';
                    divider.style.width = '100%';
                    divider.setAttribute('data-gcw-fixed', 'true');
                });
                
                return true;
            } else {
                console.log('GCW: No divider lines found to fix');
                return false;
            }
        }
        
        // Run immediately
        const result = fixDividerLines();
        
        // Set up a periodic check for divider lines
        setInterval(fixDividerLines, 2000);
        
        // Return result
        result;
    `).then((result) => {
        if (result) {
            console.log('Divider lines fixed successfully');
        } else {
            console.log('No divider lines found to fix');
        }
    }).catch(err => {
        console.log('Error fixing divider lines:', err);
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
        height: 480,
        width: 320,

        maximizable: false,
        minimizable: false,
        icon: iconPath,

        skipTaskbar: !isDevelopment,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    mainWindow.loadURL(CALENDER_HOME);
    
    // Handle new window/link clicks
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        mainWindow.loadURL(url)
        return { action: 'deny' };
    });

    // Listen for navigation events
    mainWindow.webContents.on("will-navigate", (e, url) => {
        console.log(`will-navigate to: ${url}`)
    })
    
    // Listen for when page starts loading
    mainWindow.webContents.on("did-start-loading", () => {
        console.log(`Page started loading`)
    })
    
    // Listen for when page finishes loading
    mainWindow.webContents.on("did-finish-load", () => {
        const currentURL = mainWindow.webContents.getURL();
        console.log(`Page finished loading: ${currentURL}`)
        
        // Apply CSS if we're on the calendar page
        if (currentURL.includes(CALENDER_HOME) || 
            currentURL.includes('calendar.google.com')) {
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
            label: 'Reload', click: () => {
                mainWindow.reload();
                // Wait for reload to complete before applying CSS
                // The did-finish-load event will handle reapplying CSS
            }
        },
        {
            label: 'Logout', click: () => {
                session.defaultSession.clearStorageData()
                mainWindow.loadURL(CALENDER_HOME)
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