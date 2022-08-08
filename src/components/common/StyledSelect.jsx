import * as React from 'react';
import PropTypes from 'prop-types'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'


class StyledSelect extends React.PureComponent{

    render(){ 
        const { handleInputChange, selectOptions, title, value, sx, disableSelect } = this.props
        
        return(
            <Grid container gap={0} sx={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
                <Grid xs={6} md={4} item>
                    { title && 
                        <Typography sx={{ fontSize: '.8em', m: 0 }} id="input-slider" gutterBottom>
                            {title}
                        </Typography>
                    }
                </Grid>
                <Grid container item xs={6} md={8} spacing={0} alignItems="center" sx={{ m: 0 }}>
                    <FormControl disabled={ disableSelect } sx={{ m: 0, minWidth: 120 }} size="small" fullWidth={true}>
                        <Select
                            sx={{ fontSize: '.6em', width: '100%', p: 0 }}
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
                </Grid>
            </Grid>
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

