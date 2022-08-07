import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 42px;
`;

class StyledSlider extends React.PureComponent{

  render(){
    const { handleSliderChange, handleInputChange, handleBlur, value, title, min, max, step } = this.props
    return (
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ fontSize: '.8em' }} id="input-slider" gutterBottom>
            {title}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={8} md={10} item>
              <Slider
                value={typeof value === 'number' ? value : 0}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
                step={step ? step : 1}
                min={min? min : 0}
                max={max? max : 10}
              />
            </Grid>
            <Grid xs={4} md={2} item>
              <Input
                fullWidth
                sx={{
                  width: '100%',
                  textAlign: 'center'
                }}
                value={value}
                size="small"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: step ? step : 1,
                  min: min? min : 0,
                  max: max? max : 10,
                  type: 'number',
                  style: { textAlign: 'center' },
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )
  }
}

export default StyledSlider