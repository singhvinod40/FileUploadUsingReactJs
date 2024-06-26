import React, { useRef, useState } from "react";
import "./FileUpload.css";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import { useLocation } from "react-router-dom";

const FileUpload = () => {
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfURL, setPdfURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");
  const location = useLocation();
  const username = location.state && location.state.username;
  const [message, setMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.background = "#042743";
    } else {
      setMode("light");
      document.body.style.background = "white";
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Check if the selected file is a PDF
      if (file.type === "application/pdf") {
        // Generate URL for PDF file
        const url = URL.createObjectURL(file);
        setPdfURL(url);
      } else {
        // Handle non-PDF file types if needed
        console.log("Selected file is not a PDF.");
      }
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setPdfURL("");
    setProgress(0);
    setUploadStatus("select");
  };

  const getPresignedUrl = async (fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/getPresignedUrl?fileName=${encodeURIComponent(
          fileName
        )}`
      );
      return response.data;
    } catch (error) {
      handleError(error, "Error fetching presigned URL");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file to upload");
      return;
    }

    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const presignedUrl = await getPresignedUrl(selectedFile.name);

      await axios.put(presignedUrl, selectedFile, {
        headers: {
          "Content-Type": selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      const filePath = `https://storage.googleapis.com/hackfest2024/${selectedFile.name}`;

      setUploadStatus("done");
      setFileUrl(filePath);
      setMessage("File uploaded successfully");
    } catch (error) {
      handleError(error, "Error uploading file");
    }
  };

  const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      setMessage(`Error: ${error.response.data}`);
    } else if (error.request) {
      console.error('Error request:', error.request);
      setMessage('Error: No response received from the server');
    } else {
      console.error('Error message:', error.message);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar
        title="HackFest 2024"
        mode={mode}
        toggleMode={toggleMode}
        username={username}
      />

<div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Button to trigger the file input dialog */}
      {!selectedFile && (
        <button className="file-btn" onClick={onChooseFile}>
          <span className="material-symbols-outlined">upload</span> Upload File
        </button>
      )}

      {selectedFile && (
        <>
          <div className="file-card">
            <span className="material-symbols-outlined icon">description</span>

            <div className="file-info">
              <div style={{ flex: 1 }}>
                <h6>{selectedFile?.name}</h6>

                <div className="progress-bg">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {uploadStatus === "select" ? (
                <button onClick={clearFileInput}>
                  <span class="material-symbols-outlined close-icon">
                    close
                  </span>
                </button>
              ) : (
                <div className="check-circle">
                  {uploadStatus === "uploading" ? (
                    `${progress}%`
                  ) : uploadStatus === "done" ? (
                    <span
                      class="material-symbols-outlined"
                      style={{ fontSize: "20px" }}
                    >
                      check
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <button className="upload-btn" onClick={handleFileUpload}>
            {uploadStatus === "select" || uploadStatus === 'uploading' ? "Upload" : "Done"}
          </button>
        </>
      )}
    </div>
    </>
  );
};

export default FileUpload;
