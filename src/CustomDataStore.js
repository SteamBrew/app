class CustomDataStore {
    constructor() {
        // TODO load knowledge of what is downloaded
    }

    getFileName(repositoryId, themeId, extension) {
        return `${repositoryId}_${themeId}.${extension}`
    }

    // Save a file to storage
    // TODO will we provide the url of this data or the actual data??
    add(repositoryId, themeId, data) {

    }
    
    // Remove from storage
    delete(repositoryId, themeId) {

    }

    // Get the stored data
    get(repositoryId, themeId) {

    }

    // is there a file saved for the theme
    isInstalled(repositoryId, themeId) {

    }

    // Return all installed stuff (not the data just ids)
    getInstalled() {

    }


}