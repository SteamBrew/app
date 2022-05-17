import Repositories from "../src/repositories";

describe('Respositories', () => {
    
    describe('testRepo', () => {
        it("will work", async () => {
            console.log(await new Repositories().testRepo('https://raw.githubusercontent.com/SteamBrew/official_repository/main/'))

        })
    });
});