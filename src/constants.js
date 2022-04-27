import path from "path";
import { fileURLToPath } from 'url';

export const DEV = true;
export const KEYBOARD_STYLE_ID = 'steamdeck_custom_keyboard_theme';
export const KEYBOARD_THEME_DB = 'keyboards_themes';
export const STEAMDECK_IP = DEV?"192.168.1.138":"127.0.0.1";
export const KEYBOARD_THEME_DIR = './custom/keyboard_themes';
export const __dirname = path.dirname(fileURLToPath(import.meta.url))
