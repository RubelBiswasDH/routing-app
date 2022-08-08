import * as React from 'react';
import { styled } from '@mui/material/styles';
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
        <Grid container gap={0} sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <Grid xs={4} md={2} item>
            <Typography sx={{ fontSize: '.8em' }} id="input-slider" gutterBottom>
              {title}
            </Typography>
          </Grid>
          <Grid container item xs={8} md={10} spacing={2} alignItems="center">
            <Grid xs={8} md={10} item>
              <Slider
                size="small"
                value={typeof value === 'number' ? value : 0}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
                step={step ? step : 1}
                min={min? min : 0}
                max={max? max : 10}
                sx={{ m: 0}}
              />
            </Grid>
            <Grid xs={4} md={2} item>
              <Input
                fullWidth
                sx={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '.7em',
                  p: 0,
                  m: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
                  style: { textAlign: 'center', p: 0, m: 0 },
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      )
  }
}

export default StyledSlider