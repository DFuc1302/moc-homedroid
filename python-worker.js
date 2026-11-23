let pyodide;

self.onmessage = async ({ data }) => {
  if (data.type !== "run") return;
  try {
    if (!pyodide) {
      const { loadPyodide } = await import("/vendor/pyodide/pyodide.mjs");
      pyodide = await loadPyodide({ indexURL: "/vendor/pyodide/" });
      pyodide.setStdout({ batched: (text) => self.postMessage({ type: "stdout", text }) });
      pyodide.setStderr({ batched: (text) => self.postMessage({ type: "stderr", text }) });
    }
    await pyodide.loadPackagesFromImports(data.code);
    await pyodide.runPythonAsync(data.code);
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "stderr", text: String(error.message || error) });
    self.postMessage({ type: "done" });
  }
};
