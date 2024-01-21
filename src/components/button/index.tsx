import { FC, ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  priority?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
};

const button = cva(["text-white font-bold px-4 rounded-md"], {
  variants: {
    priority: {
      primary: ["bg-blue-500 hover:bg-blue-600 active:bg-blue-700"],
      secondary: ["bg-gray-500 hover:bg-gray-600 active:bg-gray-700"],
      destructive: ["bg-red-500 hover:bg-red-600 active:bg-red-700"],
    },
    size: {
      sm: ["text-sm", "py-1"],
      md: ["text-md", "py-2"],
      lg: ["text-lg", "py-3"],
    },
  },
});

export const Button: FC<Props> = ({
  type = "button",
  priority = "primary",
  size = "md",
  children,
  ...rest
}) => {
  return (
    <button
      id="join"
      type={type}
      className={button({ priority, size })}
      {...rest}
    >
      {children}
    </button>
  );
};
