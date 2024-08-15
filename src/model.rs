use serde::{Deserialize, Serialize};

#[allow(non_camel_case_types)]
#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Copy, Clone)]
pub enum FightCode {
    M1S, M2S, M3S, M4S,
    TEA_PHASE_1, TEA_PHASE_2, TEA_PHASE_3, TEA_PHASE_4,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Copy, Clone)]
pub enum JobCode {
    DRK, GNB, PLD, WAR,
    AST, SCH, SGE, WHM,
    DRG, MNK, NIN, RPR, SAM, VPR,
    BLM, RDM, PCT, SMN,
    BRD, MCH, DNC
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
struct Ability {
    job: JobCode,
    level: u8
}

#[derive(Deserialize, Debug)]
pub enum Operation {
    Lookup(String),
    Store(FightModel),
}


#[derive(Debug, Serialize, Deserialize)]
pub struct CombatAction {
    ability: Ability,
    timestamp: u16
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FightModel {
    pub key: Option<String>,
    code: FightCode,
    party: Vec<JobCode>,
    actions: Vec<CombatAction>
}

impl FightModel {
    pub fn normalize(&mut self) {
        self.key = None;
        self.party.sort_by_key(|job| *job as u32);
        self.actions.sort_by_key(|obj|
            obj.timestamp as u32 * 100000 +
                obj.ability.job as u32 * 1000 +
                obj.ability.level as u32
        )
    }

    pub fn validate(self) -> Option<Self> {
        if self.actions.len() > 1000 {
            return None
        }

        if self.party.len() > 8 {
            return None
        }

        return Some(self)
    }
}

#[cfg(test)]
mod test {
    use crate::model::{Ability, CombatAction, FightCode, FightModel, JobCode, Operation};

    #[test]
    fn read_lookup() {
        let result: serde_json::Result<Operation> = serde_json::from_str(r#"{"Lookup": "foobar"}"#);

        if let Ok(Operation::Lookup(s)) = &result {
            assert_eq!("foobar", s)
        } else {
            panic!("{:?}", result)
        }
    }

    #[test]
    fn read_store(){
        let result: serde_json::Result<Operation> = serde_json::from_str(r#"{"Store": {"code": "M1S", "actions": [{"ability": {"job": "VPR", "level": 50}, "timestamp": 0}]}}"#);
        if let Ok(Operation::Store(fm)) = &result {
            assert_eq!(FightCode::M1S, fm.code);
            assert_eq!(Ability {
                job: JobCode::VPR,
                level: 50,
            }, fm.actions[0].ability);
            assert_eq!(0, fm.actions[0].timestamp)
        } else {
            panic!("{:?}", result)
        }
    }

    #[test]
    fn compact_serialization() {
        let vec = postcard::to_stdvec(&FightModel{
            key: None,
            code: FightCode::M1S,
            actions: vec![
                CombatAction {
                    ability: Ability {
                        job: JobCode::BRD,
                        level: 8
                    },
                    timestamp: 300
                }, CombatAction {
                    ability: Ability {job: JobCode::DRK, level: 50},
                    timestamp: 180,
                }, CombatAction {
                    ability: Ability {job: JobCode::WAR, level: 42},
                    timestamp: 180,
                }
            ]
        }).expect("vectorize");

        assert!(vec.len() < 100)
    }
}