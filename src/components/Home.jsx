import React from 'react'
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl'
import { MAP_API, API } from '../App..config'
import StyledSnackBar from './common/StyledSnackBar'
import Autocomplete from './common/AutoComplete'
import StyledSlider from './common/StyledSlider'
import StyledSelect from './common/StyledSelect'
import { Box, Typography, LinearProgress, Button } from '@mui/material'
import { bbox } from '@turf/turf'
import mapboxgl from 'mapbox-gl'
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

const roadClassList = [
    "OTHER",
    "MOTORWAY",
    "TRUNK",
    "PRIMARY",
    "SECONDARY",
    "TERTIARY",
    "RESIDENTIAL",
    "UNCLASSIFIED",
    "SERVICE",
    "ROAD",
    "TRACK",
    "BRIDLEWAY",
    "STEPS",
    "CYCLEWAY",
    "PATH",
    "LIVING_STREET",
    "FOOTWAY",
    "PEDESTRIAN",
    "PLATFORM",
    "CORRIDOR"
]

class Home extends React.PureComponent {
    
    state = {
        initial_view_state : {
            longitude: 90.39017821904588,
            latitude: 23.719800220780733,
            // zoom: 10,
            minZoom: 10,
            maxZoom: 22,
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
        start_value: null,
        end_value: null,
        start_address: null,
        end_address: null,
        route_info: null,
        lineData: null,
        geoJson: null,
        markerData : {},
        showPopup : true,
        popup_lngLat: null,
        slider_value: .6,
        road_class: '',
        speed_list: [
            {
                road_class:'PRIMARY',
                multiply_by: 1
            },
            {
                road_class:'SECONDARY',
                multiply_by: 1
            }
        ],
        priority_list: [
            {
                road_class:'PRIMARY',
                multiply_by: 1
            },
            {
                road_class:'SECONDARY',
                multiply_by: 1
            }
        ],
        mapRef: null
    }

    componentDidMount(){
        const mapRef = React.createRef()
        this.setState({ mapRef: mapRef })
    }

    componentDidUpdate(prevProps, prevState){
        const { start_address, end_address } = this.state
        if (
            ( 
                start_address && end_address && start_address?.geo_location?.length && end_address?.geo_location?.length
            )
            && (
                prevState.start_address?.geo_location !== start_address?.geo_location || prevState?.end_address?.geo_location !== end_address?.geo_location
            )
        ){  
            // this._handleGetLine(start_address?.geo_location, end_address?.geo_location)
            this.setState(preState => ({
                ...preState.initial_view_state,
                zoom: 8,
                longitude:start_address?.geo_location?.longitude,
                latitude:start_address?.geo_location?.latitude
            }))
        }
    }

    _renderGeoJson = (lineData) => {
        const { mapRef } = this.state
        const geoJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature', 
                    geometry: lineData
                }
            ]
        }
        if(lineData){
            const [minLng, minLat, maxLng, maxLat] = bbox(geoJson)
            mapRef.current.fitBounds(
                [
                    [minLng, minLat],
                    [maxLng, maxLat]
                ],
                { 
                    padding: 100, 
                    duration: 1000 
                }
            )
        }
        this.setState({ 
            geoJson: geoJson
        })

    }

    _removeGeoJson = () => {
        this._renderGeoJson(null)
    }

    _handleUpdateAddress = (addressList) => {
        this.setState({ addressList: addressList })
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

    // get list of address for starting point selection
    _handleStartAutoCompChangeInputChange = e => {

        const inputAddress = e?.target?.value
        if( !inputAddress || inputAddress?.length <= 0 ){
            this._removeGeoJson()
            this.setState( preState =>  ({ 
                route_info: null,
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData
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

    // set start point
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
        } else {
            this.setState( preState => ({ 
                route_info: null,
                markerData: { 
                    ...preState.markerData,
                    start: null,
                },
                start_address: null
            })) 
            this._renderGeoJson(null)
        }
    }

    // fetch address list from autocomplete api
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

    // get list of address for ending point selection
    _handleEndAutoCompChangeInputChange = e => {
        const inputAddress = e?.target?.value
        if( !inputAddress || inputAddress?.length <= 0 ){
            this._removeGeoJson()
            this.setState( preState =>  ({ 
                route_info: null,
                selectedAddress: {},
                addressList: [],
                markerData: { 
                    ...preState.markerData
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
        } else {
            this.setState( preState => ({ 
                route_info: null,
                markerData: { 
                    ...preState.markerData,
                    end: null
                },
                end_address: null
            })) 
            this._renderGeoJson(null)
        }
    }

    // handle get line
    _handleGetLine = (start, end) => {
        const { start_address, end_address, speed_list, priority_list } = this.state
        if( !start_address || !end_address ){
            this.setState({
                isToastOpen: true,
                toastMessage: 'Please choose start and end point of route'
            })
            return
        }
        const speed = speed_list?.map( s => ({
              "if": `road_class == ${ s.road_class ? s.road_class : 'PRIMARY' }`,
              "multiply_by": s?.multiply_by ? s?.multiply_by : 1
        }))
        const priority = priority_list?.map( s => ({
            "if": `road_class == ${ s.road_class ? s.road_class : 'PRIMARY' }`,
            "multiply_by": s?.multiply_by ? s?.multiply_by : 1
        }))

        const reqBody = {
            "points": [
              [ ...start_address?.geo_location ],
              [ ...end_address?.geo_location ]
            ],
            "points_encoded": false,
            "elevation": false,
            "profile": "car",
            "custom_model": {
                "speed": [
                    ...speed
                ],
                "priority": [
                    ...priority
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
    _handleClosePopup = (value) => {
        this.setState({ 
            showPopup: value,
            popup_lngLat: null
        })
    }

    // set the starting point of route line
    _handleSetStartPoint = (lngLat) => {

        this.setState( preState => ({
            showPopup: false,
            start_value: [ lngLat.lng, lngLat.lat ],
            start_address: {
                geo_location: [ lngLat.lng, lngLat.lat ],
                longitude: lngLat.lng,
                latitude: lngLat.lat
            },
            markerData: { 
                ...preState.markerData,
                start: {
                    ...{
                        longitude: lngLat.lng,
                        latitude: lngLat.lat
                    },
                    addressPointType: 'start'
                }
            }
        }))
    }

    _handleSetEndPoint = (lngLat) => {
        this.setState( preState => ({
            showPopup: false, 
            end_address: {
                geo_location: [ lngLat.lng, lngLat.lat ],
                longitude: lngLat.lng,
                latitude: lngLat.lat
            },
            markerData: { 
                ...preState.markerData,
                end: {
                    ...{
                        longitude: lngLat.lng,
                        latitude: lngLat.lat
                    },
                    addressPointType: 'end'
                }
            },
            end_value: [ lngLat.lng, lngLat.lat ]
        }))
    }

    _handleRightClick = (e) => {
        this.setState({
            showPopup: true,
            popup_lngLat: e?.lngLat
        })
    }

    // Set the value of starting address input
    _handleSetStartValue = (value) => {
        this.setState({ start_value: value })
    }

    // Set the value of ending address input
     _handleSetEndValue = (value) => {
        this.setState({ end_value: value })
    }

    _handleSliderChange = (e, i) => {
        const { speed_list } = this.state
        const new_list = speed_list.map( (s, id) => id===i? { ...s, multiply_by: e.target.value }: s)
        this.setState({
            speed_list: new_list
        })
    }
  
    _handleSliderInputChange = (e, i) => {
        const { speed_list } = this.state
        const new_list = speed_list.map( (s, id) => id===i? { ...s, multiply_by: e.target.value === '' ? '' : Number(e.target.value) }: s)
        this.setState({
            speed_list: new_list
        })
    }
  
    _handleBlur = () => {
        const { slider_value } = this.state
        if (slider_value < 0) {
            this.setState({slider_value: 0})
        } else if (slider_value > 1) {
            this.setState({slider_value: 1})
        }
    }
    
    _handlePrioritySliderChange = (e, i) => {
        const { priority_list } = this.state
        const new_list = priority_list.map( (s, id) => id===i? { ...s, multiply_by: e.target.value }: s)
        this.setState({
            priority_list: new_list
        })
    }
  
    _handlePrioritySliderInputChange = (e, i) => {
        const { priority_list } = this.state
        const new_list = priority_list.map( (s, id) => id===i? { ...s, multiply_by: e.target.value === '' ? '' : Number(e.target.value) }: s)
        this.setState({
            priority_list: new_list
        })
    }
  
    _handlePriorityBlur = () => {
        const { slider_value } = this.state
        if (slider_value < 0) {
            this.setState({slider_value: 0})
        } else if (slider_value > 10) {
            this.setState({slider_value: 10})
        }
    }

    // Handle road class selection
    _handleRoadClassSelect = (e,i) => {
        const { speed_list, priority_list } = this.state
        const new_speed_list = speed_list.map((s, id) => id===i? {...s, road_class: e.target.value}: s)
        const new_priority_list = priority_list.map((s, id) => id===i? {...s, road_class: e.target.value}: s)
        this.setState({
            speed_list: new_speed_list,
            priority_list: new_priority_list
        })
    }

    // Handle add another read class
    _handleAddRoadClass = () => {
        const { speed_list, priority_list } = this.state
        const new_speed_list = [
            ...speed_list,
            {
                road_class:'PRIMARY',
                multiply_by: 1
            }
        ]
        const new_priority_list = [
            ...priority_list,
            {
                road_class:'PRIMARY',
                multiply_by: 1
            }
        ]
        this.setState({
            speed_list: new_speed_list,
            priority_list: new_priority_list
        })
    }

    render() {
        const { initial_view_state, addressList, isToastOpen, toastMessage, dataLoading, geoJson, markerData, showPopup, route_info, popup_lngLat, start_value, end_value, speed_list, priority_list } = this.state
        const { 
            _getIconUrl, 
            _handleToastClose, 
            _handleStartAutoCompChangeInputChange, 
            _handleStartAutoCompChange, 
            _handleEndAutoCompChangeInputChange, 
            _handleEndAutoCompChange, 
            _handleClosePopup,
            _handleSetStartPoint,
            _handleSetEndPoint,
            _handleRightClick
        } = this
        return(
            <div style={{display:'flex',flexDirection:'row', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex',flexDirection:'column', minWidth:'25%',padding:'4px 10px', gap: 4, overflow: 'auto' }}>
                    <Typography>Start</Typography>
                    <Autocomplete 
                        value={ start_value?.join(', ') ?? "" }
                        _handleAutoCompInputChange={ _handleStartAutoCompChangeInputChange } 
                        _handleAutoCompChange={ _handleStartAutoCompChange }
                        filterOptions={ addressList }
                    />
                    <Typography>End</Typography>
                    <Autocomplete 
                        value={ end_value?.join(', ') ?? "" }
                        _handleAutoCompInputChange={ _handleEndAutoCompChangeInputChange } 
                        _handleAutoCompChange={ _handleEndAutoCompChange }
                        filterOptions={ addressList }
                    />
                    {   speed_list && speed_list && speed_list?.map( (s, i) => (
                            <Box 
                                key={i}
                                sx={{
                                    boxShadow: 2,
                                    p: 2,
                                    py: .5,
                                    my: .5,
                                    gap: 2
                                }}
                            >
                                {/* <Typography sx={{ fontSize: '.8em' }}>Road Class</Typography> */}
                                <StyledSelect
                                    title={ 'Road Class' }
                                    value={ speed_list[i]?.road_class ?? 'PRIMARY'}
                                    handleInputChange={ (e) => this._handleRoadClassSelect(e,i)}
                                    selectOptions={roadClassList}
                                />
                                <StyledSlider 
                                    title={ 'Speed' }
                                    value={ speed_list[i]?.multiply_by ?? .5 }
                                    min={ 0.0 }
                                    max={ 1.0 }
                                    step={ .05 }
                                    handleSliderChange={ (e) => this._handleSliderChange(e,i) }
                                    handleInputChange={ (e) => this._handleSliderInputChange(e,i) }
                                    handleBlur={ this._handleBlur }
                                />
                                <StyledSlider 
                                    title={ 'Priority' }
                                    value={ priority_list[i]?.multiply_by ?? .5 }
                                    min={ 0.0 }
                                    max={ 1.0 }
                                    step={ .05 }
                                    handleSliderChange={ (e) => this._handlePrioritySliderChange(e,i) }
                                    handleInputChange={ (e) => this._handlePrioritySliderInputChange(e,i) }
                                    handleBlur={ this._handlePriorityBlur }
                                />
                            </Box>
                        ))
                    }
                    <Button onClick={ this._handleAddRoadClass } variant="outlined">Add Road Class/Speed/Priority</Button>
                    <Button onClick={ this._handleGetLine } variant="outlined">Get Route</Button>
                    { (route_info && route_info?.paths && route_info?.paths?.length > 0 ) &&
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
                        ref={ this.state.mapRef }
                        initialViewState={initial_view_state}
                        mapboxAccessToken={ MAP_API.MAPBOX_ACCESS_TOKEN[0] } 
                        mapStyle={ MAP_API.STYLES[1].uri }
                        onContextMenu={ _handleRightClick }
                    >
                        { (showPopup && popup_lngLat && Object.keys(popup_lngLat)?.length) && (
                            <Popup longitude={ popup_lngLat.lng } latitude={ popup_lngLat.lat }
                                anchor="bottom"
                                onClose={() => _handleClosePopup(false)}
                            >
                                <Box 
                                    sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Button variant="text" size={ 'small' } onClick={ () => _handleSetStartPoint(popup_lngLat) }>
                                        <Typography sx={{ fontSize: '.7rem'}}>Set as Start Point</Typography>
                                    </Button>
                                    <Button variant="text" size={ 'small' } onClick={ () => _handleSetEndPoint(popup_lngLat) }>
                                        <Typography sx={{ fontSize: '.7rem'}}>Set as End Point</Typography>
                                    </Button>
                                </Box>
                            </Popup>
                        )}
                        <Source id="route" type="geojson" data={ geoJson }>
                            <Layer {...layerStyle} />
                        </Source>
                        
                        {  Object.keys(markerData).filter(d => markerData[d] !== null)?.map( d => markerData[d]).map( d => 
                            <Marker 
                                key={ d["longitude"] }
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