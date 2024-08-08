import type { PropsWithChildren } from 'react'
import { Address } from '@ant-design/web3'

export type NftItem = {
  owner: string
  collectionId: string
  itemId: number
  isListed: boolean
  isOffered: boolean
}

export function NftCardFooter(props: PropsWithChildren<{ dataSource: NftItem }>) {
  const { dataSource } = props

  return (
    <div className="NftCardFooter">
      <div>
        <span>Collection ID: </span>
        <Address address={dataSource.collectionId} ellipsis={{ headClip: 8, tailClip: 6 }} copyable />
        <span>Item ID: {dataSource.itemId}</span>
      </div>
      <div>
        <span>Owner ID: </span>
        <Address address={dataSource.owner} ellipsis={{ headClip: 8, tailClip: 6 }} copyable />
      </div>
    </div>
  )
}
