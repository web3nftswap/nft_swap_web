import React, { createContext, useState } from 'react'

const SubstrateContext = createContext()

export const SubstrateProvider = ({ children }) => {
    const [api, setApi] = useState(undefined)
    const [injector, setInjector] = useState(undefined)
    const [allAccounts, setAllAccounts] = useState([])
    const [extensionEnabled, setExtensionEnabled] = useState(false)
    const [nfts, setNfts] = useState([])
    const [recvOffer, setRecvOffer] = useState([])
    const [issuedOffer, setIssuedOffer] = useState([])

    const value = {
        api,
        setApi,
        injector,
        setInjector,
        allAccounts,
        setAllAccounts,
        extensionEnabled,
        setExtensionEnabled,
        nfts,
        setNfts,
        recvOffer,
        setRecvOffer,
        issuedOffer,
        setIssuedOffer,
    };

    return (
        <SubstrateContext.Provider value={value}>
            {children}
        </SubstrateContext.Provider>
    )
}

// 导出 useContext 钩子的自定义版本，方便在组件中使用
export const useAccount = () => {
    const { allAccounts } = React.useContext(SubstrateContext)
    if (allAccounts && allAccounts.length > 0)
        return allAccounts[0]
    else
        return null
}

export const useSubstrateContext = () => {
    const context = React.useContext(SubstrateContext)
    return context
}

