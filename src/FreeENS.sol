pragma solidity >=0.7.0;
pragma experimental ABIEncoderV2;

import "./ENS.sol";

contract FreeENS {
    ENS private constant ens = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    bytes32 private constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    /**
     * The `constructor` takes ENS registry address
     */
    constructor(address[] memory addresses) {
        string[] memory r = new string[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            bytes32 node = keccak256(abi.encodePacked(ADDR_REVERSE_NODE, sha3HexAddress(addresses[i])));
            address resolverAddress = ens.resolver(node);
            if (resolverAddress != address(0x0)) {
                Resolver resolver = Resolver(resolverAddress);
                string memory name = resolver.name(node);
                if (bytes(name).length == 0) {
                    continue;
                }
                bytes32 namehash = Namehash.namehash(name);
                address forwardResolverAddress = ens.resolver(namehash);
                if (forwardResolverAddress != address(0x0)) {
                    Resolver forwardResolver = Resolver(forwardResolverAddress);
                    address forwardAddress = forwardResolver.addr(namehash);
                    if (forwardAddress == addresses[i]) {
                        r[i] = name;
                    }
                }
            }
        }

        // ensure abi encoding, not needed here but increase reusability for different return types
        // note: abi.encode add a first 32 bytes word with the length of the original data
        bytes memory _abiEncodedData = abi.encode(r);

        assembly {
            // Return from the start of the data (skipping the data length field)
            // mload(bytes) returns the length of the bytes variable
            let dataStart := add(_abiEncodedData, 0x20)
            return(dataStart, mload(_abiEncodedData))
        }
    }
}
