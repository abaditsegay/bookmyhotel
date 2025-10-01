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
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Todo, useTodoApi } from '../../services/todoApi';
import { designSystem } from '../../theme/designSystem';
import { COLORS } from '../../theme/themeColors';

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
  const theme = useTheme();
  
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
      setError('Failed to load todos');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  }, [todoApi, hasAccess]);

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
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleComplete = async (id: number) => {
    try {
      const updatedTodo = await todoApi.toggleTodoCompletion(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const getSeverityBalloon = (severity: string) => {
    // Normalize severity to uppercase to handle case variations
    const normalizedSeverity = severity?.toUpperCase();
    
    switch (normalizedSeverity) {
      case 'HIGH': 
        return <CircleIcon sx={{ fontSize: '16px', color: theme.palette.error.main }} />;
      case 'MEDIUM': 
        return <CircleIcon sx={{ fontSize: '16px', color: COLORS.SECONDARY }} />;
      case 'LOW': 
        return <CircleIcon sx={{ fontSize: '16px', color: COLORS.PRIMARY }} />;
      default: 
        return <CircleIcon sx={{ fontSize: '16px', color: theme.palette.info.main }} />;
    }
  };

  const handleSeverityChange = (event: SelectChangeEvent<string>) => {
    setSeverity(event.target.value as 'HIGH' | 'MEDIUM' | 'LOW');
  };

  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading todos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 2 }}>TODOs</Typography>

      {/* Error display */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      {/* Add TODO Form */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Add a new TODO..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTodo();
            }
          }}
          sx={{ width: '100%', mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={severity}
              label="Priority"
              onChange={handleSeverityChange}
            >
              <MenuItem value="HIGH">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: theme.palette.error.main }} />
                  High
                </Box>
              </MenuItem>
              <MenuItem value="MEDIUM">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: COLORS.SECONDARY }} />
                  Medium
                </Box>
              </MenuItem>
              <MenuItem value="LOW">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircleIcon sx={{ fontSize: '14px', color: COLORS.PRIMARY }} />
                  Low
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
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* TODOs List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {todos.length === 0 ? (
            <ListItem>
              <ListItemText primary="No todos yet. Add one above!" />
            </ListItem>
          ) : (
            todos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: todo.completed 
                    ? theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.03)' 
                      : 'grey.50'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: todo.completed
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'grey.100'
                      : theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'grey.50',
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
    </Box>
  );
};

export default TodosWidget;
