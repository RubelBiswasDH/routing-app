import React from 'react'
import { Snackbar, Alert } from '@mui/material'

const StyledSnackBar = (props) => {
    const { horizontal, vertical, toastIsOpen, _handleToastClose, toastSeverity, toastMessage} = props
    return (
        <Snackbar 
            anchorOrigin={{ 
                horizontal: horizontal ?? 'center', vertical: vertical ?? 'top' 
            }}
            open={toastIsOpen} 
            autoHideDuration={6000} 
            onClose={_handleToastClose}
        >
            <Alert 
                onClose={_handleToastClose} 
                severity={ toastSeverity } 
                sx={{ width: '100%' }}
            >
                {toastMessage}
            </Alert>
        </Snackbar>
    )
}

export default StyledSnackBar