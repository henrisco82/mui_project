import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  alpha,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTags, useDeleteTag } from '../api/tagApi';
import type { Tag } from '../types';

interface TagsTableProps {
  onEdit: (tag: Tag) => void;
  onView: (tag: Tag) => void;
}

export default function TagsTable({ onEdit, onView }: TagsTableProps) {
  const { data: tags, isLoading, isError } = useTags();
  const deleteMutation = useDeleteTag();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tagsList = useMemo(() => (Array.isArray(tags) ? tags : []), [tags]);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tagsList;
    const query = searchQuery.toLowerCase();
    return tagsList.filter(
      (tag) =>
        tag.tag.toLowerCase().includes(query) ||
        tag.comment?.toLowerCase().includes(query) ||
        tag.api_endpoint?.toLowerCase().includes(query) ||
        tag.api_name?.toLowerCase().includes(query)
    );
  }, [tagsList, searchQuery]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tagToDelete?.id) {
      deleteMutation.mutate(tagToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTagToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTagToDelete(null);
  };

  const StatusChip = ({ active, label }: { active: boolean; label: string }) => (
    <Chip
      icon={active ? <CheckCircleIcon /> : <CancelIcon />}
      label={label}
      size="small"
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      sx={{
        '& .MuiChip-icon': { fontSize: 16 },
        fontWeight: 500,
      }}
    />
  );

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        </Box>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'error.light',
          bgcolor: alpha('#f44336', 0.05),
        }}
      >
        <Typography color="error">Failed to load tags. Please try again.</Typography>
      </Paper>
    );
  }

  if (tagsList.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <StorageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Tags Yet
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Create your first tag using the form above
        </Typography>
      </Paper>
    );
  }

  const paginatedTags = filteredTags.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Search Box */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tags by name, comment, endpoint, or API name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 2,
              },
            }}
          />
          {searchQuery && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Found {filteredTags.length} result{filteredTags.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {filteredTags.length === 0 && searchQuery ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Results Found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              No tags match "{searchQuery}". Try a different search term.
            </Typography>
          </Box>
        ) : (
        <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: 'grey.50',
                  '& th': {
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <TableCell>Tag</TableCell>
                <TableCell>API Endpoint</TableCell>
                <TableCell align="center">Params</TableCell>
                <TableCell align="center">Tag Status</TableCell>
                <TableCell align="center">Query Status</TableCell>
                <TableCell align="center">API Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTags.map((tag, index) => (
                <TableRow
                  key={tag.id}
                  sx={{
                    bgcolor: index % 2 === 0 ? 'white' : 'grey.25',
                    '&:hover': {
                      bgcolor: alpha('#1976d2', 0.04),
                    },
                    '& td': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {tag.tag}
                      </Typography>
                      {tag.comment && (
                        <Typography variant="caption" color="text.secondary">
                          {tag.comment}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'grey.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      {tag.api_endpoint || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={tag.params.length}
                      size="small"
                      color={tag.params.length > 0 ? 'info' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip active={tag.tag_active} label={tag.tag_active ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip active={tag.query_active} label={tag.query_active ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip active={tag.api_active} label={tag.api_active ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onView(tag)}
                          sx={{
                            color: 'info.main',
                            '&:hover': { bgcolor: alpha('#2196f3', 0.1) },
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(tag)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { bgcolor: alpha('#1976d2', 0.1) },
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(tag)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha('#f44336', 0.1) },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredTags.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        />
        </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 400 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                bgcolor: 'error.light',
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              <DeleteOutlineIcon sx={{ color: 'error.main' }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Delete Tag
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag{' '}
            <strong>"{tagToDelete?.tag}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
