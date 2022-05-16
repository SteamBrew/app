const Repositories = require("../src/repositories")
describe('Respositories', () => {
    
    describe('testRepo', async () => {
        console.log(await new Repositories().testRepo('https://raw.githubusercontent.com/SteamBrew/official_repository/main/'))
    });
});