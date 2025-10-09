// Premium dark theme table styles
export const premiumTableStyles = {
  paper: {
    width: '100%',
    mb: 3,
    borderRadius: 2,
    overflow: 'hidden',
    background: '#151933',
    border: '1px solid rgba(100, 116, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  },
  header: {
    p: 2,
    borderBottom: '1px solid rgba(100, 116, 255, 0.1)'
  },
  headerText: {
    fontWeight: 600,
    color: '#ffffff'
  },
  dataGrid: {
    border: 'none',
    '& .MuiDataGrid-main': {
      borderRadius: 2
    },
    '& .MuiDataGrid-cell': {
      fontSize: '0.875rem',
      borderBottom: '1px solid rgba(100, 116, 255, 0.08)',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    '& .MuiDataGrid-columnHeader': {
      fontSize: '0.875rem',
      fontWeight: 700,
      background: 'rgba(100, 116, 255, 0.08)',
      color: 'rgba(255, 255, 255, 0.9)',
      borderBottom: '1px solid rgba(100, 116, 255, 0.2)'
    },
    '& .MuiDataGrid-row': {
      '&:hover': {
        background: 'rgba(100, 116, 255, 0.08)',
        cursor: 'pointer'
      },
      '&:nth-of-type(even)': {
        background: 'rgba(100, 116, 255, 0.02)'
      }
    },
    '& .MuiDataGrid-toolbarContainer': {
      padding: '16px',
      background: 'rgba(100, 116, 255, 0.05)',
      borderBottom: '1px solid rgba(100, 116, 255, 0.1)',
      '& .MuiButton-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          background: 'rgba(100, 116, 255, 0.1)'
        }
      },
      '& .MuiInputBase-root': {
        color: 'rgba(255, 255, 255, 0.9)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(100, 116, 255, 0.3)'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(100, 116, 255, 0.5)'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#6474ff'
        }
      }
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: '1px solid rgba(100, 116, 255, 0.1)',
      background: 'rgba(100, 116, 255, 0.05)'
    }
  }
};

