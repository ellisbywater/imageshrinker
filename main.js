const path = require('path')
const os = require('os')
const {app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const imagemin = require('imagemin')
const imageminPng = require('imagemin-pngquant')
const imageminJpeg = require('imagemin-mozjpeg')
const slash = require("slash");
const elog = require("electron-log")

// Set environment
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production'
const isDarwin = process.platform === "darwin"

const publicAssets = path.join(__dirname, path.dirname('./app/assets'))

let mainWindow
let aboutWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 800 : 500,
        height: 600,
        icon: publicAssets + 'icons/Icon_256x256.png',
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
                    label: 'About'
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

ipcMain.on('image:minimize', (e, args) => {
    args.dest = path.join(os.homedir(), 'imageshrink')
    shrinkImage(args)
})

async function shrinkImage({imgPath, quality, dest}) {
    try {
        let pngQuality = quality / 100
        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminJpeg({ quality }),
                imageminPng({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })
        elog.info(files)
        await shell.openPath(dest)
        mainWindow.webContents.send('image:done')
    } catch (e) {
        console.log(e)
        elog.error(e)
    }
}
