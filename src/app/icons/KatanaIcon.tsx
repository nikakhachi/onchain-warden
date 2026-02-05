interface IconProps {
  width?: string;
  height?: string;
}

export const KatanaIcon = (props: IconProps) => {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M172.124 127.683L209.661 1H159.616L109.576 89.5122V1H59.531L22 127.683H52.0248L22 229.027H109.576V165.911L184.644 255L235 178.358L134.91 127.683H172.124Z"
        fill="#F4FF00"
      />
    </svg>
  );
};
