package com.bookmyhotel.service;

import com.bookmyhotel.entity.Todo;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.Tenant;
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
     * Get all todos for the current user in the current tenant
     */
    public List<Todo> getUserTodos(String userEmail) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        return todoRepository.findByUserAndTenantOrderByCreatedAtDesc(user, tenant);
    }

    /**
     * Get todos with filters and sorting
     */
    public List<Todo> getUserTodosWithFilters(String userEmail, Boolean completed, String sortBy) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        
        if (sortBy == null) {
            sortBy = "created";
        }
        
        return todoRepository.findUserTodosWithFiltersAndSorting(user, tenant, completed, sortBy);
    }

    /**
     * Get paginated todos for the current user
     */
    public Page<Todo> getUserTodosPaginated(String userEmail, Pageable pageable) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        return todoRepository.findByUserAndTenant(user, tenant, pageable);
    }

    /**
     * Create a new todo
     */
    public Todo createTodo(String userEmail, Todo todoRequest) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        
        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setPriority(todoRequest.getPriority());
        todo.setDueDate(todoRequest.getDueDate());
        todo.setCategory(todoRequest.getCategory());
        todo.setCompleted(false);
        todo.setUser(user);
        todo.setTenant(tenant);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(todo);
    }

    /**
     * Update an existing todo
     */
    public Todo updateTodo(String userEmail, Long todoId, Todo todoRequest) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        
        Optional<Todo> existingTodo = todoRepository.findByIdAndUserAndTenant(todoId, user, tenant);
        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to update it");
        }
        
        Todo todo = existingTodo.get();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setPriority(todoRequest.getPriority());
        todo.setDueDate(todoRequest.getDueDate());
        todo.setCategory(todoRequest.getCategory());
        todo.setCompleted(todoRequest.getCompleted());
        todo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(todo);
    }

    /**
     * Toggle todo completion status
     */
    public Todo toggleTodoCompletion(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        
        Optional<Todo> existingTodo = todoRepository.findByIdAndUserAndTenant(todoId, user, tenant);
        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to update it");
        }
        
        Todo todo = existingTodo.get();
        todo.setCompleted(!todo.getCompleted());
        todo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(todo);
    }

    /**
     * Delete a todo
     */
    public void deleteTodo(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        
        Optional<Todo> existingTodo = todoRepository.findByIdAndUserAndTenant(todoId, user, tenant);
        if (existingTodo.isEmpty()) {
            throw new RuntimeException("Todo not found or you don't have permission to delete it");
        }
        
        todoRepository.deleteByIdAndUserAndTenant(todoId, user, tenant);
    }

    /**
     * Get a specific todo by ID
     */
    public Optional<Todo> getTodoById(String userEmail, Long todoId) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        return todoRepository.findByIdAndUserAndTenant(todoId, user, tenant);
    }

    /**
     * Get count of pending todos
     */
    public long getPendingTodosCount(String userEmail) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        return todoRepository.countPendingTodos(user, tenant);
    }

    /**
     * Get overdue todos
     */
    public List<Todo> getOverdueTodos(String userEmail) {
        User user = getCurrentUser(userEmail);
        Tenant tenant = getCurrentTenant();
        return todoRepository.findOverdueTodos(user, tenant, LocalDateTime.now());
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
     */
    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new RuntimeException("No tenant context available");
        }
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));
    }
}
