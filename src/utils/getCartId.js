// utils/getCartId.js
import { v4 as uuidv4 } from "uuid";

export function getCartId() {
  let id = localStorage.getItem("cartId");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("cartId", id);
  }
  return id;
}
