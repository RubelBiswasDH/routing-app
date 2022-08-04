// Convert Seconds to Years, Months, Days, Hours, Minutes, Seconds
function convertSecondsToTime(seconds) {
    const years = Math.floor(seconds / 31536000)
    const months = Math.floor((seconds % 31536000) / 2592000)
    const days = Math.floor(((seconds % 31536000) % 2592000) / 86400)
    const hours = Math.floor((((seconds % 31536000) % 2592000) % 86400) / 3600)
    const minutes = Math.floor(((((seconds % 31536000) % 2592000) % 86400) % 3600) / 60)
    const sec = Math.floor(((((seconds % 31536000) % 2592000) % 86400) % 3600) % 60)
  
    return `
      ${years ? years + 'Y' : ''} 
      ${months ? months + 'mo' : ''} 
      ${days ? days + 'D' : ''} 
      ${hours ? hours + 'H' : ''} 
      ${minutes ? minutes + 'min' : ''}
      ${sec ? sec + 'sec' : ''}`
  }

 export { convertSecondsToTime }