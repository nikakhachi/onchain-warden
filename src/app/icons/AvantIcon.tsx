interface IconProps { 
  width?: string;
  height?: string;
}

export const AvantIcon = (props: IconProps) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 296 261.5" {...props}>
        <path
          style={{
            fill: "#3a14a3",
          }}
          d="M0 0h296v261.5H0z"
        />
        <path
          style={{
            fill: "#fff",
            fillRule: "evenodd",
          }}
          d="M240.2 140.6v40.6L147.4 19.5 19.5 242.4h40.1L98 175.6h76.2l-20.2-35h-36l29.4-51.2 87.8 153h40.2V140.6z"
        />
      </svg>
  );
};