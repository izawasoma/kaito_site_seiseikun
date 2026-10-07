import { useEffect, useRef } from "react";
import styled from "styled-components";
import { monaco } from "./monacoSetup";

/** モデルとイベントを破棄し、入力中はエディターを作り直さず変更を通知する。 */
export default function CodeEditor({ language, value, onChange }: {
  language: "html" | "css" | "javascript"; value: string; onChange: (value: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const callback = useRef(onChange);
  const initialValue = useRef(value);
  useEffect(() => { callback.current = onChange; }, [onChange]);
  useEffect(() => {
    const model = monaco.editor.createModel(initialValue.current, language);
    const instance = monaco.editor.create(container.current!, {
      model, theme: "vs-dark", automaticLayout: true, minimap: { enabled: false },
      fontSize: 12, lineNumbersMinChars: 3, scrollBeyondLastLine: false,
      wordWrap: "on", tabSize: 2, fixedOverflowWidgets: true,
      ariaLabel: `${language}コードを記入`, quickSuggestions: true,
    });
    editor.current = instance;
    const subscription = instance.onDidChangeModelContent(() => callback.current(instance.getValue()));
    return () => { subscription.dispose(); instance.dispose(); model.dispose(); editor.current = null; };
  }, [language]);
  useEffect(() => {
    if (editor.current && editor.current.getValue() !== value) editor.current.setValue(value);
  }, [value]);
  return <EditorArea ref={container} />;
}
const EditorArea = styled.div`height: 180px; min-width: 0; width: 100%;`;
