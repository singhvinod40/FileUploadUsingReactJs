import React, { useState } from 'react';

function App() {
    const [filePath, setFilePath] = useState('');
    const [result, setResult] = useState('');

    const handleRunScript = async () => {
        try {
            const response = await fetch('http://localhost:5000/run-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file_path: filePath })
            });

            const data = await response.json();
            if (response.ok) {
                setResult(JSON.stringify(data, null, 2));
            } else {
                setResult(`Error: ${data.error}`);
            }
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Run Python Script</h1>
            <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="Enter file path"
            />
            <button onClick={handleRunScript}>Run Script</button>
            <pre>{result}</pre>
        </div>
    );
}

export default App;
