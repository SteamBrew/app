import dotenv from "dotenv";
import server from './src/server.js';

dotenv.config()

server()


// // not unique
// const TabUrls = {
//     'https://steamloopback.host/routes/library/home': 'MainUI',
//     'about:blank?browserviewpopup=1&requestid=4': 'Toast',
//     'about:blank?browserviewpopup=1&requestid=2': 'MainMenu',
//     'about:blank?browserviewpopup=1&requestid=3': 'QuickAccess',
// }



// async function main() {
//     const tabs = new TabManager()

//     // TODO load plugins first

//     // TODO, need to loop tab finding if any not found possibly

//     const tabsFound = await getAvailableTabs();
//     // console.log(tabsFound)
//     tabsFound.forEach(tabData => {
//         tabs.create(tabData)
//     })
    
//     const mainTab = tabs.get(TabEnum.MainUI)
//     if (mainTab) {
//         mainTab.sendCode(`
//         console.log("injecting keyboard");
//         if (!document.getElementById("${KEYBOARD_STYLE_ID}")) {
//             const styleElem = document.createElement("style");
//             styleElem.setAttribute("id", "${KEYBOARD_STYLE_ID}")
//             document.head.appendChild(styleElem);
//             console.log("created stlye")
//         } else {
//             console.log("keyboard style exists not creating")
//         }
//         `);
//     } else {
//         console.log('could not locate tab')
//     }
// }

// main()