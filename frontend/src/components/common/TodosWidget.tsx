import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Paper,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Todo, useTodoApi } from '../../services/todoApi';
import { COLORS } from '../../theme/themeColors';

interface TodosWidgetProps {
  width?: string | number;
  height?: string | number;
}

export const TodosWidget: React.FC<TodosWidgetProps> = ({ 
  width = '100%', 
  height = '100%'
}) => {
  const { user } = useAuth();
  const todoApi = useTodoApi();
  const { t } = useTranslation();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [severity, setSeverity] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  // Check if user has access to TODO functionality
  // CUSTOMER and GUEST roles should not have access to TODOs
  const hasAccess = user?.roles && 
    !user.roles.includes('CUSTOMER') && 
    !user.roles.includes('GUEST');

  // Load todos when component mounts
  const loadTodos = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedTodos = await todoApi.getTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      setError(t('widgets.todos.failedToLoad'));
      // console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  }, [todoApi, hasAccess, t]);

  useEffect(() => {
    if (user && hasAccess) {
      loadTodos();
    }
  }, [user, loadTodos, hasAccess]);

  // If user doesn't have access, don't render the widget
  if (!hasAccess) {
    return null;
  }

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      const todoToCreate = {
        title: newTodoTitle.trim(),
        severity: severity,
        // Note: completed field is temporarily removed from backend
        // completed: false,
      };

      const createdTodo = await todoApi.createTodo(todoToCreate);
      setTodos(prev => [createdTodo, ...prev]);
      
      // Reset form
      setNewTodoTitle('');
      setSeverity('MEDIUM');
    } catch (err) {
      setError(t('widgets.todos.failedToCreate'));
      // console.error('Error creating todo:', err);
    }
  };

  const handleToggleComplete = async (id: number) => {
    try {
      const updatedTodo = await todoApi.toggleTodoCompletion(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      setError(t('widgets.todos.failedToUpdate'));
      // console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError(t('widgets.todos.failedToDelete'));
      // console.error('Error deleting todo:', err);
    }
  };

  const getPriorityColor = (severity: string) => {
    const normalizedSeverity = severity?.toUpperCase();
    switch (normalizedSeverity) {
      case 'HIGH': return '#f44336'; // Red
      case 'MEDIUM': return '#ff9800'; // Orange
      case 'LOW': return '#4caf50'; // Green
      default: return '#9e9e9e'; // Gray
    }
  };

  const getSeverityBalloon = (severity: string) => {
    return <CircleIcon sx={{ fontSize: '16px', color: getPriorityColor(severity) }} />;
  };

  const handleSeverityChange = (event: SelectChangeEvent<string>) => {
    setSeverity(event.target.value as 'HIGH' | 'MEDIUM' | 'LOW');
  };

  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>{t('widgets.todos.loadingTodos')}</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, #ffffff 0%, #f7f7fb 60%, #f0f4ff 100%)',
        p: 2.5,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
        boxShadow: '0 12px 28px rgba(26, 54, 93, 0.08)',
      }}
    >
      {/* Header */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: COLORS.PRIMARY,
          fontWeight: 700,
          letterSpacing: '0.04em',
          borderBottom: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`,
          pb: 1.25
        }}
      >
        {t('widgets.todos.title')}
      </Typography>

      {/* Error display */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1, color: '#ef9a9a' }}>
          {error}
        </Typography>
      )}

      {/* Add TODO Form */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t('widgets.todos.addPlaceholder')}
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTodo();
            }
          }}
          sx={{ 
            width: '100%', 
            mb: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: alpha(COLORS.PRIMARY, 0.12),
              },
              '&:hover fieldset': {
                borderColor: alpha(COLORS.PRIMARY, 0.28),
              },
              '&.Mui-focused fieldset': {
                borderColor: COLORS.PRIMARY,
              },
            },
            '& .MuiInputBase-input': {
              color: COLORS.TEXT_PRIMARY,
            },
            '& .MuiInputBase-input::placeholder': {
              color: alpha(COLORS.PRIMARY, 0.55),
              opacity: 1,
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 100,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: alpha(COLORS.PRIMARY, 0.12),
                },
                '&:hover fieldset': {
                  borderColor: alpha(COLORS.PRIMARY, 0.28),
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.PRIMARY,
                },
              },
              '& .MuiInputLabel-root': {
                color: alpha(COLORS.PRIMARY, 0.7),
              },
              '& .MuiSelect-select': {
                color: COLORS.PRIMARY,
              },
              '& .MuiSelect-icon': {
                color: COLORS.PRIMARY,
              },
            }}
          >
            <InputLabel sx={{ color: alpha(COLORS.PRIMARY, 0.7) }}>{t('widgets.todos.priority')}</InputLabel>
            <Select
              value={severity}
              label={t('widgets.todos.priority')}
              onChange={handleSeverityChange}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSeverityBalloon(value)}
                  {value === 'HIGH' ? t('widgets.todos.priorityHigh') : 
                   value === 'MEDIUM' ? t('widgets.todos.priorityMedium') : 
                   t('widgets.todos.priorityLow')}
                </Box>
              )}
            >
              <MenuItem value="HIGH">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: getPriorityColor('HIGH') }} />
                  {t('widgets.todos.priorityHigh')}
                </Box>
              </MenuItem>
              <MenuItem value="MEDIUM">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: getPriorityColor('MEDIUM') }} />
                  {t('widgets.todos.priorityMedium')}
                </Box>
              </MenuItem>
              <MenuItem value="LOW">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: getPriorityColor('LOW') }} />
                  {t('widgets.todos.priorityLow')}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddTodo}
            disabled={!newTodoTitle.trim()}
            sx={{
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.WHITE,
              '&:hover': {
                backgroundColor: COLORS.PRIMARY_HOVER,
              },
              '&:disabled': {
                backgroundColor: alpha(COLORS.WHITE, 0.08),
                color: alpha(COLORS.WHITE, 0.45),
              },
            }}
          >
            {t('widgets.todos.addButton')}
          </Button>
        </Box>
      </Box>

      {/* TODOs List */}
      <Box sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
        <List dense>
          {todos.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={t('widgets.todos.noTodos')} 
                sx={{ '& .MuiListItemText-primary': { color: alpha(COLORS.PRIMARY, 0.6), fontStyle: 'italic' } }}
              />
            </ListItem>
          ) : (
            todos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(COLORS.PRIMARY, 0.1),
                  borderRadius: 1.5,
                  mb: 1.2,
                  backgroundColor: todo.completed 
                    ? 'rgba(26, 54, 93, 0.04)'
                    : 'rgba(26, 54, 93, 0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: todo.completed
                        ? 'rgba(26, 54, 93, 0.07)'
                        : 'rgba(26, 54, 93, 0.1)',
                  },
                  cursor: 'pointer'
                }}
                onClick={() => todo.id && handleToggleComplete(todo.id)}
              >
                <ListItemIcon>
                  {getSeverityBalloon(todo.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: COLORS.TEXT_PRIMARY,
                        opacity: todo.completed ? 0.7 : 1,
                        fontWeight: todo.completed ? 400 : 600,
                      }}
                    >
                      {todo.title}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    todo.id && handleDeleteTodo(todo.id);
                  }}
                  sx={{
                    color: '#ef9a9a',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 154, 154, 0.12)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default TodosWidget;
