import "./Map.css"
import React, { useRef, useState, useEffect, useCallback } from "react"

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import LayersWrapper from "./LayersWrapper"

interface IMapSideBySide {
  mainLayersIds: string[]
  secondLayersIds: string[]
  timeStamp: number
  onClick: any
  fillOpacity: number
  strokeOpacity: number

}

const MapSideBySide: React.FC<IMapSideBySide> = (props) => {

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const beforeRef = useRef<HTMLDivElement | null>(null)
  const afterRef = useRef<HTMLDivElement | null>(null)

  const [beforeMap, setBeforeMap] = useState<mapboxgl.Map | null>(null)
  const [afterMap, setAfterMap] = useState<mapboxgl.Map | null>(null)

  const [activeMap, setActiveMap] = useState<'before' | 'after' | null>(null)

  const [center, setCenter] = useState<mapboxgl.LngLat>(new mapboxgl.LngLat(0, 0))
  const [zoom, setZoom] = useState<number>(0)

  const onMove = useCallback((center:any, zoom:number) => {setCenter(center); setZoom(zoom)}, [])

  useEffect(() => {
    if (!mapContainerRef.current || !beforeRef.current || !afterRef.current) return
   
    const before = new mapboxgl.Map({
      container: beforeRef.current,
      style: "mapbox://styles/mapbox/standard-satellite",//'mapbox://styles/mapbox/light-v11',
      center: [-89.129879, 40.092361],
        zoom: 6,
    });

    const after = new mapboxgl.Map({
        container: afterRef.current,
        style: "mapbox://styles/mapbox/standard-satellite",//'mapbox://styles/mapbox/dark-v11',
        center: [-89.129879, 40.092361],
        zoom: 6,
    });

    setBeforeMap(before)
    setAfterMap(after)

    return () =>{
      before.remove()
      after.remove()
    
    }

},[])

useEffect(() => {

  if(!beforeMap || !afterMap) return

  beforeMap.on("movestart", (e:any) => { 
    if(e.originalEvent instanceof MouseEvent) {
      // console.log("before started")
      const _center = beforeMap.getCenter()
      const _zoom = beforeMap.getZoom()
      // console.log("activeMap === before", "before is moving")
      onMove(_center, _zoom)
      setActiveMap('before')
    
    }
  
  })
  afterMap.on("movestart", (e:any) => { 
    if(e.originalEvent instanceof MouseEvent) {
      // console.log("after started")
      const _center = afterMap.getCenter()
      const _zoom = afterMap.getZoom()
      // console.log("activeMap === right", "after is moving")
      onMove(_center, _zoom)
      setActiveMap('after')
    }
  })

  
  beforeMap.on("moveend", (e:any) => { if(e.originalEvent instanceof MouseEvent) {console.log("before ended"); setActiveMap(null)}})
  afterMap.on("moveend", (e:any) => { if(e.originalEvent instanceof MouseEvent) {console.log("after ended"); setActiveMap(null)}})


},[beforeMap, afterMap])

useEffect(() => {

  if(!beforeMap || !afterMap) return

  beforeMap.on("move", () => {
    if(activeMap === "before") {
      const _center = beforeMap.getCenter()
      const _zoom = beforeMap.getZoom()
      console.log("activeMap === before", "before is moving")
      onMove(_center, _zoom)
    } 
  })

  afterMap.on("move", () => {
    if(activeMap === "after") {
      const _center = afterMap.getCenter()
      const _zoom = afterMap.getZoom()
      console.log("activeMap === after", "after is moving")
      onMove(_center, _zoom)
    } 
  })

},[beforeMap, afterMap, activeMap])

useEffect(() => {

  if(!beforeMap || !afterMap) return

  if(activeMap === 'before') {
    console.log("after is flying")
    afterMap.jumpTo({ center, zoom })

  } else

  if(activeMap === 'after') {
    console.log("before is flying")
    beforeMap.jumpTo({ center, zoom })
  }

},[beforeMap, afterMap, activeMap, center, zoom])

return(
  <div className="map-container" ref={mapContainerRef}>
    <div id="before-map" style={{position: 'absolute', width:"50%", height: '100%', zIndex:1}} ref={beforeRef}></div>
    <div id="after-map" style={{position: 'absolute', left:"50%", width:"50%", height: '100%', zIndex:1}} ref={afterRef}></div>
    {beforeMap && <LayersWrapper map={beforeMap} mainLayersIds={props.mainLayersIds} timeStamp={props.timeStamp} onClick={props.onClick} fillOpacity={props.fillOpacity} strokeOpacity={props.strokeOpacity}/>}
    {afterMap && <LayersWrapper map={afterMap} mainLayersIds={props.secondLayersIds} timeStamp={props.timeStamp} onClick={props.onClick} fillOpacity={props.fillOpacity} strokeOpacity={props.strokeOpacity}/>}

  </div>
)

}

export default MapSideBySide