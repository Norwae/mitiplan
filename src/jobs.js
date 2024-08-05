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

const a = (name, atLevel, cooldownSeconds, image, charges, evolution): Defensive => ({ name, atLevel, cooldownSeconds, evolution, charges: charges || 1 })

const tankRole = [
    a("Rampart", 8, 90),
    a("Provoke", 15, 30),
    a("Reprisal", 22, 60),
    a("Arm's Length", 32, 120)
]
const healerRole = [
    a("Esuna", 10, 2.5),
    a("Surecast", 32, 120),
    a("Rescue", 48, 120)
]
const meleeRole = [
    a("Feint", 22, 90),
    a("Arm's Length", 32, 120)
]
const rangedRole = [
    a("Arm's Length", 32, 120),
]
const casterRole = [
    a("Addle", 8, 90),
    a("Surecast", 32, 120)
]

function job(code: string, friendlyName: string, role: Defensive[], ...rest: Defensive[]): Job {
    return { code, friendlyName, actions: role.concat(rest) }
}

export const jobs = [
    job("DRK", "Dark Knight", tankRole,
        a("Shadow Wall", 38, 120, 1, a(
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
        a("Nebula", 38, 120, 1,
            a("Great Nebula", 92, 120)
        ),
        a("Aurora", 45, 60),
        a("Superbolide", 50, 360),
        a("Heart of Light", 64, 90, 1,
            a("Heart of Corundum", 82, 25)
        ),
        a("Heart of Stone", 68, 25),
    ),
    job("PLD", "Paladin", tankRole),
    job("WAR", "Warrior", tankRole),
    job("AST", "Astrologian", healerRole),
    job("SCH", "Scholar", healerRole),
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

jobs.byCode = (c) => jobs.find(j => j.code === c)