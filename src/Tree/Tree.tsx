import { ReactNode, useEffect, useMemo, useState } from 'react'
import { IconArrow } from '../icon'
import { clsx } from '../utils'

export interface TreeProps extends React.ComponentProps<'div'> {
  children: ReactNode
  showLine?: boolean
}

export function Tree(props: TreeProps) {
  return (
    <div className={clsx(['tree', props.className, props.showLine && 'show-line'])} translate={props.translate}>{props.children}</div>
  )
}

export interface TreeItemProps {
  title: ReactNode
  icon?: ReactNode
  expand?: boolean
  hideSpece?: boolean
  children?: ReactNode
  className?: string
  canClickLabelExtend?: boolean
  onExpand?: (expand: boolean) => void
}

export function TreeItem(props: TreeItemProps) {
  const hasChild = useMemo(() => props.children, [props.children])
  const [expand, setExpand] = useState(!!props.expand)

  const handleExpand = () => {
    if (hasChild) {
      setExpand(!expand)
      props.onExpand?.(!expand)
    }
  }

  useEffect(() => {
    setExpand(!!props.expand)
  }, [props.expand])

  return (
    <div className={clsx(['tree-item', props.className])}>
      <div className="tree-item-label" onClick={() => {props.canClickLabelExtend && handleExpand()}}>
        {hasChild && <button onClick={e => {e.stopPropagation();handleExpand();}} className={clsx(['tree-item-fold-btn', expand && 'is-expand'])}>
          <IconArrow/>
        </button>}
        {(!hasChild && !props.hideSpece) && <span className="tree-item-space"></span>}
        {props.icon && <i className="tree-item-icon">{props.icon}</i>}
        {props.title}
      </div>
      {hasChild && expand && <div className="tree-item-content">{props.children}</div>}
    </div>
  )
}
