// include the Node.js 'path' module at the top of your file
const path = require('path')
const { app, BrowserWindow, Menu, nativeImage, session, Tray } = require('electron')
const { windowStateKeeper } = require("./stateKeeper")
// const isDevelopment = process.env.NODE_ENV !== "production";
const isDevelopment = require("electron-is-dev");
const { readFileSync } = require('fs');

// const iconPath = isDevelopment ? path.join('assets', 'icon.png') : path.resolve(app.getAppPath(), 'assets', 'icon.png');
const iconPath = path.join(
    isDevelopment ? process.cwd() + "/resources" : process.resourcesPath,
    "media",
    "icon.ico"
)
console.log(`iconPath: ${iconPath}`)

// const CALENDER_PC = `https://calendar.google.com/calendar/u/0/r`
const CALENDER_MOBILE = `https://calendar.google.com/calendar/u/0/gp?hl=en#~calendar:view=a`

// modify your existing createWindow() function
const createWindow = () => {
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

    mainWindow.loadURL(CALENDER_MOBILE);
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        mainWindow.loadURL(url)
        return { action: 'deny' };
    });

    mainWindow.webContents.on("will-navigate", (e, url) => {
        console.log(`will-navigate`, url)
        if (url.includes(`https://accounts.google.com/CheckCookie`)) { 
            setTimeout(() => {
                mainWindow.loadURL(CALENDER_MOBILE)
            }, 1500)
        }
    })

    const styles = readFileSync(`./styles.css`).toString()
    mainWindow.webContents.insertCSS(styles)

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
                mainWindow.reload()
            }
        },
        {
            label: 'Logout', click: () => {
                session.defaultSession.clearStorageData()
                    .then(() => {
                        mainWindow.loadURL(CALENDER_MOBILE)
                    })
                    .catch((e) => {
                        console.log(`clearStorageData`, e)
                    })
            }
        },
        {
            label: 'Exit', click: () => {
                app.quit()
            }
        }
    ]);

    // Set the context menu for the tray
    tray.setContextMenu(contextMenu);

    // Add a tooltip (optional)
    tray.setToolTip('GCW');
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