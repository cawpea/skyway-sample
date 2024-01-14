import { FC, ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  priority?: "primary" | "secondary" | "destructive";
};

const button = cva(["text-white font-bold px-4 py-1 rounded-md"], {
  variants: {
    priority: {
      primary: ["bg-blue-500 hover:bg-blue-600 active:bg-blue-700"],
      secondary: ["bg-gray-500 hover:bg-gray-600 active:bg-gray-700"],
      destructive: ["bg-red-500 hover:bg-red-600 active:bg-red-700"],
    },
  },
});

export const Button: FC<Props> = ({
  type = "button",
  priority = "primary",
  children,
  ...rest
}) => {
  return (
    <button id="join" type="button" className={button({ priority })} {...rest}>
      {children}
    </button>
  );
};
