export function getIterateDescriptors(o: any) {
  const descriptors = Object.getOwnPropertyDescriptors(o)
  const arr = []
  for (const key in descriptors) {
    arr.push({ key, descriptor: descriptors[key] })
  }
  if (o instanceof Set) {
    arr.push({
      key: '[[Values]]',
      descriptor: {
        enumerable: true,
        value: [...o.entries()].reduce<Record<string, any>>((d, e) => {d[e[0]] = e[1]; return d}, {})
      },
    })
  }
  if (o instanceof Map) {
    arr.push({
      key: '[[Entries]]',
      descriptor: {
        enumerable: true,
        value: [...o.entries()].reduce<Record<string, {key: any; value: any}>>((d, e, i) => {d[i] = { key: e[0], value: e[1]}; return d}, {})
      }
    })
  }
  if (o !== Object.prototype) {
    arr.push({
      key: '[[Prototype]]',
      descriptor: { enumerable: false, value: Object.getPrototypeOf(o) },
    })
  }
  return arr
}

export function getType(v: any) {
  const type = typeof v
  if (type === 'object') {
    if (v === null) return 'null'
    if (Array.isArray(v)) return 'array'
  }
  return type
}

export function getPrototype(o: any) {
  return Object.prototype.toString.call(o)
}

export function clsx(o: Record<string, any> | any[]) {
  if (Array.isArray(o)) {
    return o.filter(e => !!e).join(' ')
  }
  const strs: string[] = []
  for (const k in o) {
    if (k && o[k]) strs.push(k)
  }
  return strs.join(' ')
}
