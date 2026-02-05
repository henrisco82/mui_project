import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fab,
  Zoom,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TagForm from './components/TagForm';
import TagsTable from './components/TagsTable';
import TagDetailDialog from './components/TagDetailDialog';
import type { Tag } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ py: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [viewingTag, setViewingTag] = useState<Tag | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setEditingTag(null);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTabValue(1);
  };

  const handleView = (tag: Tag) => {
    setViewingTag(tag);
  };

  const handleFormSuccess = () => {
    if (editingTag) {
      setSnackbar({ open: true, message: 'Tag updated successfully!', severity: 'success' });
      setEditingTag(null);
    } else {
      setSnackbar({ open: true, message: 'Tag created successfully!', severity: 'success' });
    }
    setTabValue(0);
  };

  const handleFormCancel = () => {
    setEditingTag(null);
    setTabValue(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalOfferIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Tag Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Create, view, edit, and manage your tags and parameters
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            mb: 3,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<ListIcon />}
              iconPosition="start"
              label="All Tags"
            />
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label={editingTag ? `Edit: ${editingTag.tag}` : 'Create Tag'}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <TagsTable onEdit={handleEdit} onView={handleView} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TagForm
            editTag={editingTag}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </TabPanel>

        {/* Floating Action Button */}
        <Zoom in={tabValue === 0}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              setEditingTag(null);
              setTabValue(1);
            }}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              boxShadow: 4,
              '&:hover': {
                boxShadow: 8,
              },
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>

        {/* Tag Detail Dialog */}
        <TagDetailDialog
          open={!!viewingTag}
          tag={viewingTag}
          onClose={() => setViewingTag(null)}
          onEdit={handleEdit}
        />

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
