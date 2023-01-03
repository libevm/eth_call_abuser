import { ethers } from 'ethers'

import FreeENSOut from '../out/FreeENS.sol/FreeENS.json'

const provider = new ethers.providers.InfuraProvider()
const wallet = ethers.Wallet.createRandom().connect(provider)
const FreeENSFactory = new ethers.ContractFactory(FreeENSOut.abi, FreeENSOut.bytecode, wallet)

const ADDRESS_WITH_ENS = [
    "0x8858Ea3b4080bCf6d7B6f5189daE9d8914027Bd0",
    "0x57001BD30496045ACb1E9bBd507440b301C1d9E3",
    "0x60516a59443acc6635B1c952544337De7Cb70eb1",
    "0x2536c09E5F5691498805884fa37811Be3b2BDdb4"
]

const main = async () => {
    // Obtain the bytecode needed tp deploy contract
    const { data } = FreeENSFactory.getDeployTransaction(ADDRESS_WITH_ENS)

    // `eth_call`
    const retDataE = await provider.call({ data })

    // If you're going to change the return value you'll need to change the encoding here
    /*
    Return is of type:

    string[] memory
    */

    // Format it back
    const ensDomains: string[] = ethers.utils.defaultAbiCoder.decode(["string[]"], retDataE)[0]

    ensDomains.forEach((x, idx) => {
        console.log(`${ADDRESS_WITH_ENS[idx]} => ${x}`)
    })
}

main()