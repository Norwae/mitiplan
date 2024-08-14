use std::collections::HashMap;
use std::str::FromStr;
use base64::Engine;
use lazy_static::lazy_static;
use rusoto_core::{Region, RusotoError};
use rusoto_dynamodb::{AttributeValue, DynamoDb, DynamoDbClient, GetItemInput, PutItemError, PutItemInput};
use postcard::to_stdvec;
use ring::digest;
use base64::engine::general_purpose::STANDARD;
use bytes::Bytes;
use lambda_http::{Body, Request, Response, service_fn};
use lambda_http::http::StatusCode;
use lambda_runtime::Error;
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
    lambda_http::run(func).await
}

const BINARY_DATA: &'static str = "binary_data";
const KEY: &'static str = "key";


async fn handle(evt: Request) -> Result<Response<Body>, Error> {
    let mut status = StatusCode::OK;
    let mut body: Option<FightModel> = None;
    let client = &*DYNAMO_CLIENT;
    let payload = decode_operation(evt);

    match payload {
        Ok(Operation::Lookup(key)) => {
            let found = perform_load(client, key).await?;

            match found {
                Some(loaded) => body = Some(loaded),
                None => status = StatusCode::NOT_FOUND
            }
        }
        Ok(Operation::Store(mut model)) => {
            model.normalize();
            let model = model.validate();

            match model {
                Some(mut model) => {
                    perform_save(client, &mut model).await?;
                    body = Some(model)
                }
                None => {
                    status = StatusCode::BAD_REQUEST;
                    println!("Invalid input received and dropped")
                }
            }
        },
        Err(error) => {
            status = StatusCode::BAD_REQUEST;
            println!("Error decoding request: {}", error)
        }
    }

    let body = if let Some(fight) = body {
        Body::Binary(serde_json::to_vec(&fight)?)
    } else {
        Body::Empty
    };

    Ok(Response::builder().status(status).body(body).unwrap())
}

fn decode_operation(evt: Request) -> Result<Operation, Error> {
    let payload = match evt.body() {
        Body::Empty => serde_json::from_str::<Operation>(""),
        Body::Text(string) => serde_json::from_str(string),
        Body::Binary(bytes) => serde_json::from_slice(bytes)
    }?;
    Ok(payload)
}

async fn perform_load(client: &DynamoDbClient, key: String) -> Result<Option<FightModel>, Error> {
    let found = client.get_item(GetItemInput {
        table_name: DYNAMO_TABLE_NAME.clone(),
        attributes_to_get: Some(vec![BINARY_DATA.to_string()]),
        key: map_with_key(key.clone()),
        ..Default::default()
    }).await?;

    let loaded = if let Some(model) = found.item {
        println!("Loaded item with key {}", &key);
        let mut model: FightModel = postcard::from_bytes(model.get(BINARY_DATA).expect(BINARY_DATA).b.as_ref().expect("present").as_ref()).expect("data valid");
        model.key = Some(key);
        Some(model)
    } else {
        println!("Key {} not found", &key);
        None
    };

    Ok(loaded)
}

async fn perform_save(client: &DynamoDbClient, model: &mut FightModel) -> Result<(), Error> {
    let serialized = to_stdvec(&model).expect("can serialize");
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
        println!("Duplicate store eliminated");
    } else {
        let _ = result?;
    }
    Ok(())
}

fn map_with_key(key: String) -> HashMap<String, AttributeValue> {
    let mut item = HashMap::new();
    item.insert(KEY.to_string(), AttributeValue {
        s: Some(key),
        ..Default::default()
    });
    item
}

