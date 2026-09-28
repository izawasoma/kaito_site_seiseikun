import { useState } from "react";
import ImageFields, {
  type ImageValue,
} from "@/components/editor/fields/ImageFields";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";

export default function ImageExamples() {
  const [value, setValue] = useState<ImageValue>({
    url: "",
    alt: "",
    width: 650,
  });

  return (
    <section>
      <SettingsPanelHeader title="画像" icon="image" />

      <ImageFields
        value={value}
        onChange={setValue}
        urlError={value.url.trim() === "" ? "URLは必須項目です" : undefined}
      />
    </section>
  );
}
