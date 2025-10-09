// Premium light theme styles
export const premiumLightTableStyles = {
  paper: {
    width: '100%',
    mb: 3,
    borderRadius: 3,
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(100, 116, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(100, 116, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  header: {
    p: 2.5,
    borderBottom: '1px solid rgba(100, 116, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(100, 116, 255, 0.03) 0%, rgba(139, 149, 255, 0.02) 100%)'
  },
  headerText: {
    fontWeight: 700,
    color: '#1a2332',
    fontSize: '1.1rem'
  },
  dataGrid: {
    border: 'none',
    background: 'transparent',
    '& .MuiDataGrid-main': {
      borderRadius: 2
    },
    '& .MuiDataGrid-cell': {
      fontSize: '0.875rem',
      borderBottom: '1px solid rgba(100, 116, 255, 0.08)',
      color: '#374151'
    },
    '& .MuiDataGrid-columnHeader': {
      fontSize: '0.875rem',
      fontWeight: 700,
      background: 'rgba(100, 116, 255, 0.05)',
      color: '#1a2332',
      borderBottom: '2px solid rgba(100, 116, 255, 0.15)'
    },
    '& .MuiDataGrid-row': {
      '&:hover': {
        background: 'rgba(100, 116, 255, 0.06)',
        cursor: 'pointer'
      },
      '&:nth-of-type(even)': {
        background: 'rgba(100, 116, 255, 0.02)'
      }
    },
    '& .MuiDataGrid-toolbarContainer': {
      padding: '16px',
      background: 'rgba(100, 116, 255, 0.03)',
      borderBottom: '1px solid rgba(100, 116, 255, 0.1)',
      '& .MuiButton-root': {
        color: '#374151',
        fontWeight: 600,
        '&:hover': {
          background: 'rgba(100, 116, 255, 0.1)',
          color: '#1a2332'
        }
      },
      '& .MuiButtonBase-root': {
        color: '#374151'
      },
      '& .MuiInputBase-root': {
        color: '#1a2332',
        '& input': {
          color: '#1a2332'
        },
        '& .MuiInputBase-input': {
          color: '#1a2332'
        },
        '& .MuiInputBase-input::placeholder': {
          color: '#9ca3af',
          opacity: 1
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(100, 116, 255, 0.2)'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(100, 116, 255, 0.4)'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#6474ff'
        }
      },
      '& .MuiTextField-root': {
        '& .MuiInputBase-root': {
          color: '#1a2332'
        },
        '& input': {
          color: '#1a2332'
        }
      },
      '& .MuiFormControl-root': {
        '& .MuiInputBase-root': {
          color: '#1a2332'
        },
        '& .MuiInputLabel-root': {
          color: '#6b7280'
        }
      },
      '& .MuiSvgIcon-root': {
        color: '#6b7280'
      }
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: '1px solid rgba(100, 116, 255, 0.1)',
      background: 'rgba(100, 116, 255, 0.03)'
    },
    '& .MuiDataGrid-menuIcon': {
      color: '#6b7280'
    },
    '& .MuiDataGrid-sortIcon': {
      color: '#6b7280'
    },
    '& .MuiDataGrid-filterIcon': {
      color: '#6b7280'
    },
    '& .MuiTypography-root': {
      color: '#374151'
    }
  }
};

