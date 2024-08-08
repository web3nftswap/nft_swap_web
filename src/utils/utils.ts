export const shortenString = (str: string, maxLength: number = 10) : string => {
    if (str.length <= maxLength) {
      return str
    }
  
    const visibleChars = Math.floor((maxLength - 3) / 2)
    const firstPart = str.slice(0, visibleChars)
    const lastPart = str.slice(-1 * visibleChars)
    return firstPart + '...' + lastPart
}

export const signAndSend = async (tx, account, extensionEnabled, injector) => {
    if (extensionEnabled) {
        return await tx.signAndSend(account.address, { signer: injector.signer })
    } else {
        return await tx.signAndSend(account)
    }
}


