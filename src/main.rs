use std::collections::HashMap;
use std::str::FromStr;
use base64::Engine;
use lambda_runtime::{Error, LambdaEvent, service_fn};
use lazy_static::lazy_static;
use rusoto_core::{Region, RusotoError};
use rusoto_dynamodb::{AttributeValue, DynamoDb, DynamoDbClient, GetItemInput, PutItemError, PutItemInput};
use postcard::to_stdvec;
use ring::digest;
use base64::engine::general_purpose::STANDARD;
use bytes::Bytes;
use crate::model::{FightModel, Operation};

mod model;

lazy_static! {
    static ref DYNAMO_CLIENT: DynamoDbClient = DynamoDbClient::new(region());
    static ref DYNAMO_TABLE_NAME: String = std::env::var("DYNAMO_TABLE_NAME").expect("Table name provided");
}

fn region() -> Region {
    let region = std::env::var("AWS_REGION").expect("AWS_REGION provided by runtime");
    Region::from_str(&region).expect("Region sensible")
}


#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = service_fn(handle);
    lambda_runtime::run(func).await
}

const BINARY_DATA: &'static str = "binary_data";
const KEY: &'static str = "key";

async fn handle(evt: LambdaEvent<Operation>) -> Result<Option<FightModel>, Error> {
    let client = &*DYNAMO_CLIENT;
    match evt.payload {
        Operation::Lookup(key) => {
            let found = client.get_item(GetItemInput {
                table_name: DYNAMO_TABLE_NAME.clone(),
                attributes_to_get: Some(vec![BINARY_DATA.to_string()]),
                key: map_with_key(key.clone()),
                ..Default::default()
            }).await?;


            if found.item.is_none() {
                println!("Key {} not found", &key);
            }

            let model = found.item.map(|found| {
                println!("Loaded item with key {}", &key);
                let mut model: FightModel = postcard::from_bytes(found.get(BINARY_DATA).expect(BINARY_DATA).b.as_ref().expect("present").as_ref()).expect("data valid");
                model.key = Some(key);
                model
            });

            Ok(model)
        }
        Operation::Store(mut model) => {
            model.normalize();

            let mut model = model.validate();
            if let Some(model) = &mut model {
                let serialized = to_stdvec(model).expect("can serialize");
                let hash = digest::digest(&digest::SHA256, &serialized);
                let key = STANDARD.encode(hash);
                model.key = Some(key.clone());

                let mut item = map_with_key(key);
                item.insert(BINARY_DATA.to_string(), AttributeValue {
                    b: Some(Bytes::from(serialized)),
                    ..Default::default()
                });
                let result = client.put_item(PutItemInput {
                    condition_expression: Some(format!("attribute_not_exists({})", BINARY_DATA)),
                    table_name: DYNAMO_TABLE_NAME.clone(),
                    item,
                    ..Default::default()
                }).await;
                if let Err(RusotoError::Service(PutItemError::ConditionalCheckFailed(_))) = result {
                    // already loaded, is okay
                    println!("Duplicate store eliminated")
                } else {
                    let _ = result?;
                }
            }
            Ok(model)
        }
    }
}

fn map_with_key(key: String) -> HashMap<String, AttributeValue> {
    let mut item = HashMap::new();
    item.insert(KEY.to_string(), AttributeValue {
        s: Some(key),
        ..Default::default()
    });
    item
}

