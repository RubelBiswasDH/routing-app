import React from 'react'
import { IconLayer } from '@deck.gl/layers'
import Map, { useControl, Marker } from 'react-map-gl';
import { MAP_API, API } from '../App..config'
import StyledSelect from './common/StyledSelect'
import StyledSnackBar from './common/StyledSnackBar'
import { Box, Typography } from '@mui/material'
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import markerIcon from '../assets/marker--v1'
import commercialIcon from '../assets/commercial'
import educationIcon from '../assets/education'
import healthcareIcon from '../assets/healthcare'
import residentialIcon from '../assets/residential'

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

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

  return null;
}

class Home extends React.PureComponent {
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
        selectedAddress: {},
        selectedType: '',
        apiUrl:'',
        isToastOpen:false
    }

    componentDidMount(){
        this._createLayer()
    }

    componentDidUpdate(prevProps, prevState){
        const { selectedAddress, addressList, selectedType } = this.state
        if (
            prevState.selectedAddress !== selectedAddress 
            || prevState.addressList !== addressList
            || prevState.selectedType !== selectedType
        ){
            // this._createLayer()
            this.setState(preState => ({
                ...preState.initial_view_state,
                longitude:selectedAddress.longitude,
                latitude:selectedAddress.latitude
            }))
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
        this.setState({addressList:addressList})
    }

    _handleOnCreate = ({features}) => {
        const { selectedType } = this.state

        if ( !selectedType ) {
            this.setState({isToastOpen:true})
            return
        }

        const pTypeList = [
            'Residential',
            'Commercial'
        ]
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
        if( selectedType && pTypeList.includes(selectedType)){
            url+=`&pType=${selectedType}`
        } else {
            url+=`&subType=${selectedType}`
        }

        this.setState({apiUrl:url})
        this._handleGetData(url)
    }

    _handleOnRemove = () => {
        this.setState({addressList:[]})
    }

    _handleGetData = (url) => {
        const { _handleUpdateAddress } = this
        fetch(url)
        .then( res => res.json())
        .then( res => res.places )
        .then( res =>  {
            if(_handleUpdateAddress){
                _handleUpdateAddress(res)
            }
        })
    }

    _handleInputChange = (e) =>{
        this.setState({selectedType:e.target.value})
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
            default:
                return markerIcon
        }
    }

    _handleToastClose = () => {
        this.setState({isToastOpen:false})
    }

    render() {
        const { initial_view_state, addressList, selectedAddress, selectedType, isToastOpen } = this.state
        const { _handleOnCreate, _handleOnRemove, _handleInputChange, _getIconUrl, _handleToastClose } = this
        
        return(
            <div style={{display:'flex',flexDirection:'row', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex',flexDirection:'column', minWidth:'25%',padding:'4px'}}>
                    <StyledSelect
                        _handleInputChange = { _handleInputChange }
                        selectOptions={[
                            'Residential',
                            'Commercial',
                            'Kindergarden',
                            'Hospital',
                            'School'
                        ]}
                        value={ selectedType }
                        title={'Type'}
                    />
                    
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
                    <Map 
                        initialViewState={initial_view_state}
                        mapboxAccessToken={ MAP_API.MAPBOX_ACCESS_TOKEN[0] } 
                        mapStyle = { MAP_API.STYLES[1].uri }
                    >
                        <DrawControl
                            onCreate = { _handleOnCreate }
                            onDelete = { _handleOnRemove }
                            onUpdate = { _handleOnCreate }
                            position="top-left"
                            displayControlsDefault={false}
                            controls={{
                                polygon: true,
                                trash: true
                            }}
                        />
                        
                        {  addressList?.map( d => 
                            <Marker 
                                longitude={ d["longitude"] } 
                                latitude={ d["latitude"] } 
                                anchor="bottom" 
                                scale={1}
                            >
                                <img 
                                    src={_getIconUrl(this.state.selectedType)} 
                                    style={{height:'40px', width:'40px'}}
                                    alt={`${this.state.selectedType}marker`}
                                /> 
                            </Marker>
                        ) }
                    </Map>
                </div>
                <StyledSnackBar 
                    toastIsOpen={ isToastOpen } 
                    _handleToastClose={ _handleToastClose }
                    toastSeverity = {'warning'}
                    toastMessage = {'Please select a type from dropdown before selecting area!'}
                />
            </div>
        )
    }
}

export default Home;