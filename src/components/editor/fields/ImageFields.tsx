import { useId } from "react";
import styled from "styled-components";
import TextField from "@/components/ui/form/TextField";
import RadioGroup from "@/components/ui/form/RadioGroup";
import FormSection from "@/components/ui/form/FormSection";
import { fieldStyles } from "@/components/ui/form/fieldStyles";

export type ImageWidth = 500 | 650 | 860;

export type ImageValue = {
  url: string;
  alt: string;
  width: ImageWidth;
};

type ImageFieldsProps = {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  urlError?: string;
  disabled?: boolean;
};

export default function ImageFields({
  value,
  onChange,
  urlError,
  disabled = false,
}: ImageFieldsProps) {
  const id = useId();
  const urlId = `${id}-url`;
  const helpId = `${id}-help`;

  return (
    <div>
      <FormSection title="画像情報">
        <UrlField>
          <UrlHeading>
            <UrlLabel htmlFor={urlId}>
              <RequiredMark aria-hidden="true">※</RequiredMark>
              画像URL
            </UrlLabel>

            <Help id={helpId}>
              WordPressのメディアライブラリに画像を事前にUPして下さい
            </Help>
          </UrlHeading>

          <UrlInput
            id={urlId}
            type="url"
            required
            disabled={disabled}
            value={value.url}
            onChange={(event) =>
              onChange({ ...value, url: event.target.value })
            }
            aria-describedby={[helpId, urlError ? `${urlId}-error` : undefined]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={urlError ? true : undefined}
          />

          {urlError && (
            <ErrorText id={`${urlId}-error`} role="alert">
              {urlError}
            </ErrorText>
          )}
        </UrlField>

        <TextField
          label="ALT"
          value={value.alt}
          onChange={(event) => onChange({ ...value, alt: event.target.value })}
          disabled={disabled}
        />
      </FormSection>

      <FormSection title="設定">
        <RadioGroup
          label="PC表示の画像幅"
          value={String(value.width)}
          onValueChange={(selected) => {
            const width = Number(selected);

            if (width === 500 || width === 650 || width === 860) {
              onChange({ ...value, width });
            }
          }}
          options={[
            { value: "500", label: "500px" },
            { value: "650", label: "650px" },
            { value: "860", label: "860px" },
          ]}
          disabled={disabled}
        />
      </FormSection>
    </div>
  );
}

const UrlField = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const UrlHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 8px;
`;

const UrlLabel = styled.label`
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.red};
`;

const Help = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 10px;
  line-height: 1.5;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.red};
  font-size: 11px;
  line-height: 1.5;
`;

const UrlInput = styled.input`
  ${fieldStyles}
  height: 37px;
`;
