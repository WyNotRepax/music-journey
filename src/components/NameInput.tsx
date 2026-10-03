import { useState } from "react";

export default function NameInput({
  name,
  onNameChanged,
}: {
  name: string;
  onNameChanged: (name: string) => void;
}) {
  const [inputName, setInputName] = useState(name);

  return (
    <input
      id="lastfm-name"
      type="text"
      value={inputName}
      onChange={(event) => setInputName(event.target.value)}
      onBlur={() => onNameChanged(inputName.trim())}
    />
  );
}
