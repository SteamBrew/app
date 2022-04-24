import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import main from './src/main.js';

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const port = process.env.PORT || 3000

await main.init()

app.use(cors())

app.use("/static", express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    console.log("revieved message")
    res.send('Hello World!')
})

app.get('/keyboard/get', async (req, res) => {
    console.log('getting themes')
    res.json({
        themes: main.keyboard.availiableKeyboardThemes,
        current: main.keyboard.currentTheme
    })
})

app.get('/keyboard/set/:name', async (req, res) => {
    console.log(req.params)
    const theme = req.params.name
    if (!theme) {
        res.send(400)
    } else {
        // ensure theme exists
        await main.keyboard.setTheme(theme)
    }
    res.send(200)
})

app.get('/keyboard/reset', async (req, res) => {
    main.keyboard.removeTheme()
    res.send(200)
})

// TODO find a theme somehow and save it in the custom/keybaord_themes dir
app.get('/keyboard/install', async (req, res) => {
    res.send(200)
})

// TODO delete theme and set current theme back to default
app.get('/keyboard/install', async (req, res) => {
    res.send(200)
})

app.get('/keyboard/reload_themes', async (req, res) => {
    main.keyboard.reloadKnownThemes()
    res.send(200)
})    

// keyboard theme handling ready
app.get('/internal/keyboard/ready', async (req, res) => {
        // ensure theme exists
    console.log("keyboard theme loading ready")
    await main.keyboard.loadCurrentTheme()
    res.send(200)
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})
