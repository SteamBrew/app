// encapulates all logic
import { PageEnum } from './enums.js';
import Repositories from './repositories.js';
import TabManager from './tabs/TabManager.js';

class Main {
    constructor() {
        this.tabs = new TabManager() 
        this.repositories = new Repositories()
    }

    async init() {
        await Promise.all([
            this.tabs.create(PageEnum.Toast),
            this.tabs.create(PageEnum.MainMenu),
            this.tabs.create(PageEnum.MainUI),
            this.tabs.create(PageEnum.QuickAccess),
        ])
        // this.keyboard = new Keyboard(this.tabs.get(TabEnum.MainUI))
        // await this.keyboard.init()
        this.keyboard = this.tabs.get(PageEnum.MainUI).keyboard
    }

}

export default new Main()