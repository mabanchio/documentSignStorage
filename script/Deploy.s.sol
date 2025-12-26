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
        // Leer la clave privada del deployer desde las variables de entorno
        // Para desarrollo, usa la primera cuenta de Anvil
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );

        vm.startBroadcast(deployerPrivateKey);

        // Desplegar el contrato
        DocumentRegistry registry = new DocumentRegistry();

        vm.stopBroadcast();

        // Imprimir la dirección del contrato desplegado
        console.log("DocumentRegistry desplegado en:", address(registry));
    }
}
