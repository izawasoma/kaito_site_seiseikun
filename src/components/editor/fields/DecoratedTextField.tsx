import { useId, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";
import { fieldStyles } from "@/components/ui/form/fieldStyles";
import TextDecorationToolbar, {
  type DecorationTag,
} from "@/components/editor/fields/TextDecorationToolbar";

type DecoratedTextFieldProps = FieldDescription & {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
};

export default function DecoratedTextField({
  label,
  required,
  helperText,
  error,
  value,
  onChange,
  multiline = false,
  rows = 5,
  disabled = false,
}: DecoratedTextFieldProps) {
  const id = useId();
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const pendingSelection = useRef<{
    start: number;
    end: number;
  } | null>(null);

  const describedBy = [
    helperText ? `${id}-help` : undefined,
    error ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    const field = fieldRef.current;
    const selection = pendingSelection.current;

    if (!field || !selection) return;

    field.focus();
    field.setSelectionRange(selection.start, selection.end);
    pendingSelection.current = null;
  }, [value]);

  function insertDecoration(tag: DecorationTag) {
    const field = fieldRef.current;

    if (!field || disabled) return;

    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? start;
    const selectedText = value.slice(start, end);

    const openingTag = tag === "ruby" ? '<ruby="">' : `<${tag}>`;
    const closingTag = `</${tag}>`;

    const nextValue =
      value.slice(0, start) +
      openingTag +
      selectedText +
      closingTag +
      value.slice(end);

    if (tag === "ruby") {
      const cursor = start + '<ruby="'.length;

      pendingSelection.current = {
        start: cursor,
        end: cursor,
      };
    } else {
      const contentStart = start + openingTag.length;

      pendingSelection.current = {
        start: contentStart,
        end: contentStart + selectedText.length,
      };
    }

    onChange(nextValue);
  }

  const sharedProps = {
    id,
    value,
    required,
    disabled,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <FormControl
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <Editor>
        <TextDecorationToolbar
          label={label}
          disabled={disabled}
          onInsert={insertDecoration}
        />

        {multiline ? (
          <TextArea
            {...sharedProps}
            ref={(element) => {
              fieldRef.current = element;
            }}
            rows={rows}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input
            {...sharedProps}
            ref={(element) => {
              fieldRef.current = element;
            }}
            type="text"
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </Editor>
    </FormControl>
  );
}

const Editor = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
`;

const Input = styled.input`
  ${fieldStyles}
  height: 37px;
`;

const TextArea = styled.textarea`
  ${fieldStyles}
  min-height: 113px;
  line-height: 1.5;
  resize: vertical;
`;
