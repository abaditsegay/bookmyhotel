package com.bookmyhotel.controller;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing user todos
 */
@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    @Autowired
    private TodoService todoService;

    /**
     * Get all todos for the current user
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<List<Todo>> getUserTodos(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Todo> todos = todoService.getUserTodos(userEmail);
        return ResponseEntity.ok(todos);
    }

    /**
     * Get filtered todos with sorting
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping("/filtered")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<List<Todo>> getFilteredTodos(
            Authentication authentication,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String sortBy) {
        String userEmail = authentication.getName();
        List<Todo> todos = todoService.getUserTodosWithFilters(userEmail, completed, sortBy);
        return ResponseEntity.ok(todos);
    }

    /**
     * Get paginated todos
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Page<Todo>> getPaginatedTodos(
            Authentication authentication,
            Pageable pageable) {
        String userEmail = authentication.getName();
        Page<Todo> todos = todoService.getUserTodosPaginated(userEmail, pageable);
        return ResponseEntity.ok(todos);
    }

    /**
     * Get a specific todo by ID
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Todo> getTodoById(
            Authentication authentication,
            @PathVariable Long id) {
        String userEmail = authentication.getName();
        Optional<Todo> todo = todoService.getTodoById(userEmail, id);
        return todo.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new todo
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Todo> createTodo(
            Authentication authentication,
            @Valid @RequestBody Todo todoRequest) {
        String userEmail = authentication.getName();
        Todo createdTodo = todoService.createTodo(userEmail, todoRequest);
        return ResponseEntity.ok(createdTodo);
    }

    /**
     * Update an existing todo
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Todo> updateTodo(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody Todo todoRequest) {
        try {
            String userEmail = authentication.getName();
            Todo updatedTodo = todoService.updateTodo(userEmail, id, todoRequest);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Toggle todo completion status
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Todo> toggleTodoCompletion(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            String userEmail = authentication.getName();
            Todo updatedTodo = todoService.toggleTodoCompletion(userEmail, id);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a todo
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Void> deleteTodo(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            String userEmail = authentication.getName();
            todoService.deleteTodo(userEmail, id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get count of pending todos
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping("/pending/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<Long> getPendingTodosCount(Authentication authentication) {
        String userEmail = authentication.getName();
        long count = todoService.getPendingTodosCount(userEmail);
        return ResponseEntity.ok(count);
    }

    /**
     * Get overdue todos
     * Restricted to staff roles only - CUSTOMER and GUEST cannot access
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_ADMIN') or hasRole('HOTEL_MANAGER') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING')")
    public ResponseEntity<List<Todo>> getOverdueTodos(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Todo> overdueTodos = todoService.getOverdueTodos(userEmail);
        return ResponseEntity.ok(overdueTodos);
    }
}
