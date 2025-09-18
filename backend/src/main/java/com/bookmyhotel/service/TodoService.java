package com.bookmyhotel.service;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.entity.Todo.Severity;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.repository.TodoRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    // UserService removed - using UserRepository directly

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get all todos for a user
     * System admins get their personal todos
     * Regular users get todos for their hotel created by them
     */
    public List<Todo> getUserTodos(String userEmail) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();

        // For system admin users, get their personal todos (not hotel-scoped)
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            return todoRepository.findByCreatedByOrderByCreatedAtDesc(user);
        }

        // For regular users, get todos scoped to their hotel
        Hotel hotel = getCurrentHotel(user);
        return todoRepository.findByCreatedByAndHotelOrderByCreatedAtDesc(user, hotel);
    }

    /**
     * Get todos by severity
     */
    public List<Todo> getUserTodosBySeverity(String userEmail, Todo.Severity severity) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();

        // For system admin users, get their personal todos (not hotel-scoped)
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // Note: We'd need a custom repository method for this, for now return empty
            // list
            return List.of(); // TODO: implement findByCreatedByAndSeverityOrderByCreatedAtDesc
        }

        Hotel hotel = getCurrentHotel(user);
        return todoRepository.findByCreatedByAndHotelAndSeverityOrderByCreatedAtDesc(user, hotel, severity);
    }

    /**
     * Get paginated todos for the current user
     */
    public Page<Todo> getUserTodosPaginated(String userEmail, Pageable pageable) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();

        // For system admin users, get their personal todos (not hotel-scoped)
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // Note: We'd need a custom repository method for this, for now return empty
            // page
            return Page.empty(); // TODO: implement findByCreatedBy with pagination
        }

        Hotel hotel = getCurrentHotel(user);
        return todoRepository.findByCreatedByAndHotel(user, hotel, pageable);
    }

    /**
     * Create a new todo
     */
    public Todo createTodo(String userEmail, Todo todoRequest) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();

        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setSeverity(todoRequest.getSeverity());
        todo.setCategory(todoRequest.getCategory());
        todo.setDueDate(todoRequest.getDueDate());
        // todo.setCompleted(false); // Temporarily removed - will add back after schema
        // sync
        todo.setCreatedBy(user);
        todo.setCreatedAt(LocalDateTime.now());

        // For system admin users, create personal todos (not hotel-scoped)
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // System admin todos are not associated with any hotel
            todo.setHotel(null);
        } else {
            // For regular users, associate todo with their hotel
            Hotel hotel = getCurrentHotel(user);
            todo.setHotel(hotel);
        }

        return todoRepository.save(todo);
    }

    /**
     * Update an existing todo
     */
    public Todo updateTodo(String userEmail, Long todoId, Todo todoRequest) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Security check: Ensure user can only update their own todos
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // System admin can only update their own personal todos
            if (!todo.getCreatedBy().equals(user)) {
                throw new RuntimeException("Access denied: You can only update your own todos");
            }
        } else {
            // Regular users can only update todos from their hotel
            Hotel userHotel = getCurrentHotel(user);
            if (!todo.getHotel().equals(userHotel) || !todo.getCreatedBy().equals(user)) {
                throw new RuntimeException("Access denied: You can only update your own todos");
            }
        }

        // Update todo fields
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setSeverity(todoRequest.getSeverity());
        todo.setCategory(todoRequest.getCategory());
        todo.setDueDate(todoRequest.getDueDate());
        // todo.setCompleted(todoRequest.isCompleted()); // Temporarily removed - will
        // add back after schema sync
        todo.setUpdatedAt(LocalDateTime.now());

        return todoRepository.save(todo);
    }

    /**
     * Update todo completion status only
     */
    public Todo updateTodoStatus(String userEmail, Long todoId, boolean completed) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Security check: Ensure user can only update their own todos
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // System admin can only update their own personal todos
            if (!todo.getCreatedBy().equals(user)) {
                throw new RuntimeException("Access denied: You can only update your own todos");
            }
        } else {
            // Regular users can only update todos from their hotel
            Hotel userHotel = getCurrentHotel(user);
            if (!todo.getHotel().equals(userHotel)) {
                throw new RuntimeException("Access denied: Todo not found in your hotel");
            }
        }

        // todo.setCompleted(completed); // Temporarily removed - will add back after
        // schema sync
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    /**
     * Delete a todo
     */
    public void deleteTodo(String userEmail, Long todoId) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userEmail);
        }
        User user = userOpt.get();
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Security check: Ensure user can only delete their own todos
        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            // System admin can only delete their own personal todos
            if (!todo.getCreatedBy().equals(user)) {
                throw new RuntimeException("Access denied: You can only delete your own todos");
            }
        } else {
            // Regular users can only delete todos from their hotel
            Hotel userHotel = getCurrentHotel(user);
            if (!todo.getHotel().equals(userHotel)) {
                throw new RuntimeException("Access denied: Todo not found in your hotel");
            }
        }

        todoRepository.delete(todo);
    }

    /**
     * Get a specific todo by ID
     */
    public Optional<Todo> getTodoById(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        return todoRepository.findByIdAndCreatedByAndHotel(todoId, user, hotel);
    }

    /**
     * Get count of todos by severity
     */
    public long getTodoCountBySeverity(String userEmail, Todo.Severity severity) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        return todoRepository.countBySeverity(user, hotel, severity);
    }

    /**
     * Get overdue todos
     */
    public List<Todo> getOverdueTodos(String userEmail) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        return todoRepository.findOverdueTodos(user, hotel, LocalDateTime.now());
    }

    /**
     * Get current user by email
     */
    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    /**
     * Get current tenant from context
     * For system-wide users, returns null (they don't operate within a tenant
     * context)
     */
    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            // System-wide users (SYSTEM_ADMIN) don't have tenant context
            // This is allowed for system administrators
            return null;
        }
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));
    }

    /**
     * Get current hotel from user context
     */
    private Hotel getCurrentHotel(User user) {
        if (user.getHotel() == null) {
            throw new RuntimeException("User must be associated with a hotel to manage todos");
        }
        return user.getHotel();
    }

    /**
     * Get todos with filters - placeholder method for TodoController compatibility
     */
    public List<Todo> getUserTodosWithFilters(String userEmail, Boolean completed, String sortBy) {
        // For now, just return all todos. Can be enhanced later with actual filtering
        return getUserTodos(userEmail);
    }

    /**
     * Toggle todo completion status - placeholder method for TodoController
     * compatibility
     */
    public Todo toggleTodoCompletion(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        Optional<Todo> existingTodo = todoRepository.findByIdAndCreatedByAndHotel(todoId, user, hotel);

        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to update it");
        }

        Todo todo = existingTodo.get();
        // Assuming there's a completed field, toggle it
        // todo.setCompleted(!todo.isCompleted());
        todo.setUpdatedAt(LocalDateTime.now());

        return todoRepository.save(todo);
    }

    /**
     * Get count of pending todos - placeholder method for TodoController
     * compatibility
     */
    public long getPendingTodosCount(String userEmail) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        // Return count of all todos for now - can be enhanced with actual pending logic
        return todoRepository.findByCreatedByAndHotelOrderByCreatedAtDesc(user, hotel).size();
    }
}
