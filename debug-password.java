import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class DebugPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String plainPassword = "admin123";
        String storedHash = "$2a$10$8K7K7K7K7K7K7K7K7K7K7O7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7"; // example
        
        System.out.println("Plain password: " + plainPassword);
        System.out.println("Stored hash: " + storedHash);
        System.out.println("Matches: " + encoder.matches(plainPassword, storedHash));
        
        // Generate a new hash for admin123
        String newHash = encoder.encode(plainPassword);
        System.out.println("New encoded hash for admin123: " + newHash);
        System.out.println("New hash matches: " + encoder.matches(plainPassword, newHash));
    }
}
