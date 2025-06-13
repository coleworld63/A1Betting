import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography gutterBottom component="h1" variant="h1">
          404
        </Typography>
        <Typography gutterBottom component="h2" variant="h4">
          Page Not Found
        </Typography>
        <Typography paragraph color="text.secondary" variant="body1">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button color="primary" sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    </motion.div>
  );
};

export default NotFound;
