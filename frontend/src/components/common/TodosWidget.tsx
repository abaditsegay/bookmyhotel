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
      elevation={3}
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#e8eaf6', // Light deep blue background
        p: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #1a237e', // Deep blue border
      }}
    >
      {/* Header */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: '#000000', // Black
          fontWeight: 700,
          borderBottom: '2px solid #1a237e',
          pb: 1
        }}
      >
        {t('widgets.todos.title')}
      </Typography>

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
              backgroundColor: '#f5f5f5', // Soft gray background
              '& fieldset': {
                borderColor: '#1a237e', // Deep blue border
              },
              '&:hover fieldset': {
                borderColor: '#283593', // Lighter deep blue on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0d1657', // Darker deep blue when focused
              },
            },
            '& .MuiInputBase-input': {
              color: '#000000', // Black text
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#1a237e', // Deep blue placeholder
              opacity: 0.7,
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 100,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5', // Soft gray background
                '& fieldset': {
                  borderColor: '#1a237e', // Deep blue border
                },
                '&:hover fieldset': {
                  borderColor: '#283593', // Lighter deep blue on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0d1657', // Darker deep blue when focused
                },
              },
              '& .MuiInputLabel-root': {
                color: '#1a237e', // Deep blue label
              },
              '& .MuiSelect-select': {
                color: '#000000', // Black text
              },
              '& .MuiSvgIcon-root': {
                color: '#1a237e', // Deep blue icon
              },
            }}
          >
            <InputLabel sx={{ color: '#1a237e' }}>{t('widgets.todos.priority')}</InputLabel>
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
              backgroundColor: '#ffd54f', // Warm gold button
              color: '#000000',
              '&:hover': {
                backgroundColor: '#ffb300', // Darker gold on hover
              },
              '&:disabled': {
                backgroundColor: '#fff9c4', // Light gold when disabled
                color: '#9e9e9e',
              },
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
                sx={{ '& .MuiListItemText-primary': { color: '#1a237e', fontStyle: 'italic' } }}
              />
            </ListItem>
          ) : (
            todos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  border: '1px solid',
                  borderColor: '#1a237e', // Deep blue border
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: todo.completed 
                    ? '#e0e0e0' // Soft gray completed background
                    : '#f5f5f5', // Light gray default background
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: todo.completed
                      ? '#bdbdbd' // Medium gray completed hover
                      : '#e0e0e0', // Soft gray default hover
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
                        color: '#000000', // Black text
                        fontWeight: todo.completed ? 400 : 500,
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
                    color: '#d32f2f', // Professional red for delete button
                    '&:hover': {
                      backgroundColor: '#e8eaf6', // Light deep blue background on hover
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
