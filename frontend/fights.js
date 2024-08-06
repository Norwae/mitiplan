export interface Fight {
    name: string,
    levelSync: number,
    events: CombatEvent[]
}

export type DamageType = "MAGIC" | "PHYSICAL" | "SPECIAL" | "NONE" | "AVOIDABLE"

export interface CombatEvent {
    timestamp: number,
    name: string,
    rawDamage: number,
    damageType: DamageType
}

function f(name: string, levelSync: number, ...events: CombatEvent): Fight {
    return {name, levelSync, events}
}

function e(timestamp: number, name: string, rawDamage: number = 0, damageType: DamageType = "AVOIDABLE") {
    return {timestamp, name, rawDamage, damageType}
}

export const fights: Fight[] = [
    f("Black Cat (M1S)", 100,
        e(15, "Quadruple Crossing", 130000, "PHYSICAL"),
        e(18, "Quadruple Crossing", 130000, "PHYSICAL"),
        e(21, "Quadruple Crossing"),
        e(24, "Quadruple Crossing"),
        e(33, "Biscuit Maker", 330000, "PHYSICAL"),
        e(35, "Biscuit Maker", 330000, "PHYSICAL")
    ),
    f("Honey B. Lovely (M2S)", 100)
]