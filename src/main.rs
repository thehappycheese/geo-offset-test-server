use geo::algorithm::OffsetCurve;
use geo_types::{line_string, LineString};
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

    let offset_curve = warp::path("offset_curve").and(warp::query()).and(warp::path::end()).map(
            move |query: QueryParameters| match LineString::try_from_wkt_str(query.wkt.as_str()) {
                Ok(ls) => match ls.offset_curve(query.offset){
                    Some(ols)=>ols.to_wkt().to_string(),
                    None=>"ERROR".into()
                },
                Err(_) => "ERROR".into(),
            },
        );
    //let static_directory = warp::fs::dir("./static/");
    warp::serve(
        warp::get().and(offset_curve)
        //.or(static_directory)
    ).run(([0, 0, 0, 0], 3030)).await;
}
