import WebSocket from "ws"
import { getAvailableTabs } from "../cef.js"
import sleep from "../helpers/sleep.js"

class Tab {
    constructor(page) {
        this.page = page
        // this.connectToTab(page)        
    }

    async findTab(page) {
        let tabs = [] 
        try {
            tabs = await getAvailableTabs()
        } catch (e) {
            console.log(e)
        }

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

export default Tab