// encapulates all logic
import fs from 'fs';
import fetch from "node-fetch";
import WebSocket from 'ws';
import sleep from './helpers/sleep.js';
import localStorage from './localStorage.js';

const LocalStorageKeys = {
    KEYBOARD_CURRENT_THEME: 'KEYBOARD_CURRENT_THEME'
}

const DEV = true;
const KEYBOARD_STYLE_ID = 'steamdeck_custom_keyboard_theme';
const STEAMDECK_IP = DEV?"192.168.1.138":"127.0.0.1";
const KEYBOARD_THEME_DIR = './custom/keyboard_themes'

const getKeyboardThemes = () => {
    const KeyboardThemes = []
    fs.readdirSync(KEYBOARD_THEME_DIR).forEach(file => {
        if (file.endsWith(".css")) {
            KeyboardThemes.push(file.substring(0, file.length - ".css".length))
        }
    })
    return KeyboardThemes
}

async function getAvailableTabs() {
    let jsonRes = []
    try {
        const response = await fetch(`http://${STEAMDECK_IP}:3000/json`);
        console.log(response)
        jsonRes = response.json();
    } catch (e) {
        console.log(e)
    }
    return jsonRes
} 

const TabTitles = {
    'SP': 'MainUI',
    'Toast': 'Toast',
    'MainMenu': 'MainMenu',
    'QuickAccess': 'QuickAccess',
}

const TabEnum = {
    MainUI: 'SP',
    Toast: 'Toast',
    MainMenu: 'MainMenu',
    QuickAccess: 'QuickAccess',
}

// class Tab {
//     /**
//      * tabData:
//      * @param {string} description 
//      * @param {string} devtoolsFrontendUrl 
//      * @param {string} id
//      * @param {string} title 
//      * @param {string} type 
//      * @param {string} url 
//      * @param {string} webSocketDebuggerUrl 
//      *  
//      */
//     constructor(tabData) {
//         this.page = TabTitles[tabData.title]
//         this.data = tabData
//         this.websocketReady = false;
//         this.websocket = new WebSocket(tabData.webSocketDebuggerUrl);
//         this.websocket.on('open', () => {
//             console.log(`Websocket connected for ${this.page}`)
//             this.websocketReady = true
//         });
//         this.websocket.on('message', (m) => {
//             console.log(m.toString())
//         })

//         // on disconnect
//         // TODO will need to poll tabs till found again
//         this.websocket.on('close', () => {
//             console.log("close")
//         })
//     }
    
//     async sendCode(code) {
//         while (!this.websocketReady) {
//             console.log("waiting...")
//             await sleep(3000)   
//         }
//         this.websocket.send(JSON.stringify({
//             id: 1,
//             method: "Runtime.evaluate",
//             params: {
//                 expression: code,
//                 userGesture: true
//             }
//         }));
//     }
// }

class Tab {
    constructor(page) {
        this.page = page
        // this.connectToTab(page)        
    }

    async findTab(page) {
        let tabs = [] 
        try {
            tabs = await getAvailableTabs()
        } catch (e) {}

        let foundTab = null
        tabs.forEach(tab => {
            if (tab.title == page) {
                foundTab = tab
            }
        })
        return foundTab
    }

    async onConnect() {
    }

    // this is horrible but works for now
    async connectToTab() {
        const page = this.page
        console.log(`attempting to connect to ${page}`)
        this.websocketReady = false;
        this.websocket = null
        while (!this.websocketReady) {
            if (this.websocket && this.websocket.OPEN) return
            if (this.websocket && this.websocket.CONNECTING) {
                await sleep(1000)
            } else {
                const tabData = await this.findTab(page)
                if (tabData) {
                    console.log(`Tab for ${page} found`)
                    this.websocket = new WebSocket(tabData.webSocketDebuggerUrl);
                    this.websocket.on('open', () => {
                        console.log(`Websocket connected for ${this.page}`)
                        this.websocketReady = true;
                        this.onConnect()
                    });
                    this.websocket.on('message', (m) => {
                        console.log(m.toString())
                    })
            
                    // on disconnect
                    this.websocket.on('close', () => {
                        this.websocketReady = false
                        console.log(`websocket for ${page} closed`)
                        this.connectToTab(this.page)
                    })
                } else {
                    console.log(`Tab for ${page} not found. Retrying`)
                    await sleep(2000)
                }
            }
        }


    }
    
    async sendCode(code) {
        while (!this.websocketReady) {
            console.log("waiting...")
            await sleep(3000)   
        }
        this.websocket.send(JSON.stringify({
            id: 1,
            method: "Runtime.evaluate",
            params: {
                expression: code,
                userGesture: true
            }
        }));
    }
}

class MainUI extends Tab {
    constructor() {
        super("SP")
        this.keyboard = new Keyboard(this)
    }

    async onConnect() {
        await this.keyboard.init()
    }
}

class TabManager {
    constructor() {
        this.tabs = {}
    }

    loadTabs() {

    }

    async create(page) {
        if (page) {
            // this.tabs[page]= new Tab(tabInfo)
            if (page === "SP") {
                this.tabs[page] = new MainUI()
            } else {
                this.tabs[page] = new Tab(page)
            }
            await this.tabs[page].connectToTab()
        }

    }

    get(page) {
        const found = this.tabs[page]
        return found || null
    }
}

class Keyboard {
    constructor(mainTab) {
        this.availiableKeyboardThemes = getKeyboardThemes()
        this.currentTheme = localStorage.getItem(LocalStorageKeys.KEYBOARD_CURRENT_THEME) 
        this.canModifyKeyboard = false
        this.mainTab = mainTab
    }

    async init() {
        if (this.mainTab) {
            await this.mainTab.sendCode(`
            console.log("injecting keyboard");
            if (!document.getElementById("${KEYBOARD_STYLE_ID}")) {
                const styleElem = document.createElement("style");
                styleElem.setAttribute("id", "${KEYBOARD_STYLE_ID}")
                document.head.appendChild(styleElem);
                console.log("created stlye")
            } else {
                console.log("keyboard style exists not creating")
            }

            fetch("http://localhost:3001/internal/keyboard/ready")

            function LOAD_THEME(css) {
                document.getElementById("${KEYBOARD_STYLE_ID}").innerHTML = css
                console.log("loaded new theme")
            }
            `);
            console.log('keyboard style overwriting prepared')
            this.canModifyKeyboard = true
        } else {
            console.log('could not locate tab')
        }
    }

    reloadKnownThemes() {
        this.availiableKeyboardThemes = getKeyboardThemes()
        console.log(this.availiableKeyboardThemes)
    }

    setCurrentTheme(name) {
        this.currentTheme = name
        localStorage.setItem(LocalStorageKeys.KEYBOARD_CURRENT_THEME, name)
    }

    async setTheme(name) {
        if (name && this.availiableKeyboardThemes.includes(name)) {
            // TODO load theme css
            fs.readFile(KEYBOARD_THEME_DIR+"/"+name+".css", 'utf-8', (err, data) => {
                if (err) throw err;
                this.mainTab.sendCode(`LOAD_THEME(\`${data}\`)`)
                this.setCurrentTheme(name)
            });
        } else {
            console.log(`cant load theme ${name}`)
        }
    }

    async removeTheme() {
        this.mainTab.sendCode(`LOAD_THEME()`)
        this.setCurrentTheme("Default")
    }

    async loadCurrentTheme() {
        if (this.currentTheme) {
            this.setTheme(this.currentTheme)
        }
    }
}

class Main {
    constructor() {
        this.tabs = new TabManager() 
    }

    async init() {
        await Promise.all([
            this.tabs.create('Toast'),
            this.tabs.create('MainMenu'),
            this.tabs.create('SP'),
            this.tabs.create('QuickAccess'),
        ])
        // this.keyboard = new Keyboard(this.tabs.get(TabEnum.MainUI))
        // await this.keyboard.init()
        this.keyboard = this.tabs.get("SP").keyboard
    }

}

export default new Main()