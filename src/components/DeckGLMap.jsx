import React from 'react'
import DeckGL from '@deck.gl/react'
import { LineLayer } from '@deck.gl/layers'
import { Map } from 'react-map-gl'
import { MAP_API } from '../App..config'
import 'mapbox-gl/dist/mapbox-gl.css'

const data = [
    {
        sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]
    }
]

class DeckGLMap extends React.PureComponent {

    state = {
        initial_view_state : {
            longitude: -122.41669,
            latitude: 37.7853,
            zoom: 13,
            pitch: 0,
            bearing: 0
        },
        layers: null
    }

    componentDidMount(){
        this._createLayer()
    }

    _createLayer(){
        const layers = [
            new LineLayer({id: 'line-layer', data})
        ]
        this.setState({layers})
    }

    render() {
        const { initial_view_state, layers } = this.state
        return(
            <div style={{width:'100vw', height:'100vh'}}>
                <DeckGL
                    initialViewState={initial_view_state}
                    controller={true}
                    layers={layers} 
                >
                    <Map 
                        mapboxAccessToken={ MAP_API.MAPBOX_ACCESS_TOKEN[0] } 
                        mapStyle = { MAP_API.STYLES[0].uri }
                    />
                </DeckGL>
            </div>
        )
    }
}

export default DeckGLMap;