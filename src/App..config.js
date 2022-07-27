const MAP_API = {
    MAPBOX_ACCESS_TOKEN : [
        'pk.eyJ1IjoicnViZWxiaXN3YXMiLCJhIjoiY2wxNjBqbG1yMHVoODNkcWExZmc0Y2JvaiJ9.qshAlfWDxCblvr_MJkLg-Q',
        'Mjg5MTpGMDNaTU1HTjZU'
    ],
    STYLES : [
        {
            title: 'streets-v11',
            uri:"mapbox://styles/mapbox/streets-v11"
        },
        {
            title: 'Light',
            uri:'https://map.barikoi.com/styles/osm-liberty/style.json?key=Mjg5MTpGMDNaTU1HTjZU'
        },
        {
            title: 'Dark',
            uri:'https://map.barikoi.com/styles/barikoi-dark/style.json'
        },
        {
            title: 'Test',
            uri:'http://osm.bmapsbd.com:8080/styles/barikoi/style.json?key=Mjg5MTpGMDNaTU1HTjZ'
        }
    ]
}
const baseUrl = 'https://api.bmapsbd.com'
const API = {
    GET_DATA:`${baseUrl}/get/custom/polygon`
}
export { MAP_API, API }