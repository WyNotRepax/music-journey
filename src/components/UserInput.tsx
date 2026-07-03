import { useState } from "react";

export default function UserInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [curr, setCurr] = useState(value);

  return (
    <input
      type="text"
      value={curr}
      onChange={(e) => setCurr(e.target.value)}
      onBlur={() => onChange(curr)}
    />
  );
}
