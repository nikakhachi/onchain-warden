interface IconProps {
  width?: string;
  height?: string;
}

export const InfinifiIcon = (props: IconProps) => (
  <svg viewBox="0 0 404 404" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#a)">
      <mask
        id="b"
        style={{
          maskType: "luminance",
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={404}
        height={404}
      >
        <path d="M404 0H0v404h404z" fill="#fff" />
      </mask>
      <g mask="url(#b)">
        <path
          d="M404 202C404 90.439 313.562 0 202 0S0 90.439 0 202s90.439 202 202 202 202-90.438 202-202"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M80.765 238.772c38.828 38.829 91.143 49.466 116.848 23.761s15.066-78.02-23.761-116.848c-38.829-38.828-91.143-49.466-116.848-23.761s-15.067 78.019 23.761 116.848m20.497 5.167c34.643 27.048 74.644 33.712 89.345 14.884s-1.466-56.019-36.108-83.067c-34.643-27.048-74.644-33.712-89.344-14.883-14.701 18.828 1.465 56.018 36.107 83.066"
          fill="url(#c)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M323.235 166.964c-38.828-38.828-91.142-49.466-116.849-23.761-25.704 25.705-15.066 78.019 23.762 116.848s91.142 49.465 116.848 23.761c25.705-25.705 15.068-78.02-23.761-116.848m-20.091-4.773c-34.643-27.048-74.643-33.712-89.344-14.883-14.701 18.828 1.464 56.019 36.107 83.067s74.643 33.712 89.345 14.883c14.701-18.828-1.465-56.019-36.108-83.067"
          fill="url(#d)"
        />
        <path d="M211.514 78.551h38.327l-56.427 246.895h-38.328z" fill="#f2f2f3" />
      </g>
    </g>
    <defs>
      <linearGradient id="c" x1={145.389} y1={238.887} x2={167.255} y2={274.415} gradientUnits="userSpaceOnUse">
        <stop offset={0.073} stopColor="#fff" />
        <stop offset={1} />
      </linearGradient>
      <linearGradient id="d" x1={250.485} y1={185.001} x2={236.745} y2={131.32} gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff" />
        <stop offset={1} />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h404v404H0z" />
      </clipPath>
    </defs>
  </svg>
);
