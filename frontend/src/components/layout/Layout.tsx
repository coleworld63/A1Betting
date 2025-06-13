import { ReactNode, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar open={isSidebarOpen} onClose={toggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isSidebarOpen ? theme.custom.sidebarWidth : 0}px)` },
          ml: { sm: `${isSidebarOpen ? theme.custom.sidebarWidth : 0}px` },
          mt: `${theme.custom.headerHeight}px`,
          transition: theme.custom.transition,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
