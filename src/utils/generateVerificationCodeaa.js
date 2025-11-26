import crypto from "crypto";

export default function generateVerificationCode() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] % 1_000_000).toString().padStart(6, "0");
}
