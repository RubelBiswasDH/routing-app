import React from 'react'
import PropTypes from 'prop-types'
import { Box, Grid, Typography, TextField, Autocomplete } from '@mui/material'


class AutoComplete extends React.PureComponent{
    state={}

    render(){ 
        const { _handleAutoCompInputChange, _handleAutoCompChange, filterOptions, disableUnderline, variant, title, titleStyle, value, fieldStyle, sx } = this.props
        return(
            <Box sx={{display:'flex', width:'100%', ...sx}}>
                <Autocomplete
                    freeSolo
                    sx={{ width: '100%', ...fieldStyle }}
                    onChange={ _handleAutoCompChange }
                    onInputChange={ _handleAutoCompInputChange }
                    disablePortal
                    id="companySearch"
                    options={filterOptions || []}
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                            return option;
                        }
                        if (option && option?.inputValue) {
                            return option.inputValue;
                        }
                        return option.Address
                    }}
                    renderOption={(props, option) => (
                        <Grid key={option?.Address} container {...props} >
                            <Grid item xs={12}><Typography sx={{ fontSize: '1em' }}>{option?.Address?.split(',')[0]}</Typography></Grid>
                            <Grid item xs={12}><Typography>{`${option?.Address}`}</Typography></Grid>
                        </Grid>)}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            variant= { variant ?? 'outlined'}
                            margin='none'
                            size='small'
                            fullWidth={true}
                            name='address'
                            type='text'
                            placeholder={ title || '' }
                            InputProps={{
                                ...params.InputProps,
                                disableUnderline: disableUnderline ?? false,
                            }}
                        />
                }
            />
        </Box>)
    }
}

// Prop Types
AutoComplete.propTypes = {
    dispatch: PropTypes.func,
    _handleAutoCompInputChange: PropTypes.func,
    _handleAutoCompChange: PropTypes.func,
    filterOptions: PropTypes.array,
    title: PropTypes.string,
    value: PropTypes.any,
    sx: PropTypes.object
}

AutoComplete.defaultProps = {
  dispatch: () => null,
  _handleAutoCompInputChange: () => null,
  _handleAutoCompChange: () => null,
  filterOptions: [],
  title: '',
  value: null,
  sx: null
}

export default AutoComplete