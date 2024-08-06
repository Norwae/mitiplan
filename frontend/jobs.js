export interface Defensive {
    name: string,
    atLevel: number,
    cooldownSeconds: number,
    charges: number,
    evolution?: Defensive,
    icon?: string
}

export interface Job {
    code: string,
    friendlyName: string,
    actions: Defensive[]
}

const a = (name, atLevel, cooldownSeconds, icon, charges, evolution): Defensive => ({ name, atLevel, cooldownSeconds, evolution, icon, charges: charges || 1 })
const lsi = (uuid) => `https://lds-img.finalfantasyxiv.com/d/${uuid}.png`

const tankRole = [
    a("Rampart", 8, 90),
    a("Provoke", 15, 30),
    a("Reprisal", 22, 60),
]
const healerRole = [
    a("Esuna", 10, 2.5, lsi("2a6603bc786d73eb3829141482b3d5be5d484199")),
]
const meleeRole = [
    a("Feint", 22, 90),
]
const rangedRole = []
const casterRole = [
    a("Addle", 8, 90),
]

function job(code: string, friendlyName: string, role: Defensive[], ...rest: Defensive[]): Job {
    return { code, friendlyName, actions: role.concat(rest) }
}

export const jobs = [
    job("DRK", "Dark Knight", tankRole,
        a("Shadow Wall", 38, 120, null, 1, a(
            "Shadowed Vigil", 92, 120
        )),
        a("Dark Mind", 45, 60),
        a("Living Dead", 50, 300),
        a("The blackest night", 70, 15),
        a("Dark Missionary", 75, 90),
        a("Oblation", 82, 60, 2)
    ),
    job("GNB", "Gunbreaker", tankRole,
        a("Camouflage", 6, 90),
        a("Nebula", 38, 120, null, 1,
            a("Great Nebula", 92, 120)
        ),
        a("Aurora", 45, 60),
        a("Superbolide", 50, 360),
        a("Heart of Light", 64, 90, null, 1,
            a("Heart of Corundum", 82, 25)
        ),
        a("Heart of Stone", 68, 25),
    ),
    job("PLD", "Paladin", tankRole),
    job("WAR", "Warrior", tankRole),
    job("AST", "Astrologian", healerRole),
    job("SCH", "Scholar", healerRole,
        a("Whispering Dawn", 20, 60, lsi("161dc95f27e69fb5bd4caecfdeab022e3560193d")),
        a("Fey Illumination", 40, 120, lsi("6ed1ace8e31760fa3b042e6d27dac669668196b0")),
        a("Sacred Soil", 50, 30, lsi("4c47bdf94dc6c3dcd9b303cfa42a08a5cfd13629")),
        a("Indomitability", 52, 30, lsi("7f80a5bd016eab7200c55dd8d1d6afb07361a0ca")),
        a("Deployment Tactics", 56, 90, lsi("307e3a65fff1e38b28235509dd392323642d6965")),
        a("Excogitation", 62, 45, lsi("b46ada85c48a81940953f46eaaba05f1c2f5cfdd")),
        a("Recitation", 74, 60, lsi("b1be794db381c20399faf7dec80b7f64eaba2e61")),
        a("Fey Blessing", 76, 60, lsi("e37b65935298898f61fd4b12a293998ba1258be5")),
        a("Summon Seraph", 80, 120, lsi("ff070d67e4c75ed8bb06de1f577979e8c69c8ad1")),
        a("Protraction", 86, 60, lsi("a46c7dccd2bb9a8fe7a472766acf8138f2ada3e8")),
        a("Expedient", 90, 120, lsi("023d8827b75a8d5d6682a81acf1016371366f8e8")),
        a("Seraphism", 100, 180, lsi("3660e0317ed2aba78b7cfdc526dd174efa94d88d"))
    ),
    job("SGE", "Sage",healerRole),
    job("WHM", "White Mage", healerRole),
    job("DRG", "Dragoon", meleeRole),
    job("MNK", "Monk", meleeRole),
    job("NIN", "Ninja", meleeRole),
    job("RPR", "Reaper", meleeRole),
    job("SAM", "Samurai", meleeRole),
    job("VPR", "Viper", meleeRole),
    job("BLM", "Black Mage", casterRole),
    job("RDM", "Red Mage", casterRole),
    job("PIC", "Pictomancer", casterRole),
    job("SMN", "Summoner", casterRole),
    job("BRD", "Bard", rangedRole),
    job("MCH", "Machinist", rangedRole),
    job("DNC", "Dancer", rangedRole),
];

function jobByCode(code: string): Job {
    return jobs.find(j => j.code === code)
}
jobs.byCode = jobByCode
