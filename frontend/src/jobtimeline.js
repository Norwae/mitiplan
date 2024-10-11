import type {CombatAction} from "./fightgrid";
import type {Ability} from "./jobs";

export default class JobTimeline {
    actions: CombatAction[]
    job: Job
    level: number
    abilities: Ability[]

    constructor(job: Job, level: number, actions?: CombatAction[]) {
        this.actions = (actions || []).filter(({by}) => by === job.code)
        this.job = job
        this.level = level

        const learned = job.actions
            .filter(action => action.atLevel <= level)
        this.abilities = learned.map(action => {
            while (action.evolution) {
                if (action.evolution.atLevel > level) {
                    return action
                }

                action = action.evolution
            }
            return action
        })

    }

    isEqual(other: JobTimeline) {
        return other.job.code === this.job.code &&
            other.actions.length === this.actions.length &&
            other.actions.reduce((acc, action, idx) => acc && this.actions[idx].isEqual(action), true)
    }

    availableAbilities(atTimestamp: number): Ability[] {
        return this.abilities.filter(jobAbility => {
            const found = this.actions.filter(({timestamp, ability}) => {
                const deltaT = timestamp - atTimestamp
                return jobAbility === ability && deltaT >= -jobAbility.cooldownSeconds && deltaT <= jobAbility.cooldownSeconds
            }).length

            return jobAbility.charges > found
        })
    }

    actionsAt(atTimestamp: number) {
        return this.actions.filter(({timestamp}) => timestamp === atTimestamp)
    }

}