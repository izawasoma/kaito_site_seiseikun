import styled from "styled-components";

type IconProps = {
  name: string;
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 24, className }: IconProps) {
  return (
    <Symbol
      className={["material-icons", className].filter(Boolean).join(" ")}
      $size={size}
      aria-hidden="true"
    >
      {name}
    </Symbol>
  );
}

const Symbol = styled.span<{ $size: number }>`
  && {
    display: inline-block;
    flex-shrink: 0;
    font-size: ${({ $size }) => $size}px;
    line-height: 1;
    user-select: none;
  }
`;
