import { useEffect, useState, useContext, createContext, ReactNode, Fragment, useRef } from 'react'
import { clsx, getConstructorName, getIterateDescriptors, getType } from './utils'
import { IconArray, IconBoolean, IconEllipsis, IconFunction, IconNull, IconNumber, IconObject, IconString, IconSymbol, IconUndefined } from './icon'
import { Tree, TreeItem } from './Tree'

// eslint-disable-next-line react-refresh/only-export-components
export enum Sort {
  DEFAULT = 0,
  DESC = 1,
  ASC = 2,
}

type Type = ReturnType<typeof getType>
export type RenderValueFn = (
  type: Type,
  descriptor: TypedPropertyDescriptor<any>,
  o: {
    level: number
    getLazyValue: () => any
    getTypeValueString: typeof getTypeValueString
    RenderValueInline: typeof RenderValueInline
    RenderValue: typeof RenderValue
  }
) => ReactNode
interface CtxType {
  showLevel: number
  showItems: number
  showInlineMax: number
  showIcon: boolean
  hideNonEnumerability: boolean
  sortKey: Sort
  renderValue?: RenderValueFn
}

const Ctx = createContext<CtxType>({
  showLevel: 0,
  showItems: 20,
  showInlineMax: 5,
  showIcon: false,
  hideNonEnumerability: false,
  sortKey: Sort.DEFAULT
})

const useOption = () => {
  return useContext(Ctx)
}

function RenderTypeIcon ({ type }: { type: Type, descriptor: TypedPropertyDescriptor<any> }) {
  if (type === 'object') return <IconObject />
  if (type === 'array') return <IconArray />
  if (type === 'string') return <IconString />
  if (type === 'number' || type === 'bigint') return <IconNumber />
  if (type === 'boolean') return <IconBoolean />
  if (type === 'null') return <IconNull />
  if (type === 'undefined') return <IconUndefined />
  if (type === 'symbol') return <IconSymbol />
  if (type === 'function') return <IconFunction />
  return null
}

function RenderValueInline(props: { type: Type, descriptor: TypedPropertyDescriptor<any> }) {
  const opts = useOption()
  const value = props.descriptor.value
  const max = opts.showInlineMax

  if (props.type === 'array') {
    const l = Math.min(max, value.length)
    return (
      <div className="object-item-label-inline">
        <span className="type-system">{'('}</span>
        {value.length}
        <span className="type-system">{')'}</span>
        <span className="type-system is-italic">{'['}</span>
        <div className="object-inline-items">
          {value.slice(0, max).map((e: any, i: number) => {
            const t = getType(e)
            return (
              <Fragment key={i}>
                <span className={'type-' + t + ' is-italic'}>
                  {getTypeValueString({type: t, descriptor: {value: e, enumerable: true}})}
                </span>
                {i < l - 1 ? (
                  <span className="type-system is-italic">,&nbsp;</span>
                ) : (
                  value.length > l && <span className="type-system is-italic">,&nbsp;…</span>
                )}
              </Fragment>
            )
          })}
        </div>
        <span className="type-system is-italic">{']'}</span>
      </div>
    )
  }

  if (props.type === 'object'
    && !(value instanceof Date)
    && !(value instanceof RegExp)
    && !(value instanceof Set)
    && !(value instanceof ArrayBuffer)
  ) {
    const keys = Object.keys(value)
    const l = Math.min(keys.length, max)
    const arr = []
    for (let i = 0; i < l; i++) {
      const k = keys[i]
      let t: Type
      try {
       t = getType(value[k])
      } catch (err) {
        continue
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, k)
      if (!descriptor) continue
      arr.push((
        <Fragment key={i}>
          <span className={clsx(['type-property is-italic'])}>{k}</span>
          <span className="type-system is-italic">:&nbsp;</span>
          <span className={'type-' + t + ' is-italic'}>
            {getTypeValueString({type: t, descriptor: {value: value[k], enumerable: descriptor.enumerable}})}
          </span>
          {i < l - 1 ? <span className="type-system is-italic">,&nbsp;</span> : (
            keys.length > l && <span className="type-system is-italic">,&nbsp;…</span>
          )}
        </Fragment>
      ))
    }
    return (
      <div className="object-item-label-inline">
        {value.constructor === Object
          ? null
          : <span className="is-italic">{getConstructorName(value)}&nbsp;</span>}
        <span className="type-system is-italic">{'{'}</span>
        <div className="object-inline-items">
          {arr}
        </div>
        <span className="type-system is-italic">{'}'}</span>
      </div>
    )
  }
  return (
    <span className={'type-' + props.type}>
      {getTypeValueString({type: props.type, descriptor: props.descriptor})}
    </span>
  )
}

function RenderValue(props: {value: string, type: Type, onClick?: () => void}) {
  const [title, setTitle] = useState<string>('')
  const el = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!el.current) return
    if (el.current.scrollWidth > el.current.offsetWidth && props.type === 'string') {
      setTitle(JSON.parse(props.value))
    }
  }, [props.type, props.value])
  return (
    <span ref={el} className={'type-value type-' + props.type} onClick={props.onClick} title={title}>
      {props.value}
    </span>
  )
}

function getTypeValueString ({ type, descriptor }: { type: Type, descriptor: TypedPropertyDescriptor<any> }): string {
  const value = descriptor.value
  if (type === 'object') {
    if (value instanceof Date) return value.toISOString()
    if (value instanceof RegExp) return value.toString()
    if (value instanceof Set) return `Set(${value.size})`
    if (value instanceof ArrayBuffer) return `ArrayBuffer(${value.byteLength})`
    return getConstructorName(value)
  }
  if (type === 'array') return `Array(${value.length})`
  if (type === 'string') return JSON.stringify(value)
  if (type === 'number') return String(value)
  if (type === 'bigint') return `${String(value)}n`
  if (type === 'boolean') return String(value)
  if (type === 'null') return 'null'
  if (type === 'undefined') {
    if (descriptor.get) return '(...)'
    if (descriptor.set) return 'ƒ setter(v)'
    return 'undefined'
  }
  if (type === 'symbol') return value.toString()
  if (type === 'function') return `${value}`
  return String(value)
}

function RenderTypePropertys ({level, object}: {
  level: number
  object: object
}) {
  const opts = useOption()
  const [descriptors, setDescriptors] = useState(getIterateDescriptors(object))
  const [maxShow, setMaxShow] = useState(opts.showItems)

  useEffect(() => {
    setDescriptors(getIterateDescriptors(object))
  }, [object])

  let filterDescriptors = descriptors.filter((e) => {
    return opts.hideNonEnumerability ? e.descriptor.enumerable : true
  })
  if (opts.sortKey) {
    filterDescriptors = filterDescriptors.sort((a, b) => {
      return opts.sortKey === 1
        ? a.key < b.key ? 1 : -1
        : a.key > b.key ? 1 : -1
    })
  }
  const showDescriptors = filterDescriptors.filter((_, i) => {
    return i < maxShow
  })
  const hasMore = showDescriptors.length < filterDescriptors.length

  return (
    <>
      {showDescriptors.map(e => (
        <RenderType
          key={e.key}
          level={level + 1}
          field={e.key}
          descriptor={e.descriptor} />
      ))}
      {hasMore && (
        <div key="more">
          <button className="more-btn" title="Load more" onClick={() => setMaxShow(maxShow + opts.showItems)}>
            <IconEllipsis />
          </button>
        </div>
      )}
    </>
  )
}

function RenderType (props: {
  level: number
  field?: string
  descriptor: TypedPropertyDescriptor<any>
}) {
  const opts = useOption()
  const [descriptor, setDescriptor] = useState(props.descriptor)
  const [expand, setExpand] = useState(props.level < opts.showLevel)
  const type = getType(descriptor.value)
  const canExpand = type === 'array' || type === 'object' || type === 'function'

  const getLazyValue = () => {
    if (!descriptor.get) return
    let value
    try {
      value = descriptor.get()
    } catch (err) {
      value = `[${(err as Error).message}]`
    }
    setDescriptor({
      ...descriptor,
      get: undefined,
      value: value,
    })
  }

  useEffect(() => {
    setDescriptor(props.descriptor)
  }, [props.descriptor])

  useEffect(() => {
    setExpand(props.level < opts.showLevel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.showLevel])

  return (
    <TreeItem
      className={!descriptor.enumerable ? 'is-no-enumerable' : ''}
      title={(
        <>
          {props.field ? (
            <>
              <span className={clsx(['type-property'])}>{props.field}</span>
              <span className="type-system">:&nbsp;</span>
            </>
          ) : null}
          {opts.renderValue 
            ? opts.renderValue(type, descriptor, {
              level: props.level,
              getTypeValueString: getTypeValueString,
              getLazyValue: getLazyValue,
              RenderValueInline: RenderValueInline,
              RenderValue: RenderValue,
            }) 
            : (
              type === 'array' || type === 'object'
                ? <RenderValueInline type={type} descriptor={descriptor} />
                : <RenderValue type={type} value={getTypeValueString({ type, descriptor })} onClick={getLazyValue} />
              )
          }
        </>
      )}
      icon={opts.showIcon && <i className="type-icon"><RenderTypeIcon type={type} descriptor={descriptor}/></i>}
      expand={expand}
      hideSpece={props.level === 0}
    >
      {canExpand && (
        <RenderTypePropertys
          level={props.level}
          object={descriptor.value} />
      )}
    </TreeItem>
  )
}

export function ObjectViewer (props: {
  value: any
  showLevel?: number
  showItems?: number
  showInlineMax?: number
  showIcon?: boolean
  showLine?: boolean
  hideNonEnumerability?: boolean
  sortKey?: 0 | 1 | 2
  renderValue?: RenderValueFn
  header?: JSX.Element
  footer?: JSX.Element
}) {
  return (
    <Tree className="object-viewer" translate="no" showLine={props.showLine}>
      {props.header}
      <Ctx.Provider value={{
        showLevel: props.showLevel === undefined ? 1 : props.showLevel,
        showItems: props.showItems || 20,
        showInlineMax: props.showInlineMax || 50,
        showIcon: !!props.showIcon,
        hideNonEnumerability: !!props.hideNonEnumerability,
        sortKey: props.sortKey === undefined ? Sort.DEFAULT : props.sortKey,
        renderValue: props.renderValue,
      }}>
        <RenderType level={0} descriptor={{ enumerable: true, value: props.value}} />
      </Ctx.Provider>
      {props.footer}
    </Tree>
  )
}
