export interface Fight {
    name: string,
    code: string,
    levelSync: number,
    events: CombatEvent[]
}

export type DamageType = "MAGIC" | "PHYSICAL" | "SPECIAL" | "AVOIDABLE"

export interface CombatEvent {
    timestamp: number,
    name: string,
    rawDamage: number,
    damageType: DamageType
}

function f(name: string, code, levelSync: number, ...events: CombatEvent): Fight {
    return {name, code, levelSync, events}
}

function e(timestamp: number, name: string, rawDamage: number = 0, damageType: DamageType = "AVOIDABLE") {
    return {timestamp, name, rawDamage, damageType}
}

export const fights: Fight[] = [
    f("Black Cat (M1S)", "M1S", 100,
        e(0, "Start of Fight"),
        e(15, "Quadruple Crossing", 130000, "PHYSICAL"),
        e(18, "Quadruple Crossing", 130000, "PHYSICAL"),
        e(21, "Quadruple Crossing"),
        e(24, "Quadruple Crossing"),
        e(33, "Biscuit Maker", 330000, "PHYSICAL"),
        e(35, "Biscuit Maker", 330000, "PHYSICAL")
    ),
    f("Honey B. Lovely (M2S)", "M2S", 100)
]

fights.byCode = (code) => fights.find((f) => f.code === code)