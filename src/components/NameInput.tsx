import { useCallback, useState, type ChangeEvent } from "react";

export default function NameInput({
  onNameChanged,
}: {
  onNameChanged?: (name: string) => void;
}) {
  const [name, setName] = useState<string>("");

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value ?? ""),
    [],
  );
  const onBlur = useCallback(
    () => onNameChanged?.(name),
    [name, onNameChanged],
  );
  return <input type="text" value={name} onChange={onChange} onBlur={onBlur} />;
}
