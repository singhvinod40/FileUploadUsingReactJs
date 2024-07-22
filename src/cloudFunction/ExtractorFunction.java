package com.example;

import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Map;
import com.google.gson.Gson;

public class ExtractFunction implements HttpFunction {

    private final Storage storage = StorageOptions.getDefaultInstance().getService();
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void service(HttpRequest request, HttpResponse response) throws IOException {
            
        // Set CORS headers
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

       
        Map<String, String> requestBody = new Gson().fromJson(request.getReader(), Map.class);
        String fileUri = requestBody.get("file_uri");
        String extractorUrl = requestBody.get("extractor_url");

        if (fileUri == null || extractorUrl == null) {
            response.setStatusCode(400);
            response.getWriter().write("Missing parameters");
            return;
        }

        try {
            // Parse the file URI to get bucket name and file name
            String[] uriParts = fileUri.replace("gs://", "").split("/", 2);
            if (uriParts.length != 2) {
                response.setStatusCode(400);
                response.getWriter().write("Invalid file URI format");
                return;
            }
            String bucketName = uriParts[0];
            String fileName = uriParts[1];

            // Retrieve the file from GCS
            Blob blob = storage.get(bucketName, fileName);
            if (blob == null) {
                response.setStatusCode(404);
                response.getWriter().write("File not found");
                return;
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            blob.downloadTo(outputStream);
            byte[] fileData = outputStream.toByteArray();

            // Send the file to the document extractor
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
            org.springframework.http.HttpEntity<byte[]> requestEntity = new org.springframework.http.HttpEntity<>(fileData, headers);

            ResponseEntity<String> extractorResponse = restTemplate.postForEntity(extractorUrl, requestEntity, String.class);

            // Return the extractor's response
            response.setStatusCode(extractorResponse.getStatusCodeValue());
            response.getWriter().write(extractorResponse.getBody());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}



<dependencies>
    <dependency>
        <groupId>com.google.cloud.functions</groupId>
        <artifactId>google-cloud-functions-framework</artifactId>
        <version>1.0.4</version>
    </dependency>
    <dependency>
        <groupId>com.google.cloud</groupId>
        <artifactId>google-cloud-storage</artifactId>
        <version>2.1.8</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>5.3.9</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>2.5.4</version>
    </dependency>
</dependencies>
