use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Copy, Clone, Eq, PartialEq)]
pub enum JobCode {
    DRK, GNB, PLD, WAR,
    AST, SCH, SGE, WHM,
    DRG, MKN, NIN, RPR, SAM, VPR,
    BLM, RDM, PIC, SMN,
    BRD, MCH, DNC
}

#[derive(Deserialize, Debug)]
pub enum Operation {
    Lookup(String),
    Store(FightModel),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FightModel {
    pub key: Option<String>,
    code: String,
    actions: Vec<CombatAction>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CombatAction {
    code: String,
    timestamp: i32,
    by: JobCode
}

#[cfg(test)]
mod test {
    use crate::model::{JobCode, Operation};

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
        let result: serde_json::Result<Operation> = serde_json::from_str(r#"{"Store": {"code": "M1S", "actions": [{"code": "fnt", "by": "VPR", "timestamp": 0}]}}"#);
        if let Ok(Operation::Store(fm)) = &result {
            assert_eq!("M1S", fm.code);
            assert_eq!("fnt", fm.actions[0].code);
            assert_eq!(JobCode::VPR, fm.actions[0].by);
            assert_eq!(0, fm.actions[0].timestamp)
        } else {
            panic!("{:?}", result)
        }
    }
}