/**
 * AudioWorklet — streams mic samples to main thread (replaces deprecated ScriptProcessorNode).
 * MUST copy the buffer — the input array is reused by the audio engine.
 */
class PcmWorkletProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel?.length) {
      this.port.postMessage(new Float32Array(channel));
    }
    return true;
  }
}

registerProcessor('pcm-worklet-processor', PcmWorkletProcessor);
