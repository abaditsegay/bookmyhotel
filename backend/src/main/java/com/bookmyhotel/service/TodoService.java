package com.bookmyhotel.service;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.entity.Todo.Severity;
import com.bookmyhotel.entity.User;
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

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get all todos for a user
     */
    public List<Todo> getUserTodos(String userEmail) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);
        
        return todoRepository.findByCreatedByAndHotelOrderByCreatedAtDesc(user, hotel);
    }

    /**
     * Get todos by severity
     */
    public List<Todo> getUserTodosBySeverity(String userEmail, Todo.Severity severity) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);
        
        return todoRepository.findByCreatedByAndHotelAndSeverityOrderByCreatedAtDesc(user, hotel, severity);
    }

    /**
     * Get paginated todos for the current user
     */
    public Page<Todo> getUserTodosPaginated(String userEmail, Pageable pageable) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);
        
        return todoRepository.findByCreatedByAndHotel(user, hotel, pageable);
    }

    /**
     * Create a new todo
     */
    public Todo createTodo(String userEmail, Todo todoRequest) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user); // Get hotel from user context

        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setSeverity(todoRequest.getSeverity() != null ? todoRequest.getSeverity() : Severity.MEDIUM);
        todo.setDueDate(todoRequest.getDueDate());
        todo.setCategory(todoRequest.getCategory());
        todo.setHotel(hotel);
        todo.setCreatedBy(user);

        return todoRepository.save(todo);
    }

    /**
     * Update an existing todo
     */
    public Todo updateTodo(String userEmail, Long todoId, Todo todoRequest) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        Optional<Todo> existingTodo = todoRepository.findByIdAndCreatedByAndHotel(todoId, user, hotel);

        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to update it");
        }

        Todo todo = existingTodo.get();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setSeverity(todoRequest.getSeverity());
        todo.setDueDate(todoRequest.getDueDate());
        todo.setCategory(todoRequest.getCategory());
        todo.setUpdatedAt(LocalDateTime.now());

        return todoRepository.save(todo);
    }

    /**
     * Delete a todo
     */
    public void deleteTodo(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Hotel hotel = getCurrentHotel(user);

        Optional<Todo> existingTodo = todoRepository.findByIdAndCreatedByAndHotel(todoId, user, hotel);

        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to delete it");
        }

        todoRepository.deleteByIdAndCreatedByAndHotel(todoId, user, hotel);
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
}
