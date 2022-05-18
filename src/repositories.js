import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import Cache from './cache.js';
import { LocalStorageKeys } from "./enums.js";
import localStorage from "./localStorage.js";

export const RepoType = {
    Info: "info",
    Keyboard: "keyboard",
    Plugin: "plugin",
    Soundpack: "soundpack",
    UI: "ui",
}

const defaultRepos = [{id: "0", baseUrl: 'https://raw.githubusercontent.com/SteamBrew/official_repository/main/'}]

class Repositories {
    constructor() {
        this.repositories = JSON.parse(localStorage.getItem(LocalStorageKeys.REPOSITORIES)) || defaultRepos
        this.cache = new Cache()
    }

    save() {
        localStorage.setItem(LocalStorageKeys.REPOSITORIES, JSON.stringify(this.repositories))
    }

    async all() {
        const results = []
        for (let i = 0; i < this.repositories.length; i++) {
            const repository = this.repositories[i];
            const info = await this.queryRepo(repository.baseUrl, RepoType.Info)
            results.push({
                ...repository,
                supports: info.supports
            })
        }
        return results
    }

    findByUrl(url) {
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

    findById(id) {
        for (let i = 0; i < this.repositories.length; i++) {
            const repo = this.repositories[i];
            if (repo.id === id) {
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
    async add(url) {
        if (this.findByUrl(url).location === -1) {
            const isValid = await this.testRepo(url)
            if (isValid) {
                this.repositories.push({
                    id: uuidv4(),
                    baseUrl: url
                })
                this.save()
                return true
            }
        }
        return false
    }

    remove(id) {
        const {location, repository} = this.findById(id)
        if (location != -1) {
            this.repositories.splice(location)
            this.cache.clearNamespace(repository.baseUrl)
            this.save()
            return true
        }
        return false
    }

    async queryType(type) {
        const results = []
        for (let i = 0; i < this.repositories.length; i++) {
            const repository = this.repositories[i];
            const response = await this.queryRepo(repository.baseUrl, type)
            results.push({
                repository,
                data: response
            })
        }
        return results
    }

    async queryRepo(baseUrl, type) {
        const cacheValue = this.cache.get(baseUrl, type)
        if (cacheValue) {
            return cacheValue
        }
        const response = await fetch(`${baseUrl}/${type}.json`)
        const data = await response.json()
        this.cache.add(baseUrl, type, data)
        return data
    }

    async testRepo(url) {
        const data = await this.queryRepo(url, RepoType.Info)
        if (data) {
            if (data.version && data.supports) {
                if (data.version == "v1") {
                    return true
                }
            }
        }
        return false
    }
}

export default Repositories;