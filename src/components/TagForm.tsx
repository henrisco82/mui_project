import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Stack,
  Collapse,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ApiIcon from '@mui/icons-material/Api';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useCreateTag, useUpdateTag } from '../api/tagApi';
import type { TagFormInput, Tag } from '../types';

// SQL validation helper
const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WITH', 'CREATE', 'ALTER', 'DROP',
  'TRUNCATE', 'MERGE', 'CALL', 'EXEC', 'EXECUTE', 'EXPLAIN', 'DESCRIBE', 'SHOW'
];

const validateSqlQuery = (value: string): string | true => {
  if (!value || !value.trim()) {
    return true; // Empty is allowed (not required field)
  }

  const trimmedQuery = value.trim().toUpperCase();
  const startsWithKeyword = SQL_KEYWORDS.some((keyword) =>
    trimmedQuery.startsWith(keyword)
  );

  if (!startsWithKeyword) {
    return `Query must start with a valid SQL keyword (${SQL_KEYWORDS.slice(0, 5).join(', ')}, etc.)`;
  }

  // Basic structure validation
  const hasBasicStructure = /^(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+.+\s+SET|DELETE\s+FROM|WITH\s+.+\s+AS|CREATE|ALTER|DROP|TRUNCATE|MERGE|CALL|EXEC|EXECUTE|EXPLAIN|DESCRIBE|SHOW)/i.test(trimmedQuery);

  if (!hasBasicStructure && trimmedQuery.startsWith('SELECT')) {
    return 'SELECT query must include FROM clause';
  }

  return true;
};

const defaultParamValues = {
  db_column: '',
  display_name: '',
  option_value: '',
  field_type: 'text',
  value_type: 'string',
  api_param: false,
};

const defaultValues: TagFormInput = {
  tag: '',
  query: '',
  comment: '',
  dynamic_param_source: '',
  api_active: false,
  api_endpoint: '',
  api_name: '',
  api_at_get_data: false,
  api_message: '',
  query_active: true,
  tag_active: true,
  params: [],
};

interface TagFormProps {
  editTag?: Tag | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TagForm({ editTag, onSuccess, onCancel }: TagFormProps) {
  const isEditMode = !!editTag;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagFormInput>({
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'params',
  });

  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const isError = createMutation.isError || updateMutation.isError;
  const error = createMutation.error || updateMutation.error;

  useEffect(() => {
    if (editTag) {
      reset({
        tag: editTag.tag,
        query: editTag.query,
        comment: editTag.comment,
        dynamic_param_source: editTag.dynamic_param_source,
        api_active: editTag.api_active,
        api_endpoint: editTag.api_endpoint,
        api_name: editTag.api_name,
        api_at_get_data: editTag.api_at_get_data,
        api_message: editTag.api_message,
        query_active: editTag.query_active,
        tag_active: editTag.tag_active,
        params: editTag.params.map((p) => ({
          ...p,
          option_value: p.option_value.join(', '),
        })),
      });
    } else {
      reset(defaultValues);
    }
  }, [editTag, reset]);

  const onSubmit = (data: TagFormInput) => {
    const tagPayload: Omit<Tag, 'id'> = {
      ...data,
      params: data.params.map((param) => ({
        ...param,
        option_value: param.option_value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== ''),
      })),
    };

    if (isEditMode && editTag?.id) {
      updateMutation.mutate(
        { id: editTag.id, data: tagPayload },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(tagPayload, {
        onSuccess: () => {
          reset(defaultValues);
          onSuccess?.();
        },
      });
    }
  };

  const handleReset = () => {
    if (isEditMode && onCancel) {
      onCancel();
    } else {
      reset(defaultValues);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {isEditMode ? 'Edit Tag' : 'Create Tag'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditMode
              ? `Editing tag: ${editTag?.tag}`
              : 'Configure a new tag with parameters and API settings'}
          </Typography>
        </Box>

        <Collapse in={isSuccess && !isEditMode}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Tag {isEditMode ? 'updated' : 'created'} successfully!
          </Alert>
        </Collapse>

        <Collapse in={isError}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Error {isEditMode ? 'updating' : 'creating'} tag:{' '}
            {(error as Error)?.message || 'Unknown error'}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Tag Information Section */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
            <CardHeader
              avatar={
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                  }}
                >
                  <LocalOfferIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              }
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  Tag Information
                </Typography>
              }
              subheader="Basic tag configuration"
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Controller
                    name="tag"
                    control={control}
                    rules={{
                      required: 'Tag name is required',
                      minLength: {
                        value: 2,
                        message: 'Tag name must be at least 2 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Tag name must be less than 100 characters',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_-]+$/,
                        message: 'Tag name can only contain letters, numbers, underscores, and hyphens',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tag Name"
                        fullWidth
                        required
                        size="small"
                        placeholder="Enter tag identifier"
                        error={!!errors.tag}
                        helperText={errors.tag?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="query"
                    control={control}
                    rules={{
                      validate: validateSqlQuery,
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Query"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="SELECT * FROM table WHERE ..."
                        error={!!errors.query}
                        helperText={errors.query?.message || 'Enter a valid SQL query (SELECT, INSERT, UPDATE, DELETE, etc.)'}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Comment"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Add a description or notes about this tag..."
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="dynamic_param_source"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dynamic Param Source"
                        fullWidth
                        size="small"
                        placeholder="Source identifier"
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Stack direction="row" spacing={3}>
                    <Controller
                      name="tag_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch checked={field.value} onChange={field.onChange} color="success" />
                          }
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">Tag Active</Typography>
                              {field.value && (
                                <Chip label="On" size="small" color="success" sx={{ height: 20 }} />
                              )}
                            </Stack>
                          }
                        />
                      )}
                    />
                    <Controller
                      name="query_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch checked={field.value} onChange={field.onChange} color="success" />
                          }
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">Query Active</Typography>
                              {field.value && (
                                <Chip label="On" size="small" color="success" sx={{ height: 20 }} />
                              )}
                            </Stack>
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* API Settings Section */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
            <CardHeader
              avatar={
                <Box
                  sx={{
                    bgcolor: 'secondary.main',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                  }}
                >
                  <ApiIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              }
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  API Settings
                </Typography>
              }
              subheader="Configure API integration"
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="api_endpoint"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="API Endpoint"
                        fullWidth
                        size="small"
                        placeholder="/api/v1/resource"
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="api_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="API Name"
                        fullWidth
                        size="small"
                        placeholder="Service name"
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="api_message"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="API Message"
                        fullWidth
                        size="small"
                        placeholder="Response message template"
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <Controller
                      name="api_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch checked={field.value} onChange={field.onChange} color="success" />
                          }
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">API Active</Typography>
                              {field.value && (
                                <Chip label="On" size="small" color="success" sx={{ height: 20 }} />
                              )}
                            </Stack>
                          }
                        />
                      )}
                    />
                    <Controller
                      name="api_at_get_data"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch checked={field.value} onChange={field.onChange} color="success" />
                          }
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">API At Get Data</Typography>
                              {field.value && (
                                <Chip label="On" size="small" color="success" sx={{ height: 20 }} />
                              )}
                            </Stack>
                          }
                        />
                      )}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Parameters Section */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            <CardHeader
              avatar={
                <Box
                  sx={{
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                  }}
                >
                  <TuneIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              }
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  Parameters
                </Typography>
              }
              subheader={`${fields.length} parameter${fields.length !== 1 ? 's' : ''} configured`}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => append(defaultParamValues)}
                  sx={{ mr: 1, mt: 1 }}
                >
                  Add Parameter
                </Button>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              {fields.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <TuneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No parameters added yet
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Click "Add Parameter" to configure query parameters
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {fields.map((field, index) => (
                    <Paper
                      key={field.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={`Parameter ${index + 1}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                        <IconButton
                          onClick={() => remove(index)}
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light', color: 'white' },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name={`params.${index}.db_column`}
                            control={control}
                            rules={{
                              required: 'DB Column is required',
                              pattern: {
                                value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                                message: 'Must be a valid column name',
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="DB Column"
                                required
                                size="small"
                                fullWidth
                                placeholder="column_name"
                                error={!!errors.params?.[index]?.db_column}
                                helperText={errors.params?.[index]?.db_column?.message}
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name={`params.${index}.display_name`}
                            control={control}
                            rules={{
                              required: 'Display Name is required',
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Display Name"
                                required
                                size="small"
                                fullWidth
                                placeholder="User-friendly name"
                                error={!!errors.params?.[index]?.display_name}
                                helperText={errors.params?.[index]?.display_name?.message}
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Field Type</InputLabel>
                            <Controller
                              name={`params.${index}.field_type`}
                              control={control}
                              render={({ field }) => (
                                <Select {...field} label="Field Type">
                                  <MenuItem value="text">Text</MenuItem>
                                  <MenuItem value="select">Select</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Value Type</InputLabel>
                            <Controller
                              name={`params.${index}.value_type`}
                              control={control}
                              render={({ field }) => (
                                <Select {...field} label="Value Type">
                                  <MenuItem value="string">String</MenuItem>
                                  <MenuItem value="number">Number</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>

                        <Grid size={12}>
                          <Controller
                            name={`params.${index}.option_value`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Option Values"
                                size="small"
                                fullWidth
                                placeholder="latam, na, emea"
                                helperText="Comma-separated list of allowed values"
                              />
                            )}
                          />
                        </Grid>

                        <Grid size={12}>
                          <Controller
                            name={`params.${index}.api_param`}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                    size="small"
                                    color="success"
                                  />
                                }
                                label={<Typography variant="body2">Include in API request</Typography>}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleReset}
              disabled={isPending}
              sx={{ minWidth: 120 }}
            >
              {isEditMode ? 'Cancel' : 'Reset'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isEditMode ? (
                  <SaveIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                minWidth: 160,
                py: 1.5,
                boxShadow: 2,
                '&:hover': { boxShadow: 4 },
              }}
            >
              {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Tag'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
