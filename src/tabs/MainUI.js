import Keyboard from "../Keyboard.js"
import Tab from "./Tab.js"

class MainUI extends Tab {
    constructor() {
        super("SP")
        this.keyboard = new Keyboard(this)
    }

    async onConnect() {
        await this.keyboard.init()
    }
}

export default MainUI