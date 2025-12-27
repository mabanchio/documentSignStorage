// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/DocumentRegistry.sol";

/**
 * @title Deploy
 * @dev Script para desplegar el contrato DocumentRegistry en Anvil
 */
contract Deploy is Script {
    function setUp() public {}

    function run() public {
        // Usar la primera cuenta de Ganache con fondos
        // 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d -> 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d)
        );

        vm.startBroadcast(deployerPrivateKey);

        // Desplegar el contrato
        DocumentRegistry registry = new DocumentRegistry();

        vm.stopBroadcast();

        // Imprimir la dirección del contrato desplegado
        console.log("DocumentRegistry desplegado en:", address(registry));
    }
}
