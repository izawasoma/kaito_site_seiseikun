import { useState } from "react";
import SpeechThemePicker from "@/components/editor/fields/SpeechThemePicker";
import type { SpeechTheme } from "@/components/editor/speech/SpeechThemePreview";

export default function SpeechThemeExamples() {
  const [value, setValue] = useState<SpeechTheme>("rpg");

  return <SpeechThemePicker value={value} onChange={setValue} />;
}
