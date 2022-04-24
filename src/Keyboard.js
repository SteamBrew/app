import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import {
    KEYBOARD_STYLE_ID, KEYBOARD_THEME_DIR
} from "./constants.js"
import { LocalStorageKeys } from './enums.js'
import localStorage from "./localStorage.js"

const getKeyboardThemes = () => {
    const KeyboardThemes = []
    fs.readdirSync(KEYBOARD_THEME_DIR).forEach(file => {
        if (file.endsWith(".css")) {
            KeyboardThemes.push(file.substring(0, file.length - ".css".length))
        }
    })
    return KeyboardThemes
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

    /**
     * 
     * @param {Object} info
     * @param {Object} info.name
     * @param {Object} info.url
     *  
     */
    async installTheme(info) {
        const {name, url} = info
        let css;
        try {
            const result = await fetch(url);
            css = await result.text()
        } catch (e) {
            console.log(e)
            return false
        }
        await fs.writeFileSync(
            path.join(__dirname, '..', 'custom', 'keyboard_themes', (name+".css")),
            css    
        )
        return true
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

export default Keyboard