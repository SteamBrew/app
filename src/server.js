import express from 'express';
import main from './main.js';

export default async () => {
    const app = express()
    const port = process.env.PORT || 3000

    await main.init()

    app.get('/', (req, res) => {
        console.log("revieved message")
        res.send('Hello World!')
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
    
    app.listen(port, () => {
        console.log(`Listening ${port}`)
    })
}