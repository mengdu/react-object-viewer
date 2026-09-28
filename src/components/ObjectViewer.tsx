import { useEffect, useState, useContext, createContext, type ReactNode, Fragment, useMemo } from 'react'
import { IconArray, IconArrow, IconBoolean, IconEllipsis, IconFunction, IconNull, IconNumber, IconObject, IconString, IconSymbol, IconUndefined } from './icon'
import { clsx, getConstructorName, getIterateDescriptors, getType } from './utils'

// eslint-disable-next-line react-refresh/only-export-components
export enum Sort {
  DEFAULT = 0,
  DESC = 1,
  ASC = 2,
}

export type Type = ReturnType<typeof getType>

export interface ContextState {
  expandLevel: number
  showIndentLine: boolean
  showIcon: boolean
  defaultShowItems: number
  showInlineMax: number
  showNonenumerable: boolean
  canClickLabelExpand: boolean
  sort: Sort
  nodeRenderer?: (
    key: string | undefined,
    type: Type,
    descriptor: TypedPropertyDescriptor<any>,
    level: number
  ) => ReactNode
}

const Context = createContext<ContextState>({
  expandLevel: 0,
  showIndentLine: false,
  showIcon: false,
  defaultShowItems: 20,
  showInlineMax: 5,
  showNonenumerable: false,
  canClickLabelExpand: false,
  sort: Sort.DEFAULT,
})

export const useOptions = () => {
  return useContext(Context)
}

export interface ObjectViewerProps extends Partial<ContextState> {
  name?: string
  value: any
  className?: string
}

export function ObjectViewer(props: ObjectViewerProps) {
  return (
    <div className={clsx(['object-viewer', props.className])}>
      <Context.Provider
        value={{
          expandLevel: props.expandLevel ?? 0,
          showIndentLine: props.showIndentLine ?? false,
          showIcon: props.showIcon ?? false,
          defaultShowItems: props.defaultShowItems ?? 20,
          showInlineMax: props.showInlineMax ?? 5,
          showNonenumerable: props.showNonenumerable ?? false,
          canClickLabelExpand: props.canClickLabelExpand ?? false,
          sort: props.sort ?? Sort.DEFAULT,
          nodeRenderer: props.nodeRenderer,
        }}>
        <ObjectViewerItem
          name={props.name}
          descriptor={{
            enumerable: true,
            value: props.value
          }}
          level={0}
        />
      </Context.Provider>
    </div>
  )
}

interface ObjectViewerItemProps {
  name?: string
  keyName?: string
  descriptor: TypedPropertyDescriptor<any>
  level: number
  parent?: any
}

function ObjectViewerItem(props: ObjectViewerItemProps) {
  const state = useOptions()
  const [descriptor, setDescriptor] = useState(props.descriptor)
  const [expand, setExpand] = useState(props.level < state.expandLevel)
  const [showMaxItems, setShowMaxItems] = useState(state.defaultShowItems)
  const valueType = useMemo(() => getType(descriptor.value), [descriptor])
  const hasChild = useMemo(() => {
    return ['object', 'array', 'function'].includes(valueType)
  }, [valueType])
  const descriptors = useMemo(() => {
    if (!hasChild) return []
    return getIterateDescriptors(descriptor.value)
  }, [hasChild, descriptor])

  const filteredDescriptors = useMemo(() => {
    let arr = descriptors.filter((e) => {
      return state.showNonenumerable ? true : e.descriptor.enumerable
    })

    if (state.sort) {
      arr = arr.sort((a, b) => {
        return state.sort === 1
          ? a.key < b.key ? 1 : -1
          : a.key > b.key ? 1 : -1
      })
    }
    return arr
  }, [state.showNonenumerable, state.sort, descriptors])

  const [showDescriptors, hasMore] = useMemo(() => {
    const arr = filteredDescriptors.slice(0, showMaxItems)
    return [arr, arr.length < filteredDescriptors.length]
  }, [filteredDescriptors, showMaxItems])

  // const loadGetter = () => {
  //   if (!descriptor.get) return
  //   let value
  //   try {
  //     value = descriptor.get.call(props.parent)
  //   } catch (err) {
  //     value = `[${(err as Error).message}]`
  //   }
  //   const item = {
  //     ...descriptor,
  //   }
  //   item.get = undefined
  //   item.value = value
  //   setDescriptor(item)
  // }

  useEffect(() => {
    setDescriptor(props.descriptor)
  }, [props.descriptor])

  useEffect(() => {
    setExpand(props.level < state.expandLevel)
  }, [props.level, state.expandLevel])

  return (
    <div className={clsx(['object-viewer-item', state.showIndentLine && ['object', 'array', 'function'].includes(valueType) && 'indent-line'])} data-level={props.level}>
      <div className="object-viewer-content">
        {hasChild && (
          <button
            className={clsx(['object-viewer-fold-button', expand && 'expanded'])}
            type="button"
            onClick={() => setExpand(!expand)}
          >
            <IconArrow/>
          </button>
        )}
        {!hasChild && props.level > 0 && <span className="object-viewer-space"></span>}
        <div className="object-viewer-label"
          onClick={e => {
            if (e.button !== 0) return
            if (!state.canClickLabelExpand) return
            setExpand(!expand)
          }}
        >
          {
            state.nodeRenderer
              ? state.nodeRenderer(props.keyName, valueType, descriptor, props.level)
              : (
                <ObjectViewLabel
                  name={props.name}
                  keyName={props.keyName}
                  type={valueType}
                  descriptor={descriptor}
                />
              )
          }
        </div>
      </div>
      {hasChild && expand && (
        <div className="object-viewer-children">
          {showDescriptors.map((e, i) => (
            <ObjectViewerItem
              key={e.key + i}
              keyName={e.key}
              descriptor={e.descriptor}
              level={props.level + 1}
              parent={descriptor.value}
            />
          ))}
          {hasMore && (
            <div key="has-more">
              <button className="more-button"
                title="load more"
                type="button"
                onClick={() => setShowMaxItems(prev => prev + state.defaultShowItems)}>
                <IconEllipsis />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ObjectViewLabel(props: {
  name?: string
  keyName?: string
  type: Type
  descriptor: TypedPropertyDescriptor<any>
}) {
  const state = useOptions()
  const icon = state.showIcon ? getTypeIcon(props.type) : null
  const property = props.keyName ? (
    <>
      {icon && <span className="type-icon">{icon}</span>}
      <span className={clsx(['type-property', !props.descriptor.enumerable && 'is-non-enumerable'])}>{props.keyName}</span>
      <span className="syntax-punctuation">:&nbsp;</span>
    </>
  ) : null

  if (props.type === 'array') {
    return (
      <>
        {property}
        <InlineArray name={props.name} type={props.type} descriptor={props.descriptor} />
      </>
    )
  }

  if (props.type === 'object'
    && !(props.descriptor.value instanceof Date)
    && !(props.descriptor.value instanceof RegExp)
    && !(props.descriptor.value instanceof Set)
    && !(props.descriptor.value instanceof ArrayBuffer)
  ) {
    return (
      <>
        {property}
        <InlineObject name={props.name} type={props.type} descriptor={props.descriptor} />
      </>
    )
  }

  return (
    <>
      {property}
      <span className={'type-value type-' + props.type}>
        {getValueString(props.type, props.descriptor)}
      </span>
    </>
  )
}

function InlineArray(props: { name?: string, type: Type, descriptor: TypedPropertyDescriptor<any> }) {
  const sate = useOptions()
  const value = props.descriptor.value
  const max = sate.showInlineMax
  const showLen = Math.min(max, value.length)

  return (
    <div className="object-viewer-inline">
      {props.name && <span className="syntax-name">{props.name}</span>}
      <span className="syntax-meta">{`(${value.length})`}</span>
      <span className="syntax-punctuation">{'['}</span>
      <div className="object-viewer-inline-items">
        {value.slice(0, max).map((e: any, i: number) => {
          const t = getType(e)
          return (
            <Fragment key={i}>
              <span className={'type-' + t}>
                {getValueString(t, {value: e, enumerable: true})}
              </span>
              {i < showLen - 1 ? (
                <span className="syntax-punctuation">,&nbsp;</span>
              ) : (
                value.length > showLen && <span className="syntax-punctuation">,&nbsp;…</span>
              )}
            </Fragment>
          )
        })}
      </div>
      <span className="syntax-punctuation">{']'}</span>
    </div>
  )
}

function InlineObject(props: { name?: string, type: Type, descriptor: TypedPropertyDescriptor<any> }) {
  const state = useOptions()
  
  const propertys = useMemo(() => {
    const value = props.descriptor.value
    const propertys = []
    const max = state.showInlineMax
    const keys = Object.keys(value)
    const showLen = Math.min(keys.length, max)
    for (let i = 0; i < showLen; i++) {
      const k = keys[i]
      let t: Type
      try {
        t = getType(value[k])
      } catch (err) {
        continue
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, k)
      if (!descriptor) continue
      propertys.push((
        <Fragment key={i}>
          <span className={clsx(['type-property'])}>{k}</span>
          <span className="syntax-punctuation">:&nbsp;</span>
          <span className={'type-' + t + ''}>
            {getValueString(t, {value: value[k], enumerable: descriptor.enumerable})}
          </span>
          {i < showLen - 1 ? <span className="syntax-punctuation">,&nbsp;</span> : (
            keys.length > showLen && <span className="syntax-punctuation">,&nbsp;…</span>
          )}
        </Fragment>
      ))
    }
    return propertys
  }, [state.showInlineMax, props.descriptor.value])
  return (
    <div className="object-viewer-inline">
      {props.name || props.descriptor.value.constructor !== Object
        ? <span className="syntax-name">{props.name || getConstructorName(props.descriptor.value)}</span>
        : null}
      <span className="syntax-punctuation">{'{'}</span>
      <div className="object-viewer-inline-items">
        {propertys}
      </div>
      <span className="syntax-punctuation">{'}'}</span>
    </div>
  )
}

function getValueString (type: Type, descriptor: TypedPropertyDescriptor<any>): string {
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

function getTypeIcon(type: Type) {
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
