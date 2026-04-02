export interface RunResult {
  output: string[];
  error: string | null;
}

export function runCode(code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ output: [], error: "タイムアウト：処理が5秒以内に完了しませんでした" });
    }, 5000);

    function cleanup() {
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      document.body.removeChild(iframe);
    }

    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "run-result") return;
      cleanup();
      resolve({ output: event.data.output, error: event.data.error });
    }

    window.addEventListener("message", onMessage);

    const html = `
      <script>
        const logs = [];
        console.log = (...args) => {
          logs.push(args.map(a => JSON.stringify(a)).join(" "));
        };
        try {
          ${code}
          Promise.resolve().then(() => {
            setTimeout(() => {
              parent.postMessage({ type: "run-result", output: logs, error: null }, "*");
            }, 0);
          });
        } catch (e) {
          parent.postMessage({ type: "run-result", output: logs, error: e.message }, "*");
        }
      <\/script>
    `;

    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    iframe.src = URL.createObjectURL(blob);
  });
}

export function judge(output: string[], expected: string): boolean {
  return output.join("\n").trim() === expected.trim();
}
