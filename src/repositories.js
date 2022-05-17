import fetch from 'node-fetch';
import { LocalStorageKeys } from "./enums";
import localStorage from "./localStorage";

/**
 * TODO
 *  metadata query to each repo
 *  query data type from repo 
 *  get all 
 * 
 *  add repo
 *      must not already exist
 *  remove repo
 *  list repos
 *  test valid repo 
 * 
 *  caching
 *  
 */

export const RepoType = {
    Info: "info.json",
    Keyboard: "keyboard.json"
}

// may need to change this format
const defaultRepos = [{baseUrl: 'https://raw.githubusercontent.com/SteamBrew/official_repository/main/'}]

class Repositories {
    constructor() {
        this.repositories = JSON.parse(localStorage.getItem(LocalStorageKeys.REPOSITORIES)) || defaultRepos
        this.cache = JSON.parse(localStorage.getItem(LocalStorageKeys.REPOSITORIES_CACHE)) || {}
    }

    find(url) {
        for (let i = 0; i < this.repositories.length; i++) {
            const repo = this.repositories[i];
            if (repo.baseUrl === url) {
                return {
                    location: i,
                    repository: repo
                };
            }
        }
        return {
            location: -1,
            repository: null
        };
    }

    // add a repository, must not already exist
    add(url) {
        if (!this.find(url)) {
            // test url 
            this.repositories.push({baseUrl: url})
        }
    }

    // remove and remove any cache for it
    remove(url) {
        const {location} = this.find(url)
        if (location) {
            this.repositories.splice(location)
        }
    }

    // query a repository 
    queryRepo(name, type) {

    }

    // check if info response is valid
    async testRepo(url) {
        const response = await fetch(`${url}/info.json`)
        const data = await response.json()
        if (data) {
            console.log(data)
        }
    }
}

export default Repositories;