import  ShortUniqueId  from "short-unique-id";


export function uniqueId() {
  const uid = new ShortUniqueId({ length: 10 });
  return uid.rnd()
}
