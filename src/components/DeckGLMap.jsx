import React from 'react'
import DeckGL from '@deck.gl/react'
import { IconLayer } from '@deck.gl/layers'
import Map, {useControl} from 'react-map-gl';
import { MAP_API } from '../App..config'
import 'mapbox-gl/dist/mapbox-gl.css'
import AutoComplete from './common/AutoComplete'
import { Box, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

function DrawControl(props) {
  useControl(() => new MapboxDraw(props), {
    position: props.position
  });

  return null;
}

class DeckGLMap extends React.PureComponent {

    state = {
        initial_view_state : {
            longitude: 90.39017821904588,
            latitude: 23.719800220780733,
            zoom: 16,
            pitch: 0,
            bearing: 0
        },
        layers: null,
        addressList: [],
        selectedAddress: {}
    }

    componentDidMount(){
        this._createLayer()
    }

    componentDidUpdate(prevProps, prevState){
        const { selectedAddress } = this.state
        if (prevState.selectedAddress !== selectedAddress){
            this._createLayer()
        }
    }

    _getPointColor(value){
        let color = [255, 140, 0]
        switch(value) {
            case "Chawk Bazar":
                color = [ 220,20,60 ]
                break;
            case 'Lalbagh':
                color = [ 123, 104, 238 ]
                break;
            case "Kotwali":
                color = [ 123, 120, 238 ]
                break;
            default:
              color = [255, 140, 0]
        }
        return color
    }

    _createLayer(){
        const { selectedAddress } = this.state
        const layers = [
            // new LineLayer({id: 'line-layer', data}),
            new IconLayer({
                id: 'icon-layer',
                data: [ selectedAddress ],
                pickable: true,
                // iconAtlas and iconMapping are required
                // getIcon: return a string
                iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
                iconMapping: ICON_MAPPING,
                getIcon: d => 'marker',
            
                sizeScale: 15,
                getPosition: d => ([ d?.longitude, d?.latitude]),
                getSize: d => 5,
                getColor: d => [Math.sqrt(d.exits), 140, 0]
              }),
            // new ScatterplotLayer({
            //     id: 'scatterplot-layer',
            //     data: filterCctvData,
            //     pickable: true,
            //     opacity: 0.8,
            //     stroked: true,
            //     filled: true,
            //     radiusScale: 4,
            //     radiusMinPixels: 1,
            //     radiusMaxPixels: 100,
            //     lineWidthMinPixels: 1,
            //     getPosition: d => ([ d.longitude, d.latitude]),
            //     getRadius: d => Math.sqrt(d.exits),
            //     getFillColor: d => this._getPointColor(d?.thana),
            //     getLineColor: d => [0, 0, 0]
            // })
        ]
        this.setState({layers})
    }

    _handleAutoCompInputChange = e => {
        const inputAddress = e?.target?.value
        if(inputAddress && inputAddress.length){
            this._handleAddressList(inputAddress)
        } else {
            this.setState( { 
                selectedAddress: {},
                addressList: []
            }) 
        }
    }

    // handleAutoCompChange
    _handleAutoCompChange = (e, value) => {
        if( value && Object.keys(value).length){
            this.setState( preState => ({ 
                selectedAddress: value,
                initial_view_state: {
                    ...preState.initial_view_state,
                    latitude: value.latitude,
                    longitude: value.longitude
                }
            })) 
        }
    }

    _handleAddressList = (value) => {
        const autocompleteUrl = `http://elastic.bmapsbd.com/obd/search/hotels/test?q=${value}`
        if (value && value.length){
            fetch(autocompleteUrl)
            .then( res => res.json())
            .then( res => {
                const addressList =  res.places
                // console.log({address:addressList[0]})
                this.setState({ addressList: addressList })
            })
        }
    }
    _handleOnCreate(){
        console.log('handle on create !')
    }
    // {
    //     "Address": "M&M, España",
    //     "city": "Felanich",
    //     "country": "España",
    //     "county": "Migjorn",
    //     "latitude": 39.420082,
    //     "longitude": 3.27203,
    //     "name": "M&M",
    //     "postcode": "07670",
    //     "state": "Illes Balears",
    //     "street": null
    // }
    render() {
        const { initial_view_state, layers, thana, addressList, selectedAddress } = this.state
        const { _handleChange, _handleAutoCompInputChange, _handleAutoCompChange, _handleOnCreate } = this
        return(
            <div style={{display:'flex',flexDirection:'row', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex',flexDirection:'column', minWidth:'25%'}}>
                    <Box sx={{ 
                        display:'flex', 
                        alignItems:'center',
                        justifyContent:'center',
                        p:2,
                        m:1, 
                        boxShadow:'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
                    }}>
                        <AutoComplete 
                            _handleAutoCompInputChange={_handleAutoCompInputChange} 
                            _handleAutoCompChange = {_handleAutoCompChange} 
                            value={selectedAddress} 
                            filterOptions={ addressList } 
                            disableUnderline={true}
                            variant="standard"
                            clearOnBlur={ false } 
                            title={"Address"}
                            fieldStyle={{width:'95%'}}
                        />
                        <SearchIcon sx={{color:'green', fontSize:'28px',pr:'5px'}}  size="inherit" />
                    </Box>
                    
                    { (selectedAddress && Object.keys(selectedAddress).length)?  
                         <Box 
                            sx={{ display:'flex', flexDirection:'column',p:2}}
                         >
                            <Typography variant='h5'>{ selectedAddress?.Address?.split(',')[0] ?? '' }</Typography>
                            <Typography ><span style={{fontWeight:600}}>Address:</span> { selectedAddress?.Address ?? '' }</Typography>
                            <Typography ><span style={{fontWeight:600}}>Country:</span> { selectedAddress?.country ?? '' }</Typography>
                            <Typography ><span style={{fontWeight:600}}>Post Code:</span>  { selectedAddress?.postcode ?? '' }</Typography>
                        </Box>
                        :''
                    }
                </div>
                <div 
                    style={{
                        display:'flex', 
                        width:'75%',
                        position: "relative"
                    }}
                >
                    {/* <DeckGL
                        initialViewState={initial_view_state}
                        controller={true}
                        layers={layers} 
                        width={"100%"} 
                        height={"100vh"}
                        sx={{position:'relative',border:'1px solid red'}}
                    /> */}
                    <Map 
                        initialViewState={initial_view_state}
                        mapboxAccessToken={ MAP_API.MAPBOX_ACCESS_TOKEN[0] } 
                        mapStyle = { MAP_API.STYLES[3].uri }
                    >
                        <DrawControl
                            onCreate = { _handleOnCreate }
                            position="top-left"
                            displayControlsDefault={false}
                            controls={{
                            polygon: true,
                            trash: true
                            }}
                        />
                    </Map>

                </div>
            </div>
        )
    }
}

export default DeckGLMap;