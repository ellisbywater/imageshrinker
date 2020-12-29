const {app, BrowserWindow, Menu } = require('electron')

// Set environment
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production'
const isDarwin = process.platform === "darwin"

let mainWindow
let aboutWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 800 : 500,
        height: 600,
        icon: './app/assets/icons/Icon_256x256.png',
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true
        }
    })
    if(isDev)
        mainWindow.webContents.openDevTools()

    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon: './app/assets/icons/Icon_256x256.png'
    })
    aboutWindow.loadFile('./app/about.html')
}


app.whenReady().then(() => {
    createMainWindow()
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    mainWindow.on('ready', () => mainWindow = null)
})

const menu = [
    ...(isDarwin ? [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow()
                }
            ]
        }
    ]: [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow()
                }
            ]
        }
    ]),
    {
        role: 'fileMenu'
    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                { type: 'separator'},
                {role: 'toggleDevTools'}
            ]
        }
    ]: [])
]

app.on('window-all-closed', () => {
    if (!isDarwin) {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})
