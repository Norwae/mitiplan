const Papa = require("papaparse")

export class Fight {
    name: string
    code: string
    levelSync: number

    constructor(name, code, levelSync) {
        this.name = name
        this.code = code
        this.levelSync = levelSync
    }

    async events(): Promise<CombatEvent[]> {
        if (!this.eventualEvents) {
            this.eventualEvents = loadEvents(this.code)
        }

        return await this.eventualEvents
    }
}

const parseTimestamp = (str: string): number => {
    const [first, second] = str.split(":")
    return parseInt(first) * 60 + parseInt(second)
}

const parseDamageType = (str: string): DamageType => str === "Magical" ? "MAGICAL" :
    str === "Physical" ? "PHYSICAL" :
        str === "Special" ? "SPECIAL" :
            "AVOIDABLE"

async function loadEvents(code: string): Promise<CombatEvent[]> {
    return new Promise((resolve, error) => {

        let rows = []

        const step = ({data}) => {
            const {Time, Attack, Damage, Type} = data
            const timestamp = parseTimestamp(Time);
            const rawDamage = parseInt(Damage.replaceAll(",", ""));
            const damageType = parseDamageType(Type);

            if (rows.length && rows[rows.length -  1].timestamp === timestamp) {
                console.log("Clashing timestamp, dropping " + JSON.stringify(data))
            } else {
                rows.push({
                    timestamp,
                    rawDamage,
                    damageType,
                    name: Attack
                })
            }
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
            error
        })
    })

}

export type DamageType = "MAGICAL" | "PHYSICAL" | "SPECIAL" | "AVOIDABLE"

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

