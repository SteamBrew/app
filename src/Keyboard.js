import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { v4 } from 'uuid'
import {
    KEYBOARD_STYLE_ID, KEYBOARD_THEME_DB, KEYBOARD_THEME_DIR, __dirname
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

class KeyBoardStore {
    // currently using an object using _id for key for easy access by id 
    constructor() {
        this.themes = JSON.parse(localStorage.getItem(KEYBOARD_THEME_DB)) || {"0": {_id: "0", name: "Default"}}
    }

    save() {
        localStorage.setItem(KEYBOARD_THEME_DB, JSON.stringify(this.themes))
    }

    findById(id) {
        return this.themes[id] || null
    }
    
    findByName(name) {
        for (const _id in this.themes) {
            if (Object.hasOwnProperty.call(this.themes, _id)) {
                const theme = this.themes[_id];
                if (theme.name == name) {
                    return theme
                }
            }
        }
    }
    
    getAll() {
        let themes = []
        for (const _id in this.themes) {
            if (Object.hasOwnProperty.call(this.themes, _id)) {
                themes.push(this.themes[_id]);
            }
        }
        return themes
    }

    add({ name, _id }) {
        if (this.findById(_id) == null) {
            this.themes[_id] = {
                _id,
                name
            }
            this.save()
            return this.themes[_id]
        }
        return null
    }

    delete(_id) {
        delete this.themes[_id]
    }
}

class Keyboard {
    constructor(mainTab) {
        this.themeStore = new KeyBoardStore()
        // _id of theme in use
        this.currentTheme = localStorage.getItem(LocalStorageKeys.KEYBOARD_CURRENT_THEME) || "0"
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

    setCurrentTheme(_id) {
        this.currentTheme = _id
        localStorage.setItem(LocalStorageKeys.KEYBOARD_CURRENT_THEME, _id)
    }

    /**
     * 
     * @param {Object} info
     * @param {Object} info.name
     * @param {Object} info.url
     *  
     */
    async installTheme(info) {
        const {_id, name, url} = info
        let css;
        
        if (this.themeStore.findById(_id)) {
            // TODO add updating theme
            return false
        }
        try {
            const result = await fetch(url);
            css = await result.text()
        } catch (e) {
            console.log(e)
            return false
        }

        let id;
        
        if (!_id) {
            // manually provided
            id = `manual_${v4()}`
        } else {
            id = _id
        }

        this.themeStore.add({_id: id, name})

        await fs.writeFileSync(
            path.join(__dirname, '..', 'custom', 'keyboard_themes', (`${id}.css`)),
            css    
        )
        return true
    }

    async setTheme(id) {
        if (id && this.themeStore.findById(id)) {
            // TODO load theme css
            fs.readFile(KEYBOARD_THEME_DIR+"/"+id+".css", 'utf-8', (err, data) => {
                if (err) throw err;
                this.mainTab.sendCode(`LOAD_THEME(\`${data}\`)`)
                this.setCurrentTheme(id)
            });
        } else {
            console.log(`cant load theme ${id}`)
        }
    }

    async removeTheme() {
        this.mainTab.sendCode(`LOAD_THEME()`)
        this.setCurrentTheme("0")
    }

    async loadCurrentTheme() {
        if (this.currentTheme) {
            this.setTheme(this.currentTheme)
        }
    }
}

export default Keyboard