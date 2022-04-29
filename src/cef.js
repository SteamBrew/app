import fetch from 'node-fetch';
import { STEAMDECK_IP } from './constants.js';
export async function getAvailableTabs() {
    let jsonRes = []
    try {
        const response = await fetch(`http://${STEAMDECK_IP}:3000/json`);
        jsonRes = response.json();
    } catch (e) {
        console.log(e)
    }
    return jsonRes
} 
