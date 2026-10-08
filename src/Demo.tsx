import { useEffect, useState } from 'react'
import { ObjectViewer, ObjectViewLabel } from './components'

class Animal {
  private _a: number = 111
  constructor (readonly name: string) {}

  say () {
    console.log(this.name)
  }

  get a () {
    return this._a
  }

  set a (_: number) {}
}

class Cat extends Animal {
  private _b: number = 222
  constructor (readonly options = {}) {
    super('Cat')
  }

  catSay () {
    console.log(this.name)
  }

  get b () {
    return this._b
  }

  set b (_: number) {}
}

export function Demo() {
  const [json, setJson] = useState('[1, null, true, "Hello \\n World.", [], {}]')
  const [jsonObj, setJsonObj] = useState<any>('')
  const [count, setCount] = useState(0)
  const [showNonenumerable, setShowNonenumerable] = useState(false)
  const [showIcon, setShowIcon] = useState(true)
  const [showIndentLine, setShowIndentLine] = useState(true)
  const [canClickLabelExpand, setCanClickLabelExpand] = useState(true)
  const [sort, setSort] = useState<0|1|2>(0)
  const [expandLevel, setExpandLevel] = useState(1)
  const map = new Map()
  map.set('a', 1)
  map.set('b', 2)
  map.set('c', 3)
  map.set(1, 4)
  map.set(true, 5)
  const [data, setData] = useState({
    string: "Hello \n world!",
    number: 123,
    bigint: BigInt(1),
    boolean: true,
    null: null,
    undefined: undefined,
    symbol: Symbol.for('a'),
    object: {
      a: 1,
      b: true,
      c: 'str',
      d: null,
      e: undefined,
      f: Symbol.for('f')
    },
    array: [1, true, "string", null, undefined, Symbol.for('a'), [1, 2, 3]],
    infinity: Infinity,
    nan: NaN,
    date: new Date(),
    set: new Set([1, 2, 3]),
    map: map,
    regexp: /^\d{1, 10}.*$/ig,
    buffer: new ArrayBuffer(10),
    blob: new Blob(['hello']),
    file: new File(['hello'], 'demo.txt', { type: 'text/plain' }),
    count: count,
    cat: new Cat(),
    window: window,
    func: function (_a: any) {return 1},
    fn: (_a: any) => 1,
    async: async (_a: any) => 1,
    get getter () {
      return 1
    },
    set setter (v: any) {
      console.log(v)
    },
    html: document.body,
    '[[Prototype]]': 'custom proto'
  })
  // @ts-ignore
  data.loop = data
  // @ts-ignore
  data.func.staticFunc = () => true
  data.func.prototype.method = () => 1
  console.log(data)
  const commonProps = {
    showNonenumerable,
    expandLevel,
    showIcon,
    showIndentLine,
    sort,
    canClickLabelExpand,
  }
  useEffect(() => {
    if (!json) return
    try {
      setJsonObj(JSON.parse(json))
    } catch (err: any) {
      setJsonObj(err.message)
    }
  }, [json])

  useEffect(() => {
    const tmp = { ...data, count, date: new Date() }
    setData(tmp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <>
      <div className="container">
        <h1 className="text-4xl">Object Viewer Playground</h1>
        <p className="text-2xl">A page for playground of <a href="https://github.com/mengdu/react-object-viewer">react-object-viewer</a></p>
        <div className="flex p-1.5 gap-1.5">
          <button onClick={() => setCount(count + 1)}>Counter({count})</button>
          <label>
            <input type="checkbox" checked={showNonenumerable} onChange={() => setShowNonenumerable(!showNonenumerable)} />
            <span>ShowNonenumerable</span>
          </label>
          <label>
            <input type="checkbox" checked={showIcon} onChange={() => setShowIcon(!showIcon)} />
            <span>ShowIcon</span>
          </label>
          <label>
            <input type="checkbox" checked={showIndentLine} onChange={() => setShowIndentLine(!showIndentLine)} />
            <span>ShowIndentLine</span>
          </label>
          <label>
            <input type="checkbox" checked={canClickLabelExpand} onChange={() => setCanClickLabelExpand(!canClickLabelExpand)} />
            <span>CanClickLabelExpand</span>
          </label>
        </div>
        <div className="flex p-1.5 gap-1.5">
          <label>Sort:
            <select className="select" value={sort} onChange={e => setSort(~~e.target.value as typeof sort)}>
              <option value={0}>Default</option>
              <option value={1}>Desc</option>
              <option value={2}>Asc</option>
            </select>
          </label>
          <label>
            ExpandLevel:
            <input type="number" value={expandLevel} onChange={e => setExpandLevel(~~e.target.value > 4 ? 4 : ~~e.target.value)} />
          </label>
        </div>
        <textarea className="p-1.5 w-full h-20 border rounded-sm"
          value={json}
          onChange={e => setJson(e.target.value)}
        ></textarea>

        <ObjectViewer name="Hello" value={jsonObj} {...commonProps} />
        <ObjectViewer name="Data" value={data} {...commonProps} />
        <ObjectViewer value={"Hello \n World!"} {...commonProps} />
        <ObjectViewer value={count} {...commonProps} />
        <ObjectViewer value={BigInt(1000)} {...commonProps} />
        <ObjectViewer value={null} {...commonProps} />
        <ObjectViewer value={undefined} {...commonProps} />
        <ObjectViewer value={true} {...commonProps} />
        <ObjectViewer value={() => true} {...commonProps} />
        <ObjectViewer value={function Foo() { return 1 }} {...commonProps} />
        <ObjectViewer value={["One", 2, true, null, undefined, Symbol.for('1')]} {...commonProps} />
        <ObjectViewer value={Symbol.for('hello')} {...commonProps} />
        <ObjectViewer value={/[a-zA-Z0-9]/igm} {...commonProps} />
        <ObjectViewer value={new Date()} {...commonProps} />
        <ObjectViewer value={new Set([1, 'string', true, null, undefined])} {...commonProps} />
        <ObjectViewer value={window} {...commonProps} />
        <ObjectViewer value={jsonObj} {...commonProps}
          nodeRenderer={(name, key, type, descriptor) => {
            // console.log(key, type, descriptor)
            return (
              <>
                <ObjectViewLabel name={name} keyName={key} type={type} descriptor={descriptor} />
                <button className="ml-1.5 border rounded-sm text-sm px-0.5 cursor-pointer text-gray-400 hover:text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    const text = JSON.stringify(descriptor.value)
                    navigator.clipboard.writeText(text)
                  }}
                >Copy</button>
              </>
            )
          }}
        />
        <div className='h-10'></div>
      </div>
    </>
  )
}
