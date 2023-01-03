import { ethers } from 'ethers'

import IERC20Out from '../out/IERC20.sol/IERC20.json'
import FreeMulticall2Out from '../out/FreeMulticall2.sol/FreeMulticall2.json'
import { FreeMulticall2 } from '../types/FreeMulticall2'

const provider = new ethers.providers.InfuraProvider()
const wallet = ethers.Wallet.createRandom().connect(provider)
const FreeMulticall2Factory = new ethers.ContractFactory(FreeMulticall2Out.abi, FreeMulticall2Out.bytecode, wallet)
const IERC20Iface = new ethers.utils.Interface(IERC20Out.abi)

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const USDC_HOLDERS = [
    "0xdcef968d416a41cdac0ed8702fac8128a64241a2",
    "0x467d543e5e4e41aeddf3b6d1997350dd9820a173",
    "0x1b7baa734c00298b9429b518d621753bb0f6eff2",
    "0x1a8c53147e7b61c015159723408762fc60a34d17",
    "0x813c661adf40806666dd0b01d527a3ab3e2a0633",
    "0xaae2c00a079bbff45e09083d72bc2be225936bc7",
    "0x47e6946e48a5ffaa0a361aa97e77774a25c4c150",
    "0x5127f639f29ddbafa96de964d611273a0705be96",
    "0xdcf0ed820fd6219a55c6d42251910864baac0da2",
    "0x56dbfadef270c7c95d9e84db7e921b544a7c4145",
    "0x22f6657450b80d9ba5fec998d8edcbdab149bd42",
]

type ReturnData = {
    success: boolean;
    returnData: string;
}

const main = async () => {
    // Construct the call data
    const calldata = USDC_HOLDERS.map((x) => {
        return {
            target: USDC,
            callData: IERC20Iface.encodeFunctionData("balanceOf", [x])
        }
    })

    // Obtain the bytecode needed tp deploy contract
    const { data } = FreeMulticall2Factory.getDeployTransaction(false, calldata)

    // `eth_call`
    const retDataE = await provider.call({ data })

    // If you're going to change the return value you'll need to change the encoding here
    /*
    Return is of type:

    struct Result {
        bool success;
        bytes returnData;
    }
    */

    // Format it back
    const retData: ReturnData[] = (ethers.utils.defaultAbiCoder.decode(["tuple(bool,bytes)[]"], retDataE)[0]).map((x: any[]) => {
        return {
            success: x[0],
            returnData: x[1]
        }
    })

    // Format the data to uint256
    const balances: ethers.BigNumber[] = retData.map(x => x.success ? ethers.utils.defaultAbiCoder.decode(['uint256'], x.returnData)[0] : ethers.constants.Zero)

    balances.forEach((x, idx) => {
        console.log(`${USDC_HOLDERS[idx]} => ${ethers.utils.formatUnits(x, 6)} USDC`)
    })
}

main()