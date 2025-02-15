/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { ObjectViewer, Tree, TreeItem } from '../../src'
// import { ObjectViewer, Tree, TreeItem } from '../../'
// import '../../dist/style.css'

class Cat {
  private name: string
  constructor (readonly options = {}) {
    this.name = 'private'
  }
  say () {
    console.log(this.name)
  }
  get title () {
    return this.name
  }

  set title (v: string) {
    this.name = v
  }
}

function App() {
  const [json, setJson] = useState('[1, null, true, "Hello \\n World.", [], {}]')
  const [jsonObj, setJsonObj] = useState<any>('')
  const [count, setCount] = useState(0)
  const [hideNonEnumerability, setHideNonEnumerability] = useState(false)
  const [showIcon, setShowIcon] = useState(true)
  const [showLine, setShowLine] = useState(true)
  const [sortKey, setSortKey] = useState<0|1|2>(0)
  const [showLevel, setShowLevel] = useState(1)
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
    html: document.body
  })
  // @ts-ignore
  data.loop = data
  // @ts-ignore
  data.func.staticFunc = () => true
  data.func.prototype.method = () => 1
  console.log(data)

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
        <h1>Object Viewer Playground</h1>
        <p>A page for playground of <a href="https://github.com/mengdu/react-object-viewer">react-object-viewer</a></p>
        <p>
          <button onClick={() => setCount(count + 1)}>Counter({count})</button>&nbsp;
          <label>
            <input type="checkbox" value={+hideNonEnumerability} onChange={() => setHideNonEnumerability(!hideNonEnumerability)} />
            <span>HideNonEnumerability</span>
          </label>&nbsp;
          <label>
            <input type="checkbox" checked={showIcon} onChange={() => setShowIcon(!showIcon)} />
            <span>ShowIcon</span>
          </label>&nbsp;
          <label>
            <input type="checkbox" checked={showLine} onChange={() => setShowLine(!showLine)} />
            <span>ShowLine</span>
          </label>&nbsp;
          <select value={sortKey} onChange={e => setSortKey(~~e.target.value as typeof sortKey)}>
            <option value={0}>Default</option>
            <option value={1}>Desc</option>
            <option value={2}>Asc</option>
          </select>&nbsp;
          <input type="number" value={showLevel} onChange={e => setShowLevel(~~e.target.value > 4 ? 4 : ~~e.target.value)} />&nbsp;
        </p>
        <textarea className="input" value={json} onChange={e => setJson(e.target.value)}></textarea>

        <ObjectViewer value={jsonObj} hideNonEnumerability={true} showItems={30} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={data} hideNonEnumerability={hideNonEnumerability} showItems={20} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey}/>
        <ObjectViewer value={"Hello \n World!"} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={count} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={BigInt(1000)} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={null} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={undefined} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={true} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={() => true} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={function Foo() { return 1 }} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={["One", 2, true, null, undefined, Symbol.for('1')]} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={Symbol.for('hello')} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={/[a-zA-Z0-9]/igm} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={new Date()} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={new Set([1, 'string', true, null, undefined])} showLevel={showLevel} showIcon={showIcon} showLine={showLine} sortKey={sortKey} />
        <ObjectViewer value={window} showLevel={0} sortKey={2} showIcon={showIcon} showLine={showLine}/>

        <h3>Tree</h3>
        <Tree showLine>
          <TreeItem title="AAA" icon={'#'} expand>
            <TreeItem title="A-1"></TreeItem>
            <TreeItem title="A-2"></TreeItem>
            <TreeItem title="A-3" expand>
              <TreeItem title="A-3-1" icon={'A'}></TreeItem>
              <TreeItem title="A-3-2" icon={'B'}></TreeItem>
              <TreeItem title="A-3-3" icon={'C'}></TreeItem>
            </TreeItem>
            <TreeItem title="A-4"></TreeItem>
          </TreeItem>
          <TreeItem title="BBB" icon={'&'}></TreeItem>
          <TreeItem title="CCC" icon={'%'}></TreeItem>
        </Tree>
        <Tree showLine>
          <TreeItem title="AAA" icon={'#'} />
        </Tree>
      </div>
    </>
  )
}

export default App
