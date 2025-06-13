import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const LineupPage: React.FC = () => {
  return (
    <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography gutterBottom component="h1" variant="h4">
          Betting Lineups
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography gutterBottom variant="h6">
              Today's Top Picks
            </Typography>
            {/* Add your lineup content here */}
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
};

export default LineupPage;
