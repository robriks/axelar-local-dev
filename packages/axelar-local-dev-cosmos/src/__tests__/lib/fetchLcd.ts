import fetch from "node-fetch";

export function fetchAxelarLcd(endpoint?: string) {
  return fetch(`http://127.0.0.1/axelar-lcd/${endpoint}`).then((res) =>
    res.json()
  );
}
