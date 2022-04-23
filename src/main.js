// encapulates all logic
import fs from 'fs';
import fetch from "node-fetch";
import WebSocket from 'ws';
import sleep from './helpers/sleep.js';

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
    // TODO this could fail
    const response = await fetch(`http://${STEAMDECK_IP}:3000/json`);
    return response.json();
} 

const TabTitles = {
    'SP': 'MainUI',
    'Toast': 'Toast',
    'MainMenu': 'MainMenu',
    'QuickAccess': 'QuickAccess',
}

const TabEnum = {
    MainUI: 'MainUI',
    Toast: 'Toast',
    MainMenu: 'MainMenu',
    QuickAccess: 'QuickAccess',
}

class Tab {
    /**
     * tabData:
     * @param {string} description 
     * @param {string} devtoolsFrontendUrl 
     * @param {string} id
     * @param {string} title 
     * @param {string} type 
     * @param {string} url 
     * @param {string} webSocketDebuggerUrl 
     *  
     */
    constructor(tabData) {
        this.page = TabTitles[tabData.title]
        this.data = tabData
        this.websocketReady = false;
        this.websocket = new WebSocket(tabData.webSocketDebuggerUrl);
        this.websocket.on('open', () => {
            console.log(`Websocket connected for ${this.page}`)
            this.websocketReady = true
        });
        this.websocket.on('message', (m) => {
            console.log(m.toString())
        })

    }
    
    async sendCode(code) {
        while (!this.websocketReady) {
            console.log("waiting...")
            await sleep(1000)   
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

class TabManager {
    constructor() {
        this.tabs = {}
    }

    create(tabInfo) {
        const page = TabTitles[tabInfo.title];
        if (page) {
            console.log(`Found page: ${page}`)
            this.tabs[page]= new Tab(tabInfo)
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
        this.currentTheme = null
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
            function LOAD_THEME(css) {
                console.log(css)
                document.getElementById("${KEYBOARD_STYLE_ID}").innerHTML = css
                console.log("loaded")
            }
            `);
            console.log('keyboard style overwriting prepared')
            this.canModifyKeyboard = true
        } else {
            console.log('could not locate tab')
        }
    }

    async setTheme(name) {
        if (name && this.availiableKeyboardThemes.includes(name) && this.currentTheme != name) {
            // TODO load theme css
            fs.readFile(KEYBOARD_THEME_DIR+"/"+name+".css", 'utf-8', (err, data) => {
                if (err) throw err;
                this.mainTab.sendCode(`LOAD_THEME(\`${data}\`)`)
              });

        }
    }
}

class Main {
    constructor() {
        this.availiableKeyboardThemes = getKeyboardThemes()
        this.tabs = new TabManager() 
    }

    async init() {
        (await getAvailableTabs()).forEach(tabData => {
            this.tabs.create(tabData)
        })

        this.keyboard = new Keyboard(this.tabs.get(TabEnum.MainUI))
        await this.keyboard.init()


    }

}

export default new Main()