const settings = require('electron-settings')

const windowStateKeeper = async (windowName) => {
    let window, windowState;

    const setBounds = async () => {
        // Restore from appConfig
        if (await settings.has(`windowState.${windowName}`)) {
            windowState = await settings.get(`windowState.${windowName}`);
            console.log(`setBounds`, windowState)
            return;
        }

        // const size = screen.getPrimaryDisplay().workAreaSize;

        // Default
        windowState = {
            x: undefined,
            y: undefined,
            // width: size.width / 2,
            // height: size.height / 2,
            height: 480,
            width: 320,
            maxWidth: 320,
        };
    };

    const saveState = async () => {
        // bug: lots of save state events are called. they should be debounced
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        console.log(`windowState`, windowState)
        await settings.set(`windowState.${windowName}`, windowState);
    };

    const track = async (win) => {
        window = win;
        ['resize', 'move', 'close'].forEach((event) => {
            win.on(event, saveState);
        });
    };

    await setBounds();

    return {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track,
    };
};

module.exports = { windowStateKeeper }