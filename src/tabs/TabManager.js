import MainUI from "./MainUI.js"
import Tab from "./Tab.js"

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

export default TabManager