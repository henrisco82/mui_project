import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ApiIcon from '@mui/icons-material/Api';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Tag } from '../types';

interface TagDetailDialogProps {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onEdit: (tag: Tag) => void;
}

export default function TagDetailDialog({ open, tag, onClose, onEdit }: TagDetailDialogProps) {
  if (!tag) return null;

  const StatusBadge = ({ active, label }: { active: boolean; label: string }) => (
    <Chip
      icon={active ? <CheckCircleIcon /> : <CancelIcon />}
      label={label}
      size="small"
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
    />
  );

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ display: 'flex', py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              borderRadius: 2,
              p: 1,
              display: 'flex',
            }}
          >
            <LocalOfferIcon sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {tag.tag}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {tag.id}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Tag Information */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LocalOfferIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Tag Information
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <InfoRow label="Tag Name" value={tag.tag} />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="Comment" value={tag.comment} />
            <Divider sx={{ my: 1 }} />
            <InfoRow
              label="Query"
              value={
                tag.query ? (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {tag.query}
                  </Box>
                ) : null
              }
            />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="Dynamic Param Source" value={tag.dynamic_param_source} />
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', py: 1, gap: 2 }}>
              <StatusBadge active={tag.tag_active} label={tag.tag_active ? 'Tag Active' : 'Tag Inactive'} />
              <StatusBadge active={tag.query_active} label={tag.query_active ? 'Query Active' : 'Query Inactive'} />
            </Box>
          </Paper>
        </Box>

        {/* API Settings */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ApiIcon color="secondary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              API Settings
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <InfoRow
              label="Endpoint"
              value={
                tag.api_endpoint ? (
                  <Chip
                    label={tag.api_endpoint}
                    size="small"
                    sx={{ fontFamily: 'monospace' }}
                  />
                ) : null
              }
            />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="API Name" value={tag.api_name} />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="API Message" value={tag.api_message} />
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', py: 1, gap: 2 }}>
              <StatusBadge active={tag.api_active} label={tag.api_active ? 'API Active' : 'API Inactive'} />
              <StatusBadge
                active={tag.api_at_get_data}
                label={tag.api_at_get_data ? 'At Get Data' : 'Not At Get Data'}
              />
            </Box>
          </Paper>
        </Box>

        {/* Parameters */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TuneIcon color="info" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Parameters ({tag.params.length})
            </Typography>
          </Stack>
          {tag.params.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                borderStyle: 'dashed',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No parameters configured
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tag.params.map((param, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={param.id || index}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {param.display_name}
                      </Typography>
                      <Chip
                        label={param.db_column}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Chip label={`Type: ${param.field_type}`} size="small" />
                      <Chip label={`Value: ${param.value_type}`} size="small" />
                      {param.api_param && <Chip label="API Param" size="small" color="primary" />}
                    </Stack>
                    {param.option_value && param.option_value.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Options:
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {param.option_value.map((opt, i) => (
                            <Chip
                              key={i}
                              label={opt}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={() => {
            onClose();
            onEdit(tag);
          }}
          variant="contained"
        >
          Edit Tag
        </Button>
      </DialogActions>
    </Dialog>
  );
}
