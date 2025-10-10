import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f7',
            p: 3
          }}
        >
          <Paper
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: '#ff3b30',
                mb: 3
              }}
            />
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1d1d1f',
                mb: 2
              }}
            >
              Что-то пошло не так
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#86868b',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу или обратитесь к администратору.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  background: '#f5f5f7',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#ff3b30',
                    display: 'block',
                    mb: 1
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    color: '#86868b',
                    display: 'block',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{
                borderRadius: '980px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0051D5 0%, #003DA5 100%)',
                  boxShadow: '0 6px 20px rgba(0, 122, 255, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Перезагрузить страницу
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

