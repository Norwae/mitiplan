const Papa = require("papaparse")

export class Fight {
    name: string
    code: string
    levelSync: number

    constructor(name, code, levelSync) {
        this.name = name
        this.code = code
        this.levelSync = levelSync

        this.eventualEvents = loadEvents(code)
    }

    async events(): Promise<CombatEvent[]> {
        return await this.eventualEvents
    }
}

const parseTimestamp = (str: string): number => {
    const [first, second] = str.split(":")
    return parseInt(first) * 60 + parseInt(second)
}

const parseDamageType = (str: string): DamageType => str === "Magical" ? "MAGIC" :
    str === "Physical" ? "PHYSICAL" :
        str === "Special" ? "SPECIAL" :
            "AVOIDABLE"

async function loadEvents(code: string): Promise<CombatEvent[]> {
    return new Promise((resolve, reject) => {

        let rows = []

        const step = ({data}) => {
            rows.push({
                timestamp: parseTimestamp(data.Time),
                name: data.Attack,
                rawDamage: parseInt(data.Damage.replace(",", "")),
                damageType: parseDamageType(data.Type)
            })
        }

        const complete = () => {
            if (!rows[0] || rows[0].timestamp > 0) {
                rows = [{
                    timestamp: 0,
                    name: "Pre-Pull",
                    rawDamage: 0,
                    damageType: "AVOIDABLE"
                }].concat(rows)
            }

            resolve(rows)
        }


        Papa.parse("/" + code + ".csv", {
            download: true,
            header: true,
            step,
            complete,
            error: reject
        })
    }).then(data => {
        console.log(data)
        return data
    })

}

export type DamageType = "MAGIC" | "PHYSICAL" | "SPECIAL" | "AVOIDABLE"

export interface CombatEvent {
    timestamp: number,
    name: string,
    rawDamage: number,
    damageType: DamageType
}

export const fights: Fight[] = [
    new Fight("Black Cat (M1S)", "M1S", 100),
    new Fight("Honey B Lovely (M2S)", "M2S", 100),
    new Fight("Brute Bomber (M3S)", "M3S", 100),
    new Fight("Wicked Thunder (M4S)", "M4S", 100)
]

fights.byCode = (code) => fights.find((f) => f.code === code)

