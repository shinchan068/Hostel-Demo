export async function readBoundedJson(body: ReadableStream<Uint8Array> | null, maxBytes: number): Promise<unknown> {
  if (!body) throw new SyntaxError("Missing JSON body");
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RangeError("JSON body is too large");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
