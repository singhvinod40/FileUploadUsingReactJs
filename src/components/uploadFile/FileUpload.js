import React, { useRef, useState } from "react";
import "./FileUpload.css";
import axios from "axios";
import DataDisplay from "../TableView/TableComponent";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const FileUpload = () => {
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfURL, setPdfURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [showDataDisplay, setShowDataDisplay] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPdfURL(url);
      } else {
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
    setFileUrl("");
    setShowDataDisplay(false);
    setShowButton(false);
  };

  const getPresignedUrl = async (fileName) => {
    try {
      const response = await axios.get(
        `https://asia-south1-apt-terrain-351005.cloudfunctions.net/fileUploadFunction?fileName=${encodeURIComponent(fileName)}`
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
      setShowButton(true);
    } catch (error) {
      handleError(error, "Error uploading file");
    }
  };

  const handleFileDelete = async () => {
    const bucketName = "hackfest2024"; // Replace with your bucket name
    const fileName = selectedFile.name; // The name of the file to delete

    try {
      await axios.post(
        'https://asia-south1-apt-terrain-351005.cloudfunctions.net/deleteFileFunction',
        {
          bucket_name: bucketName,
          file_name: fileName
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      toast.info("File Deleted Successfully!");
    } catch (error) {
      handleError(error, "Error deleting file");
    }
  };

  const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    if (error.response) {
      setMessage(`Error: ${error.response.data}`);
    } else if (error.request) {
      setMessage("Error: No response received from the server");
    } else {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {!selectedFile && (
          <button className="file-btn" onClick={onChooseFile}>
            <FaCloudUploadAlt size={60} />
            Upload File
          </button>
        )}

        {selectedFile && pdfURL && (
          <div className="pdf-preview">
            <iframe
              title="PDF Preview"
              width="800px"
              height="800px"
              src={pdfURL}
            ></iframe>
          </div>
        )}

        {selectedFile && (
          <>
            <div className="file-card">
              <span className="material-symbols-outlined icon">Description</span>

              <div className="file-info">
                <div style={{ flex: 1 }}>
                  <h6>{selectedFile?.name}</h6>

                  <div className="progress-bg">
                    <div
                      className="progress"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {uploadStatus === "select" ? (
                  <button onClick={clearFileInput}>
                    <span className="material-symbols-outlined close-icon">
                      close
                    </span>
                  </button>
                ) : (
                  <div className="check-circle">
                    {uploadStatus === "uploading" ? (
                      `${progress}%`
                    ) : uploadStatus === "done" ? (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px" }}
                      >
                        check
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <button type="button" className="upload-btn" onClick={handleFileUpload}>
              {uploadStatus === "select" || uploadStatus === "uploading"
                ? "Upload"
                : "Done"}
            </button>
          </>
        )}

        <div>
          {showButton && (
            <>
              <button type="button" className="btn btn-outline-success my-5" onClick={() => setShowDataDisplay(true)}>
                Run AI Model
              </button>
              <button type="button" className="btn btn-outline-danger my-5 mx-2" onClick={handleFileDelete}>
                Delete File
              </button>
            </>
          )}
          {showDataDisplay && (
            <DataDisplay fileUrl={fileUrl} />
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default FileUpload;
