import { ReactNode } from "react";
import classnames from "classnames";

const Link = ({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <a
      className={classnames({ selected })}
      style={{ cursor: "pointer" }}
      onClick={() => onClick()}
    >
      {children}
    </a>
  );
};

export default Link;
