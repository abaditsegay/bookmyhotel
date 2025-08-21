package com.bookmyhotel.controller;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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
     */
    @GetMapping
    public ResponseEntity<List<Todo>> getUserTodos(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Todo> todos = todoService.getUserTodos(userEmail);
        return ResponseEntity.ok(todos);
    }

    /**
     * Get filtered todos with sorting
     */
    @GetMapping("/filtered")
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
     */
    @GetMapping("/paginated")
    public ResponseEntity<Page<Todo>> getPaginatedTodos(
            Authentication authentication,
            Pageable pageable) {
        String userEmail = authentication.getName();
        Page<Todo> todos = todoService.getUserTodosPaginated(userEmail, pageable);
        return ResponseEntity.ok(todos);
    }

    /**
     * Get a specific todo by ID
     */
    @GetMapping("/{id}")
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
     */
    @PostMapping
    public ResponseEntity<Todo> createTodo(
            Authentication authentication,
            @Valid @RequestBody Todo todoRequest) {
        String userEmail = authentication.getName();
        Todo createdTodo = todoService.createTodo(userEmail, todoRequest);
        return ResponseEntity.ok(createdTodo);
    }

    /**
     * Update an existing todo
     */
    @PutMapping("/{id}")
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
     */
    @PatchMapping("/{id}/toggle")
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
     */
    @DeleteMapping("/{id}")
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
     */
    @GetMapping("/pending/count")
    public ResponseEntity<Long> getPendingTodosCount(Authentication authentication) {
        String userEmail = authentication.getName();
        long count = todoService.getPendingTodosCount(userEmail);
        return ResponseEntity.ok(count);
    }

    /**
     * Get overdue todos
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<Todo>> getOverdueTodos(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Todo> overdueTodos = todoService.getOverdueTodos(userEmail);
        return ResponseEntity.ok(overdueTodos);
    }
}
