use geo::algorithm::Offset;
use geo_types::{line_string, Geometry, LineString};
use warp::Filter;
use wkt::{ToWkt, TryFromWkt};

use serde;

#[derive(serde::Deserialize, Debug)]
pub struct QueryParameters {
    pub wkt: String,
    pub offset: f64,
}

#[tokio::main]
async fn main() {
    // GET /hello/warp => 200 OK with body "Hello, warp!"

    let ls = line_string![
        (x:0.0,y:1.1),
        (x:3.0,y:8.1),
        (x:2.0,y:5.1),
        (x:1.5,y:3.0),
    ];

    let hello = warp::get().and(warp::query()).and(warp::path::end()).map(
            move |query: QueryParameters| match LineString::try_from_wkt_str(query.wkt.as_str()) {
                Ok(ls) => ls.offset(query.offset).to_wkt().to_string(),
                Err(_) => "ERROR".into(),
            },
        ).or(warp::fs::dir("./static/"));

    warp::serve(hello).run(([0, 0, 0, 0], 3030)).await;
}
