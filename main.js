const path = require('path');
const url = require('url');
const {app,BrowserWindow,ipcMain,Tray,electron,Menu,dialog,webContents} = require('electron');
const {create} = require('domain');
const { autoUpdater } = require('electron-updater');
const APP_VERSION = require('./package.json').version;
let win;
let margin_x = 0;
let margin_y = 0;
let width = 615;
let height = 620;



function calculateWindowPosition() {
    const screenBounds = win.getBounds();
    const trayBounds = tray.getBounds();

    let trayPos = 4;
    trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
    trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

    let DEFAULT_MARGIN = {
        x: margin_x,
        y: margin_y
    };

    switch (trayPos) {
        case 1:
            x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
            y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
            break;

        case 2:
            x = Math.floor(
                trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2
            );
            y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
            break;

        case 3:
            x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
            y = Math.floor(
                trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2
            );
            break;

        case 4:
            x = Math.floor(
                trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2
            );
            y = Math.floor(
                trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2
            );
            break;
    }

    return {
        x: x + 200,
        y: y - 20
    };
}
let contextMenu = Menu.buildFromTemplate([{
    label: 'Закрыть Falcon',
    click() {
        app.quit();
    }
}])
const createTray = () => {
    tray = new Tray(__dirname + '/src/img/rocket.ico');
    tray.setContextMenu(contextMenu);
    tray.on('click', function(event) {
        toggleWindow()
    });
    tray.on('right-click', function(event) {
        app.quit();
    });
}

function createWindow() {
    win = new BrowserWindow({
        width: width,
        height: height,
        maxWidth: width,
        maxHeight: height,
        frame: false,
        fullscreenable: false,
        resizable: false,
        useContentSize: true,
        skipTaskbar: true,
        show: false,
        alwaysOnTop: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        icon: __dirname + '/src/img/rocket.ico'
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/src/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.on('closed', () => {
        win = null;
    });
    win.setMenu(null);
    win.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
      });
}

autoUpdater.checkForUpdates();

autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
  });
autoUpdater.on('update-not-available', arg => {
    win.webContents.send('update_not_available');
});

app.on('ready', () => {
    createTray();
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
    
});
const toggleWindow = () => {
    win.isVisible() ? win.hide() : showWindow();
}
const showWindow = () => {
    const position = calculateWindowPosition();
    win.setPosition(position.x, position.y, false);
    win.show();
}
ipcMain.on('show-window', () => {
    showWindow()
})
app.on('window-all-closed', () => {
    app.quit();
});
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', {
        version: APP_VERSION
    });
});