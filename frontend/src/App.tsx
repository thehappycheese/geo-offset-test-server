import React, { useState } from "react";
import {NodeCanvas, ShapeList}  from './components/';
import Vector2 from "./util/Vector2";
import { parse_wkt, points_to_wkt } from "./util/wkt_tools";


type GeometryType = ({
  type: "Point",
  coordinates: Vector2
} | {
  type: "MultiPoint" | "LineString",
  coordinates: Vector2[]
} | {
  type: "Polygon" | "MultiLineString",
  coordinates: Vector2[][]
});

interface ViewTransform {
  center:Vector2,
  scale:number,
}


type GlobalStateType = {
  mode: "edit",
  objects: Record<string, GeometryType>
  selected_object: string | null,
  view_transform: ViewTransform
}


const initial_state: GlobalStateType = {
  mode: "edit",
  objects: {
    "initial": {
      type: "LineString",
      coordinates: [new Vector2(0, 0), new Vector2(1, 1)]
    }
  },
  selected_object: "initial",
  view_transform:{
    center:new Vector2(),
    scale:1
  }
}

async function rpc_offset(points:Vector2[], offset:number) {
  if (points.length < 2) {
      return [];
  }
  let ls_wkt = points_to_wkt(points);
  console.log(ls_wkt)
  let response = await fetch(
    "offset_curve/?" + new URLSearchParams({
      wkt: ls_wkt,
      offset: offset.toString(),
    })
  )
  let offset_ls_wkt = await response.text()
  console.log(offset_ls_wkt)
  return parse_wkt(offset_ls_wkt)
}



function App() {
  let [points, set_points] = useState([new Vector2(10,10), new Vector2(20,20), new Vector2(20,40)])

  return (
    <>
      <div id="left">
        <h1>Geo Tester</h1>
        <div>
          <ShapeList items={["a","b","c"]}/>
        </div>
      </div>
      <div id="canvas-container">
        <NodeCanvas
        points={points}
        set_points={set_points}
        />
      </div>
    </>
  );
}

export default App;
