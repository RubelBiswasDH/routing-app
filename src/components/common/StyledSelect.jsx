import * as React from 'react';
import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box'
import Select from '@mui/material/Select';


class StyledSelect extends React.PureComponent{

    render(){ 
        const { handleInputChange, selectOptions, title, value, sx, disableSelect } = this.props
        
        return(
            <Box sx={{display:'flex', width:'100%',p:0,m:0, ...sx}}>
                <FormControl disabled={ disableSelect } sx={{ m: 0, minWidth: 120 }} size="small" fullWidth={true}>
                    <InputLabel id="demo-select-small">{title}</InputLabel>
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={value}
                        label="Age"
                        onChange={handleInputChange}
                    >
                        { selectOptions.map( m => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        )
    }
}

// Prop Types
StyledSelect.propTypes = {
    dispatch: PropTypes.func,
    handleInputChange: PropTypes.func,
    selectOptions: PropTypes.array,
    title: PropTypes.string,
    value: PropTypes.any,
    sx: PropTypes.object,
    disableSelect: PropTypes.bool
}

StyledSelect.defaultProps = {
  dispatch: () => null,
  handleInputChange: () => null,
  selectOptions: [],
  title: '',
  value: null,
  sx: null,
  disableSelect: false
}

export default StyledSelect

