import { CUSTOM_DATA_DIR } from "./constants";

class CustomDataStore {
    constructor() {
        // TODO load knowledge of what is downloaded
    }

    getFileName(repositoryId, themeId, extension) {
        return `${repositoryId}_${themeId}${extension?`.${extension}`:""}`
    }

    // Save a file to storage
    // TODO will we provide the url of this data or the actual data??
    async add(repositoryId, themeId, customType, url) {
        let data;
        try {
            const result = await fetch(url);
            data = await result.text()
        } catch (e) {
            return false
        }

        await fs.writeFileSync(
            path.join(__dirname, '..', 'custom', customType, this.getFileName(repositoryId, themeId)),
            css    
        )

        return true
    }
    
    // Remove from storage
    delete(repositoryId, themeId, customType) {
        fs.unlinkSync(`${CUSTOM_DATA_DIR}/${customType}/${this.getFileName(repositoryId, themeId)}`)

    }

    // Get the stored data
    get(repositoryId, themeId, customType) {

    }

    // is there a file saved for the theme
    isInstalled(repositoryId, themeId, customType) {

    }

    // Return all installed stuff (not the data just ids)
    getInstalled() {

    }


}