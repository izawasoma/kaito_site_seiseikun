import { useId, type ReactNode } from "react";
import styled from "styled-components";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  headingLevel?: 2 | 3 | 4;
};

export default function FormSection({
  title,
  children,
  headingLevel = 3,
}: FormSectionProps) {
  const headingId = useId();

  return (
    <Section aria-labelledby={headingId}>
      <Heading as={`h${headingLevel}`} id={headingId}>
        {title}
      </Heading>
      <Content>{children}</Content>
    </Section>
  );
}

const Section = styled.section`
  min-width: 0;
`;

const Heading = styled.h3`
  display: flex;
  align-items: center;
  min-height: 36px;
  margin: 0;
  padding: 8px 20px;
  background-color: ${({ theme }) => theme.colors.lightGray};
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Content = styled.div`
  display: grid;
  gap: 12px;
  padding: 16px 20px 24px;
`;
