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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Todo, useTodoApi } from '../../services/todoApi';

interface TodosWidgetProps {
  width?: string | number;
  height?: string | number;
}

export const TodosWidget: React.FC<TodosWidgetProps> = ({ 
  width = '100%', 
  height = 400 
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

  const getSeverityBalloon = (severity: string) => {
    // Normalize severity to uppercase to handle case variations
    const normalizedSeverity = severity?.toUpperCase();
    
    switch (normalizedSeverity) {
      case 'HIGH': 
        return <CircleIcon sx={{ fontSize: '16px', color: 'error.main' }} />;
      case 'MEDIUM': 
        return <CircleIcon sx={{ fontSize: '16px', color: 'warning.main' }} />;
      case 'LOW': 
        return <CircleIcon sx={{ fontSize: '16px', color: 'success.main' }} />;
      default: 
        return <CircleIcon sx={{ fontSize: '16px', color: 'text.disabled' }} />;
    }
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
      elevation={0}
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#e8f5e9', // Light orange background
        p: 2,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>{t('widgets.todos.title')}</Typography>

      {/* Error display */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1, color: '#d32f2f' }}>
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
              backgroundColor: '#e8f5e9', // Light orange background
              '& fieldset': {
                borderColor: '#ffab91', // Light orange border
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
            '& .MuiInputBase-input': {
              color: 'primary.dark',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'primary.light',
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
                backgroundColor: '#e8f5e9', // Light orange background
                '& fieldset': {
                  borderColor: '#ffab91', // Light orange border
                },
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'primary.main',
              },
              '& .MuiSelect-select': {
                color: 'primary.dark',
              },
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
              },
            }}
          >
            <InputLabel sx={{ color: 'primary.main' }}>{t('widgets.todos.priority')}</InputLabel>
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
                  <CircleIcon sx={{ fontSize: '14px', color: 'error.main' }} />
                  {t('widgets.todos.priorityHigh')}
                </Box>
              </MenuItem>
              <MenuItem value="MEDIUM">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: 'warning.main' }} />
                  {t('widgets.todos.priorityMedium')}
                </Box>
              </MenuItem>
              <MenuItem value="LOW">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: 'success.main' }} />
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
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'primary.light',
              }
            }}
          >
            {t('widgets.todos.addButton')}
          </Button>
        </Box>
      </Box>

      {/* TODOs List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {todos.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={t('widgets.todos.noTodos')} 
                sx={{ '& .MuiListItemText-primary': { color: 'primary.light' } }}
              />
            </ListItem>
          ) : (
            todos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  border: '1px solid',
                  borderColor: '#ffab91', // Light orange border
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: todo.completed 
                    ? '#ffccbc' // Light orange completed background
                    : '#e8f5e9', // Very light orange default background
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: todo.completed
                      ? '#ffab91' // Medium orange completed hover
                      : '#ffccbc', // Light orange default hover
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
                        color: todo.completed ? 'text.secondary' : 'text.primary',
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
                  color="error"
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
