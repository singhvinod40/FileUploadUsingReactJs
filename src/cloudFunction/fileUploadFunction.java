package gcfv2;

import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.io.IOException;
import java.net.URL;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.HttpMethod;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.Storage.SignUrlOption;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;

@WebServlet(value = "/get-presigned-url")
public class HelloHttpFunction implements HttpFunction {
  private static final Logger logger = Logger.getLogger(HelloHttpFunction.class.getName());
  private static final String BUCKET_NAME = "hackfest2024"; // Replace with your bucket name

  @Override
  public void service(HttpRequest request, HttpResponse response) throws IOException {
    // Set CORS headers
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      response.setStatusCode(HttpServletResponse.SC_NO_CONTENT);
      return;
    }

    String fileName = request.getFirstQueryParameter("fileName").orElse("");

    if (fileName.isEmpty()) {
      response.setStatusCode(HttpServletResponse.SC_BAD_REQUEST);
      response.getWriter().write("Missing 'fileName' parameter");
      return;
    }

    try {
      // Fetch your service account credentials JSON from Cloud Storage or elsewhere
      byte[] decodedKey = Base64.getDecoder().decode(System.getenv("GOOGLE_APPLICATION_CREDENTIALS_BASE64"));
      ByteArrayInputStream credentialsStream = new ByteArrayInputStream(decodedKey);

      // Initialize Storage client with service account credentials
      Storage storage = StorageOptions.newBuilder()
          .setCredentials(ServiceAccountCredentials.fromStream(credentialsStream))
          .build()
          .getService();

      // Define BlobInfo and generate presigned URL
      BlobInfo blobInfo = BlobInfo.newBuilder(BUCKET_NAME, fileName).setContentType("application/pdf").build();
      URL url = storage.signUrl(blobInfo, 15, TimeUnit.MINUTES, SignUrlOption.httpMethod(HttpMethod.PUT), SignUrlOption.withContentType());

      response.setContentType("text/plain");
      response.setStatusCode(HttpServletResponse.SC_OK);
      response.getWriter().write(url.toString());
    } catch (Exception e) {
      logger.severe("Error generating presigned URL: " + e.getMessage());
      response.setStatusCode(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.getWriter().write("Error generating presigned URL: " + e.getMessage());
    }
  }
}


<dependencies>
   <dependency>
     <groupId>com.google.cloud.functions</groupId>
     <artifactId>functions-framework-api</artifactId>
     <version>1.0.4</version>
   </dependency>

    <dependency>
        <groupId>com.google.cloud</groupId>
        <artifactId>google-cloud-storage</artifactId>
        <version>2.4.0</version> <!-- Replace with the latest version -->
    </dependency>

    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version> <!-- Replace with the latest version -->
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>com.google.auth</groupId>
        <artifactId>google-auth-library-oauth2-http</artifactId>
        <version>0.26.0</version> <!-- Replace with the latest version -->
    </dependency>




 </dependencies>