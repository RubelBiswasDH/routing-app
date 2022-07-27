import React from 'react'
import DeckGL from '@deck.gl/react'
import { IconLayer } from '@deck.gl/layers'
import Map, {useControl, Marker} from 'react-map-gl';
import { MAP_API, API } from '../App..config'
import AutoComplete from './common/AutoComplete'
import StyledSelect from './common/StyledSelect'
import { Box, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import markerIcon from '../assets/marker--v1'
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

function DrawControl(props) {
  useControl((map) => {
    // console.log(map.map)
    map.map.on('draw.create', props.onCreate)
    map.map.on('draw.update', props.onUpdate)
    map.map.on('draw.delete', props.onDelete)
    return new MapboxDraw(props)}, {
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
        addressList: [{
            "id": 627929,
            "Address": "Restaurant, House 1/20, Road 7, Tali Office, Shikder Real State",
            "area": "Hazaribagh",
            "subType": "Restaurant",
            "pType": "Food",
            "longitude": 90.36298132447399,
            "latitude": 23.740338383279166,
            "uCode": "ZNCD1308",
            "user_id": 1649,
            "created_at": "2020-08-15 18:21:35",
            "updated_at": "2020-08-15 18:21:35",
            "ST_ASTEXT(location)": "POINT(90.36298132447399 23.740338383279166)",
            "image": null
        },
        {
            "id": 627934,
            "Address": "General Store, Golden Villa, House 1/17/B, Road 6, Tali Office, Shikder Real State",
            "area": "Hazaribagh",
            "subType": "General Store",
            "pType": "Shop",
            "longitude": 90.36258431127867,
            "latitude": 23.74039088138589,
            "uCode": "MMYO5153",
            "user_id": 1649,
            "created_at": "2020-08-15 18:25:07",
            "updated_at": "2020-08-15 18:28:03",
            "ST_ASTEXT(location)": "POINT(90.36258431127867 23.74039088138589)",
            "image": null
        }],
        selectedAddress: {},
        selectedType: '',
        apiUrl:''
    }

    componentDidMount(){
        this._createLayer()
        // this._handleGetData()
    }

    componentDidUpdate(prevProps, prevState){
        const { selectedAddress, addressList, selectedType, initial_view_state } = this.state
        // console.log({addressList})
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
        const { selectedAddress, addressList } = this.state
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
            //   new IconLayer({
            //     id: 'icon-layer',
            //     data: [ addressList ],
            //     // iconAtlas and iconMapping should not be provided
            //     // getIcon return an object which contains url to fetch icon of each data point
            //     getIcon: d => ({
            //         url: markerIcon,
            //         width: 128,
            //         height: 140,
            //         anchorY: 128
            //       }),
            //     // icon size is based on data point's contributions, between 2 - 25
            //     getSize:d => 4,
            //     pickable: true,
            //     sizeScale: 15,
            //     getPosition: d => ([ +d?.longitude, +d?.latitude])

            // })
        ]
        this.setState({layers})
    }

    _handleAutoCompInputChange = e => {
        console.log(this._handleAddressList)
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
                this.setState({ addressList: addressList })
            })
        }
    }

    _handleUpdateAddress = (addressList) => {
        this.setState({addressList:addressList})
    }

    _handleOnCreate = ({features}) => {
        const { _handleUpdateAddress } = this
        const { selectedType } = this.state
        const pTypeList = [
            'Residential',
            'Commercial'
        ]
        const subTypeList = [
            'Kindergarden',
            'Hospital',
            'School'
        ]
        // console.log({selectedType})
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
        // features[0]?.geometry?.coordinates[0]
        // &pType=Shop&subType=Saloon
        let url = `${API.GET_DATA}?area=${areaQueryStr}`
        if( selectedType && pTypeList.includes(selectedType)){
            url+=`&pType=${selectedType}`
        } else {
            url+=`&subType=${selectedType}`
        }

        this.setState({apiUrl:url})
        this._handleGetData(url)
        // console.log(areaQueryStr)
        // this._handleGetData(areaQueryStr)
        
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
            // console.log(res)
            // console.log({_handleUpdateAddress})
            if(_handleUpdateAddress){
                _handleUpdateAddress(res)
            }
        })
    }

    _handleInputChange = (e) =>{
        this.setState({selectedType:e.target.value})
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
        const { initial_view_state, layers, thana, addressList, selectedAddress, selectedType } = this.state
        const { _handleChange, _handleAutoCompInputChange, _handleAutoCompChange, _handleOnCreate, _handleOnRemove, _handleInputChange } = this
        return(
            <div style={{display:'flex',flexDirection:'row', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex',flexDirection:'column', minWidth:'25%'}}>
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
                        title={'Types'}

                    />
                    {/* <Box sx={{ 
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
                    </Box> */}
                    
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
                                <img src={markerIcon} style={{height:'40px', width:'40px'}}/>
                            </Marker>
                                
                        
                        ) }
                        {/* <Marker 
                            longitude={ 90.36298132447399} 
                            latitude={23.740338383279166} 
                            anchor="bottom" 
                            scale={1}
                        >
                            <img src={markerIcon} style={{height:'40px', width:'40px'}}/>
                        </Marker> */}
                    </Map>

                </div>
            </div>
        )
    }
}

export default DeckGLMap;