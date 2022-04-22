import fetch from 'node-fetch';
import WebSocket from 'ws';

const DEV = true;
const ip = DEV?"192.168.1.138":"127.0.0.1";

const TabUrls = {
    'https://steamloopback.host/routes/library/home': 'MainUI',
    'about:blank?browserviewpopup=1&requestid=4': 'Toast',
    'about:blank?browserviewpopup=1&requestid=2': 'MainMenu',
    'about:blank?browserviewpopup=1&requestid=3': 'QuickAccess',
}

const TabEnum = {
    MainUI: 'MainUI',
    Toast: 'Toast',
    MainMenu: 'MainMenu',
    QuickAccess: 'QuickAccess',
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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
        this.page = TabUrls[tabData.url]
        this.websocketReady = false;
        this.websocket = new WebSocket(tabData.webSocketDebuggerUrl);
        this.websocket.on('open', () => {
            console.log(`Websocket connected for ${this.page}`)
            this.websocketReady = true
        });

    }
    
    async sendCode() {
        while (!this.websocketReady) {
            console.log("waiting...")
            await sleep(1000)   
        }
        this.websocket.send(JSON.stringify({
            id: 1,
            method: "Runtime.evaluate",
            params: {
                expression: `
                ()=>{
                    console.log("hi");
                    return 'TESTRESPONSE'
                }`,
                userGesture: true
            }
        }));
    }
}

async function getAvailableTabs() {
    // TODO this could fail
    const response = await fetch(`http://${ip}:3000/json`);
    return response.json();
} 



async function main() {
    const loadedTabs = {}

    // TODO load plugins first

    // TODO, need to loop tab finding if any not found possibly

    const tabsFound = await getAvailableTabs();
    console.log(tabsFound)
    tabsFound.forEach(tabData => {
        const page = TabUrls[tabData.url];
        if (page) {
            console.log(`Found page: ${page}`)
            loadedTabs[page]= new Tab(tabData)
        } 
    })
    
    loadedTabs[TabEnum.QuickAccess].sendCode();
}

main()