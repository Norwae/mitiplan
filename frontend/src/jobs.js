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
    a("Provoke", 15, 30, lsi("2b45fea903bcf1edd9e08110cf95e8bba9a73c0d")),
    a("Reprisal", 22, 60, lsi("6b83d9368623d5cd20a426d26916021b59a14963")),
]
const healerRole = [
    a("Esuna", 10, 2.5, lsi("2a6603bc786d73eb3829141482b3d5be5d484199")),
]
const meleeRole = [
    a("Feint", 22, 90, lsi("84c26a86cbbb8a599e5a2441cebcd33b0064bf07")),
]
const rangedRole = []
const casterRole = [
    a("Addle", 8, 90, lsi("b45e688d81b5607246600f904aac008364db0d1e")),
]

function job(code: string, friendlyName: string, role: Defensive[], ...rest: Defensive[]): Job {
    return { code, friendlyName, actions: role.concat(rest) }
}

export const jobs = [
    job("DRK", "Dark Knight", tankRole,
        a("Living Dead", 50, 300, lsi("968fc4ccd880ca468fff7b34680e793a80ffdab1")),
        a("Dark Missionary", 75, 90, lsi("1dc1a1d830e5355e2cd251531e85932c24ba1b8d")),
    ),
    job("GNB", "Gunbreaker", tankRole,
        a("Superbolide", 50, 360, lsi("58257f726f8a2f793622a654e5b0b2df36b372ad")),
        a("Heart of Light", 64, 90, lsi("04bbce4afc048a15cdccdd0495e679f90b115963"), 1,
            a("Heart of Corundum", 82, 25, lsi("493de7202ca9b1e4bed75fdd4e5b1e7a8c61d58a"))
        )
    ),
    job("PLD", "Paladin", tankRole,
        a("Hallowed Ground", 50, 420, lsi("249bf48c39ec44b9b32f0681ea256850ed6aa8f8")),
        a("Divine Veil", 56, 90, lsi("495faab61344751872ca0867e2d5e59b04c6940c")),
        a("Passage of Arms", 70, 120, lsi("b570dfda793945b3bb8fddef02b1a865b8a04b32"))
    ),
    job("WAR", "Warrior", tankRole,
        a("Holmgang", 42, 240, lsi("91b5673b1dfb08c80d7b8fc2bdc936f46906317f")),
        a("Shake It Off", 68, 90, lsi("f71e2c46512c1e937c0ff316be668d853869c637"))
    ),
    job("AST", "Astrologian", healerRole,
        a("Collective Unconscious", 58, 60, lsi("8c6c1d8dd2025d1019e16133be9b5c8bc9871201")),
        a("Earthly Star", 62, 60, lsi("7012ee74c18fa7f0e6a087d778701560a5553322")),
        a("Neutral Sect", 80, 120, lsi("5a81be793ffaa939b52917ef026f6652a2227498")),
        a("Exaltation", 86, 60, lsi("6b48700e107bcfe9620f773da5896b514e89f9a2")),
        a("Macrocosmos", 90, 180, lsi("96ad13792128386a54c9a3d5215b0f6bbb0af2aa"))
    ),
    job("SCH", "Scholar", healerRole,
        a("Whispering Dawn", 20, 60, lsi("161dc95f27e69fb5bd4caecfdeab022e3560193d")),
        a("Fey Illumination", 40, 120, lsi("6ed1ace8e31760fa3b042e6d27dac669668196b0")),
        a("Sacred Soil", 50, 30, lsi("4c47bdf94dc6c3dcd9b303cfa42a08a5cfd13629")),
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
    job("MNK", "Monk", meleeRole,
        a("Mantra", 42, 90, lsi("576fee56715e5d7a353c36daab4c4e3a5546738e"))
    ),
    job("NIN", "Ninja", meleeRole),
    job("RPR", "Reaper", meleeRole,
        a("Arcane Crest", 40, 30, lsi("9977fdbbf70443f9f31f4868cba97138fbec5460"))
    ),
    job("SAM", "Samurai", meleeRole),
    job("VPR", "Viper", meleeRole),
    job("BLM", "Black Mage", casterRole),
    job("RDM", "Red Mage", casterRole,
        a("Magicked Barrier", 86, 120, lsi("5c95999b6491dcc5714cd7f926b03fc56b5c88dc"))
    ),
    job("PIC", "Pictomancer", casterRole,
        a("Tempura Grassa", 88, 120, lsi("ed684b430814130c6917a00018cd5e400430e210"))
        ),
    job("SMN", "Summoner", casterRole,
        a("Radiant Aegis", 2, 60, lsi("926e42e9a30e357e4214c95427cd1dd1592974c5"), 1,
            a("Radiant Aegis", 88, 60, lsi("926e42e9a30e357e4214c95427cd1dd1592974c5"), 2)
        )
    ),
    job("BRD", "Bard", rangedRole,
        a("The Warden's Paean", 35, 45, lsi("e2358f71a46fe53449fdff7c7e42bb99c51987ca")),
        a("Troubadour", 62, 90, lsi("6618d7a1a2770ce51edecf1c26a2937b5fc95963")),
        a("Nature's Minne", 66, 120, lsi("03c3c2cabca1caf35d1c9a6ef8d0fe150e03762c"))
    ),
    job("MCH", "Machinist", rangedRole),
    job("DNC", "Dancer", rangedRole),
];

function jobByCode(code: string): Job {
    return jobs.find(j => j.code === code)
}
jobs.byCode = jobByCode
