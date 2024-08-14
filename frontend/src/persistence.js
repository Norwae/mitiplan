import {CombatAction} from "./fightgrid";
import type {Fight} from "./fights";
import {Job, jobs} from "./jobs";
import {fights} from "./fights";

const backend = " https://oyw5rhxoy4.execute-api.us-east-1.amazonaws.com/mitisheet-backend"

export class PersistenceModel {
    party: Job[]
    actions: CombatAction[]
    fight: Fight

    constructor(party: Job[], actions: CombatAction[], fight: Fight) {
        this.party = party
        this.actions = actions
        this.fight = fight
    }

    async store(): Promise<string> {
        const body = {
            "Store": {
                code: this.fight.code,
                party: this.party.map(({code}) => code),
                actions: this.actions.map(({timestamp, by, ability}) => ({
                    timestamp, ability: {
                        job: by, level: ability.atLevel
                    }
                }))
            }
        }
        await fetch(backend, {
            method: "POST", body: JSON.stringify(body)
        })
        const txt = await response.text();

        return JSON.parse(txt).key
    }

    static async load(plan: string): Promise<PersistenceModel> {
        const response = await fetch(backend, {
            method: "POST", body: `{"Lookup": "${plan}"}`
        });
        const txt = await response.text();
        let {code, actions, party} = JSON.parse(txt);
        actions = actions.map(({timestamp, ability}) => {
            let job = jobs.byCode(ability.job)
            return new CombatAction(timestamp, job.code, job.findAction(ability.level));
        })
        party = party.map(it => jobs.byCode(it))
        let fight = fights.byCode(code);
        return new PersistenceModel(party, actions, fight)
    }
}