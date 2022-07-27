import * as React from 'react';
import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box'
import Select from '@mui/material/Select';


class StyledSelect extends React.PureComponent{
    state={}

    render(){ 
        const { _handleInputChange, selectOptions, variant, title, titleStyle, value, fieldStyle, sx } = this.props
        
        return(
            <Box sx={{display:'flex', width:'100%', ...sx}}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small" fullWidth={true}>
                    <InputLabel id="demo-select-small">{title}</InputLabel>
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={value}
                        label="Age"
                        onChange={_handleInputChange}
                    >
                        {/* <MenuItem value="">
                            <em>None</em>
                        </MenuItem> */}
                        { selectOptions.map( m => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
        </Box>)
    }
}

// Prop Types
StyledSelect.propTypes = {
    dispatch: PropTypes.func,
    _handleInputChange: PropTypes.func,
    selectOptions: PropTypes.array,
    title: PropTypes.string,
    value: PropTypes.any,
    sx: PropTypes.object
}

StyledSelect.defaultProps = {
  dispatch: () => null,
  _handleInputChange: () => null,
  selectOptions: [],
  title: '',
  value: null,
  sx: null
}

export default StyledSelect

