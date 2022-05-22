import Repositories from "../src/Repositories";

describe('Respositories', () => {
    
    describe('all', () => {
        it("will return repository info", async () => {
            const result = await new Repositories().all()
            expect(result).toBe(null)
        })
    })

    describe('queryType', () => {
        it('will work', async () => {
            const result = await new Repositories().queryType("info")
            console.log(result)
        })
    })

    describe('testRepo', () => {
        it("will work", async () => {
            console.log(await new Repositories().testRepo('https://raw.githubusercontent.com/SteamBrew/official_repository/main/'))
        })
    });
});