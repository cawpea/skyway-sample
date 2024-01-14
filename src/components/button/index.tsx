import { FC, ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  priority?: "primary" | "secondary" | "destructive";
};

export const Button: FC<Props> = ({
  type = "button",
  priority = "primary",
  children,
  ...rest
}) => {
  return (
    <button
      id="join"
      type="button"
      className="bg-blue-500 text-white font-bold px-4 py-1 rounded-md hover:bg-blue-600 active:bg-blue-700"
      {...rest}
    >
      {children}
    </button>
  );
};
