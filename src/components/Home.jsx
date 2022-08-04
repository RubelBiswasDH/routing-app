import React from 'react'
import { IconLayer } from '@deck.gl/layers'
import Map, { useControl, Marker, Source, Layer, Popup } from 'react-map-gl'
import { MAP_API, API } from '../App..config'
import StyledSnackBar from './common/StyledSnackBar'
import Autocomplete from './common/AutoComplete'
import { Box, Typography, LinearProgress, Button } from '@mui/material'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import markerIcon from '../assets/marker--v1'
import blueIcon from '../assets/blue-icon'
import redIcon from '../assets/marker--v1'
import commercialIcon from '../assets/commercial'
import educationIcon from '../assets/education'
import healthcareIcon from '../assets/healthcare'
import residentialIcon from '../assets/residential'
import { convertSecondsToTime } from '../utils/utils'
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};
const layerStyle = {
    'id': 'route',
    'type': 'line',
    'source': 'route',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': '#ff0000',
        'line-width': 5
    }
}

function DrawControl(props) {
  useControl(
    (map) => {
        map.map.on('draw.create', props.onCreate)
        map.map.on('draw.update', props.onUpdate)
        map.map.on('draw.delete', props.onDelete)
        return new MapboxDraw(props)
    },
    {
        position: props.position
    }
  );

  return null
}

class Home extends React.PureComponent {
    state = {
        initial_view_state : {
            longitude: 90.39017821904588,
            latitude: 23.719800220780733,
            zoom: 10,
            pitch: 0,
            bearing: 0
        },
        layers: null,
        addressList: [],
        selectedAddress: {},
        selectedType: '',
        apiUrl:'',
        isToastOpen:false,
        toastMessage: '',
        disableSelect: false,
        dataLoading: false,
        start_address: {},
        end_address: {},
        route_info: null,
        lineData: null,
        geoJson: null,
        markerData : {},
        showPopup : true
    }

    componentDidMount(){
        this._createLayer()
    }

    componentDidUpdate(prevProps, prevState){
        const { selectedAddress, selectedType, apiUrl, start_address, end_address, lineData } = this.state

        if (
            ( 
                start_address?.geo_location?.length && end_address?.geo_location?.length
            )
            && (
                prevState.start_address?.geo_location !== start_address?.geo_location || prevState?.end_address?.geo_location !== end_address?.geo_location
            )
        ){  
            this._hangleGetLine(start_address?.geo_location, end_address?.geo_location)
            this.setState(preState => ({
                ...preState.initial_view_state,
                zoom: 8,
                longitude:start_address?.geo_location?.longitude,
                latitude:start_address?.geo_location?.latitude
            }))
        }
    }

    _renderGeoJson = (lineData) => {
        const geoJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature', 
                    geometry: lineData
                }
            ]
          }
        this.setState({ geoJson: geoJson })

    }

    _removeGeoJson = () => {
        this._renderGeoJson(null)
    }

    _getPointColor(value){
        let color = [255, 140, 0]
        switch(value) {
            case "Chawk Bazar":
                color = [ 220,20,60 ]
                break
            case 'Lalbagh':
                color = [ 123, 104, 238 ]
                break
            case "Kotwali":
                color = [ 123, 120, 238 ]
                break
            default:
                color = [255, 140, 0]
        }
        return color
    }

    _createLayer(){
        const { selectedAddress } = this.state
        const layers = [
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
            })
        ]
        this.setState({layers})
    }

    _handleUpdateAddress = (addressList) => {
        this.setState({ addressList: addressList })
    }

    _handleOnCreate = ({features}) => {
        const { selectedType } = this.state
        const coordinates = features[0]?.geometry?.coordinates[0]
        let areaQueryStr = ''
        let count = 0

        for(let i of coordinates){
            count+=1
            areaQueryStr+= `${i[0]}%20${i[1]}`
            if(count !== coordinates.length){
                areaQueryStr+=','
            }
        }

        let url = `${API.GET_DATA}?area=${areaQueryStr}`
        this.setState({apiUrl:url})
        this.setState({ disableSelect: true })
        this._handleGetData(url, selectedType)
    }

    _handleOnRemove = () => {
        this.setState({
            addressList: [],
            disableSelect: false
        })
    }

    _handleGetData = (url, selectedType) => {
        const { _handleUpdateAddress } = this
        if ( !selectedType ) {
            this.setState({ 
                isToastOpen: true, 
                toastMessage: 'Please select a type from dropdown before selecting area!'
            })
            return
        }
        this.setState({ dataLoading: true })
        const pTypeList = [
            'Residential',
            'Commercial'
        ]
        if( selectedType && pTypeList.includes(selectedType)){
            url+=`&pType=${selectedType}`
        } else {
            url+=`&subType=${selectedType}`
        }

        if(url && url.length){
            fetch(url)
            .then( res => res.json())
            .then( res => res.places )
            .then( res =>  {
                if(res?.length){
                    _handleUpdateAddress(res)
                } else {
                    this.setState({ 
                        isToastOpen: true, 
                        toastMessage: 'No data found for selected input !'
                    })
                }
                this.setState({ dataLoading: false })
            })
            .catch( err => {
                console.err(err)
                this.setState({ dataLoading: true })
            })
        }
    }

    _handleInputChange = (e) => {
        this._handleOnRemove()

        this.setState({
            selectedType: e.target.value
        })
    }

    _getIconUrl = (type) => {
        switch(type) {
            case "Residential":
                return residentialIcon
            case "Commercial":
                return commercialIcon
            case "Kindergarden":
                return educationIcon
            case "School":
                return educationIcon
            case "Hospital":
                return healthcareIcon
            case "start":
                return blueIcon
            case "end":
                return redIcon
            default:
                return markerIcon
        }
    }

    _handleToastClose = () => {
        this.setState({
            isToastOpen:false,
            toastMessage: ''
        })
    }

    _handleStartAutoCompChangeInputChange = e => {

        const inputAddress = e?.target?.value
        if( !inputAddress || inputAddress?.length <= 0 ){
            this._removeGeoJson()
            this.setState( preState =>  ({ 
                route_info: null,
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData,
                    start: null
                },
            }))
            return
        }
        if(inputAddress && inputAddress.length){
            this._handleAddressList(inputAddress)
        } else {
            this.setState( preState =>  ({ 
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData,
                    start: null
                },
            }))  
        }
    }

    // handle start point
    _handleStartAutoCompChange = (e, value) => {
        if( value && Object.keys(value).length){
            this.setState( preState => ({ 
                start_address: value,
                markerData: { 
                    ...preState.markerData,
                    start: {
                        ...value,
                        addressPointType: 'start'
                    }
                },
                initial_view_state: {
                    ...preState.initial_view_state,
                    latitude: value.latitude,
                    longitude: value.longitude
                }
            })) 
        }
    }

    _handleAddressList = (value) => {
        const autocompleteUrl = `${API.AUTOCOMPLETE}${value}`
        if (value && value.length){
            fetch(autocompleteUrl)
            .then( res => res.json())
            .then( res => {
                const addressList =  res.places
                this.setState({ addressList: addressList })
            })
        }
    }

    _handleEndAutoCompChangeInputChange = e => {
        const inputAddress = e?.target?.value
        if( !inputAddress || inputAddress?.length <= 0 ){
            this._removeGeoJson()
            this.setState( preState =>  ({ 
                route_info: null,
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData,
                    end: null
                },
            })) 
            return
        }
        if(inputAddress && inputAddress.length){
            this._handleAddressList(inputAddress)
        } else {
            this.setState( preState =>  ({ 
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData,
                    end: null
                },
            })) 
        }
    }

    // handle end point
    _handleEndAutoCompChange = (e, value) => {
        if( value && Object.keys(value).length){
            this.setState( preState => ({ 
                end_address: value,
                markerData: { 
                    ...preState.markerData,
                    end: {
                        ...value,
                        addressPointType: 'end'
                    }
                },
                initial_view_state: {
                    ...preState.initial_view_state,
                    latitude: value.latitude,
                    longitude: value.longitude
                }
            })) 
        }
    }

    // handle get line
    _hangleGetLine = (start, end) => {
        const reqBody = {
            "points": [
              [
               ...start
              ],
              [
               ...end
              ]
            ],
            "points_encoded": false,
            "elevation": false,
            "profile": "car",
            "custom_model": {
              "speed": [
                {
                  "if": "road_class == PRIMARY",
                  "multiply_by": 0.9
                },
                {
                  "if": "road_class == TERTIARY",
                  "multiply_by": 0.2
                }
              ]
            },
            "locale": "en-US",
            "ch.disable": true,
            "details": [
              "road_class",
              "average_speed",
              "distance",
              "time"
            ]
        }
        fetch(API.GET_LINE, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
        })
        .then(res => res.json())
        .then(res => {
            this.setState({
                route_info: res
            })
            const line = res?.paths[0]?.points ?? null
            this._renderGeoJson(line)
        })
    }
    
    //handle popup open and close
    _handleShowPopup = (value) => {
        this.setState({ showPopup: value })
    }

    // set the starting point of route line
    _handleSetStartPoint = (a, b, c) => {
        console.log({ a, b, c})
    }
    render() {
        const { initial_view_state, addressList, selectedAddress, selectedType, isToastOpen, toastMessage, start_address, end_address, dataLoading, geoJson, markerData, showPopup, route_info } = this.state
        const { _getIconUrl, 
                _handleToastClose, 
                _handleStartAutoCompChangeInputChange, 
                _handleStartAutoCompChange, 
                _handleEndAutoCompChangeInputChange, 
                _handleEndAutoCompChange, 
                _handleShowPopup,
                _handleSetStartPoint
        } = this
        console.log({ route_info })
        return(
            <div style={{display:'flex',flexDirection:'row', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex',flexDirection:'column', minWidth:'25%',padding:'4px'}}>
                    <Typography>Start</Typography>
                    <Autocomplete 
                        _handleAutoCompInputChange={ _handleStartAutoCompChangeInputChange } 
                        _handleAutoCompChange={ _handleStartAutoCompChange }
                        filterOptions={ addressList }
                    />
                    <Typography>End</Typography>
                    <Autocomplete 
                        _handleAutoCompInputChange={ _handleEndAutoCompChangeInputChange } 
                        _handleAutoCompChange={ _handleEndAutoCompChange }
                        filterOptions={ addressList }
                    />
                    { route_info && 
                        <Box sx={{ display: 'flex', flexDirection: 'column', px: 2}}>
                           <Typography variant='h6' sx={{ textAlign: 'center', p: 1, fontWeight: 600 }}>Informations</Typography> 
                           <Typography><span style={{ fontWeight: 600}}>Distance: </span> { route_info?.paths[0].distance ? `${(route_info?.paths[0].distance/1000).toFixed(2)}km` : '' }</Typography> 
                           <Typography><span style={{ fontWeight: 600}}>Duration: </span> { route_info?.paths[0]?.time ? convertSecondsToTime(route_info?.paths[0]?.time/1000) : '' }</Typography> 
                        </Box>
                    }
                </div>
                <div 
                    style={{
                        display:'flex', 
                        flexDirection: 'column',
                        width:'75%',
                        position: "relative"
                    }}
                >    
                    { dataLoading && 
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    }
                    <Map 
                        initialViewState={initial_view_state}
                        mapboxAccessToken={ MAP_API.MAPBOX_ACCESS_TOKEN[0] } 
                        mapStyle = { MAP_API.STYLES[1].uri }
                    >
                        { showPopup && (
                            <Popup longitude={ initial_view_state.longitude } latitude={ initial_view_state.latitude }
                                anchor="bottom"
                                onClose={() => _handleShowPopup(false)}
                            >
                                <Box 
                                    sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    You are here
                                    <Button variant="text" size={ 'small' } onClick={ _handleSetStartPoint }>
                                        <Typography sx={{ fontSize: '.7rem'}}>Text</Typography>
                                    </Button>
                                </Box>
                            </Popup>
                        )}
                        <Source id="route" type="geojson" data={ geoJson }>
                            <Layer {...layerStyle} />
                        </Source>
                        
                        {  Object.keys(markerData).filter(d => markerData[d] !== null)?.map( d => markerData[d]).map( d => 
                            <Marker 
                                key={ d["longitude"]+d['Address'] }
                                longitude={ d["longitude"] } 
                                latitude={ d["latitude"] } 
                                anchor="bottom" 
                                scale={1}
                            >
                                <img 
                                    src={ _getIconUrl( d['addressPointType'] ) } 
                                    style={ {height:'40px', width:'40px'} }
                                    alt={ `${this.state.selectedType}marker` }
                                /> 
                            </Marker>
                        ) }
                    </Map>
                </div>
                <StyledSnackBar 
                    toastIsOpen={ isToastOpen } 
                    _handleToastClose={ _handleToastClose }
                    toastSeverity = {'warning'}
                    toastMessage = { toastMessage }
                />
            </div>
        )
    }
}

export default Home