
import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

public class HelloHttpFunction implements HttpFunction {

    private static final Logger logger = Logger.getLogger(HelloHttpFunction.class.getName());

    private static final Map<String, String> authMap = new HashMap<>();

    // Initialize your authentication map with username-password pairs
    static {
        authMap.put("knight", "hackers");
        authMap.put("Dhana", "hacker1");
        authMap.put("Wynn", "hacker2");
        authMap.put("vinod", "hacker3");
        authMap.put("Devi", "hacker4");
    }

    @Override
    public void service(HttpRequest request, HttpResponse response) throws IOException {
        // Set CORS headers
        // Set CORS headers
        response.appendHeader("Access-Control-Allow-Origin", "*");
        response.appendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.appendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatusCode(204); // No Content for OPTIONS request
            return;
        }

        String username = request.getFirstQueryParameter("username").orElse("");
        String password = request.getFirstQueryParameter("password").orElse("");

        PrintWriter writer = new PrintWriter(response.getWriter());

        if (authMap.containsKey(username) && authMap.get(username).equals(password)) {
            writer.write("Login successful");
            response.setStatusCode(200);
        } else {
            writer.write("Login failed");
            response.setStatusCode(401);
        }

        writer.flush();  // Ensure that all data is written out
    }
}