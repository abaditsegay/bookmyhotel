import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Chip,
  Typography,
  useTheme,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { designSystem } from '../../theme/designSystem';

export interface SearchFilter {
  id: string;
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { label: string; value: string | number }[];
}

export interface AdvancedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onClear?: () => void;
  suggestions?: string[];
  filters?: SearchFilter[];
  loading?: boolean;
  debounceMs?: number;
  showFilterCount?: boolean;
  enableVoiceSearch?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  suggestions = [],
  filters = [],
  loading = false,
  debounceMs = 300,
  showFilterCount = true,
  enableVoiceSearch = false,
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [focused, setFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || activeFilters.length > 0) {
        onSearch(query.trim(), activeFilters);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, activeFilters, onSearch, debounceMs]);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query, suggestions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
    setAnchorEl(event.currentTarget);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, activeFilters);
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilters([]);
    setShowSuggestions(false);
    onClear?.();
  };

  const handleAddFilter = (filter: SearchFilter) => {
    const existingIndex = activeFilters.findIndex(f => f.id === filter.id);
    if (existingIndex >= 0) {
      const newFilters = [...activeFilters];
      newFilters[existingIndex] = filter;
      setActiveFilters(newFilters);
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  const handleFocus = () => {
    setFocused(true);
    if (query && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
        <Box sx={{ position: 'relative' }}>
          {/* Main Search Input */}
          <TextField
            fullWidth
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon 
                    sx={{ 
                      color: focused ? theme.palette.primary.main : theme.palette.text.secondary,
                      transition: 'color 0.2s ease',
                    }} 
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {loading && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          border: `2px solid ${theme.palette.primary.main}`,
                          borderTop: `2px solid transparent`,
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      />
                    )}
                    {showFilterCount && activeFilters.length > 0 && (
                      <Chip
                        size="small"
                        label={activeFilters.length}
                        color="primary"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                    )}
                    {(query || activeFilters.length > 0) && (
                      <IconButton
                        size="small"
                        onClick={handleClear}
                        sx={{ p: 0.5 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </InputAdornment>
              ),
              sx: {
                borderRadius: designSystem.borderRadius.lg,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.background.paper,
                  transform: 'translateY(-1px)',
                  boxShadow: designSystem.shadows.md,
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Suggestions Dropdown */}
          <Popper
            open={showSuggestions}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ width: anchorEl?.offsetWidth || 'auto', zIndex: 1300 }}
            transition
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <Paper
                  elevation={8}
                  sx={{
                    mt: 0.5,
                    maxHeight: 200,
                    overflow: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: designSystem.borderRadius.md,
                  }}
                >
                  <List dense>
                    {filteredSuggestions.map((suggestion, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={suggestion}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>
      </ClickAwayListener>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary', 
              alignSelf: 'center',
              mr: 1,
              fontWeight: 600,
            }}
          >
            Filters:
          </Typography>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.label}: ${filter.value}`}
              onDelete={() => handleRemoveFilter(filter.id)}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: theme.palette.primary.main + '10',
                borderColor: theme.palette.primary.main,
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdvancedSearch;