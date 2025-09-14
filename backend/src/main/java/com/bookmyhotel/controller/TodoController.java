package com.bookmyhotel.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.service.TodoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/todos")
@Tag(name = "Todos", description = "Todo management operations")
@SecurityRequirement(name = "bearerAuth")
public class TodoController {

    @Autowired
    private TodoService todoService;

    @GetMapping
    @Operation(summary = "Get all todos for the current user")
    public ResponseEntity<?> getUserTodos(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String sortBy) {

        // Check if user has GUEST or CUSTOMER role - these roles should not have access to todos
        if (hasGuestOrCustomerRole(userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: Todos are not available for guest and customer users");
        }

        try {
            List<Todo> todos;
            if (completed != null || sortBy != null) {
                todos = todoService.getUserTodosWithFilters(userDetails.getUsername(), completed, sortBy);
            } else {
                todos = todoService.getUserTodos(userDetails.getUsername());
            }

            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch todos: " + e.getMessage());
        }
    }

    @GetMapping("/filtered")
    @Operation(summary = "Get filtered todos for the current user")
    public ResponseEntity<?> getFilteredTodos(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String sortBy) {

        try {
            List<Todo> todos = todoService.getUserTodosWithFilters(userDetails.getUsername(), completed, sortBy);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch filtered todos: " + e.getMessage());
        }
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated todos for the current user")
    public ResponseEntity<?> getUserTodosPaginated(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        try {
            Page<Todo> todos = todoService.getUserTodosPaginated(userDetails.getUsername(), pageable);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch paginated todos: " + e.getMessage());
        }
    }

    @GetMapping("/severity/{severity}")
    @Operation(summary = "Get todos by severity for the current user")
    public ResponseEntity<?> getUserTodosBySeverity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Todo.Severity severity) {

        try {
            List<Todo> todos = todoService.getUserTodosBySeverity(userDetails.getUsername(), severity);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch todos by severity: " + e.getMessage());
        }
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue todos for the current user")
    public ResponseEntity<?> getOverdueTodos(
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            List<Todo> todos = todoService.getOverdueTodos(userDetails.getUsername());
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch overdue todos: " + e.getMessage());
        }
    }

    @GetMapping("/pending/count")
    @Operation(summary = "Get count of pending todos for the current user")
    public ResponseEntity<?> getPendingTodosCount(
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            long count = todoService.getPendingTodosCount(userDetails.getUsername());
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get pending todos count: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific todo by ID")
    public ResponseEntity<?> getTodoById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        try {
            Optional<Todo> todo = todoService.getTodoById(userDetails.getUsername(), id);
            if (todo.isPresent()) {
                return ResponseEntity.ok(todo.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch todo: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "Create a new todo")
    public ResponseEntity<?> createTodo(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody Todo todoRequest) {

        // Check if user has GUEST or CUSTOMER role - these roles should not have access to todos
        if (hasGuestOrCustomerRole(userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: Todos are not available for guest and customer users");
        }

        try {
            Todo createdTodo = todoService.createTodo(userDetails.getUsername(), todoRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create todo: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing todo")
    public ResponseEntity<?> updateTodo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody Todo todoRequest) {

        try {
            Todo updatedTodo = todoService.updateTodo(userDetails.getUsername(), id, todoRequest);
            return ResponseEntity.ok(updatedTodo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update todo: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle todo completion status")
    public ResponseEntity<?> toggleTodoCompletion(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        try {
            Todo toggledTodo = todoService.toggleTodoCompletion(userDetails.getUsername(), id);
            return ResponseEntity.ok(toggledTodo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to toggle todo completion: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a todo")
    public ResponseEntity<?> deleteTodo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        // Check if user has GUEST or CUSTOMER role - these roles should not have access to todos
        if (hasGuestOrCustomerRole(userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: Todos are not available for guest and customer users");
        }

        try {
            todoService.deleteTodo(userDetails.getUsername(), id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete todo");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Helper method to check if user has GUEST or CUSTOMER role
     */
    private boolean hasGuestOrCustomerRole(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_GUEST") || role.equals("ROLE_CUSTOMER"));
    }
}
