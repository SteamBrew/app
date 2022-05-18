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
app.use(express.json());

app.use("/static", express.static(path.join(__dirname, 'manager/build')));

app.get('/', (req, res) => {
    console.log("revieved message")
    res.send(200)
})

app.get('/keyboard/get', async (req, res) => {
    console.log('getting themes')
    res.json({
        themes: main.keyboard.themeStore.getAll(),
        current: main.keyboard.themeStore.findById(main.keyboard.currentTheme)
    })
})

app.post('/keyboard/delete', async (req, res) => {
    const {_id} = req.body
    if (_id) {
        const result = main.keyboard.deleteTheme(_id)
        if (result) {
            return res.send(200)
        }
    }
    res.send(400)
})

app.get('/keyboard/set/:id', async (req, res) => {
    console.log(req.params)
    const theme = req.params.id
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

app.post('/keyboard/install', async (req, res) => {
    const {_id, url, name} = req.body
    if (url && name) {
        const result = await main.keyboard.installTheme({_id, url, name})
        if (result) {
            res.send(200)
        } else {
            res.send(500)
        }
    }
})

app.get('/repositories/list', async (req, res) => {
    res.json(await main.repositories.all())
})

app.post('/repositories/create', async (req, res) => {
    const {url} = req.body;
    res.json(await main.repositories.add(url))
})

app.post('/repositories/delete', async (req, res) => {
    const {id} = req.body;
    res.json(main.repositories.remove(id))
})

app.get('/repositories/get/:type', async (req, res) => {
    const {type} = req.params;
    res.json(await main.repositories.queryType(type))
})

// keyboard theme handling ready
app.get('/internal/keyboard/ready', async (req, res) => {
        // ensure theme exists
    console.log("keyboard theme loading ready")
    await main.keyboard.loadCurrentTheme()
    res.send(200)
})

app.use("/static/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "manager/build", "index.html"))
})


app.listen(port, () => {
    console.log(`Listening ${port}`)
})
