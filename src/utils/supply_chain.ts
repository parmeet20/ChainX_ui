/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/supply_chain.json`.
 */
export type SupplyChain = {
  "address": "7J6JvqXnMiSz4wYdrDy2CKrnoCQTKYwBiQRbqBfbuZVi",
  "metadata": {
    "name": "supplyChain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyProductAsCustomerCtx",
      "discriminator": [
        30,
        190,
        226,
        204,
        4,
        32,
        136,
        33
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "customerProduct",
          "writable": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "sellerProduct",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "product"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "stock",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyProductAsWarehouse",
      "discriminator": [
        206,
        148,
        142,
        193,
        132,
        120,
        148,
        227
      ],
      "accounts": [
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "warehouseOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "u64"
        },
        {
          "name": "factoryId",
          "type": "u64"
        },
        {
          "name": "stockToPurchase",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createFactory",
      "discriminator": [
        11,
        88,
        70,
        244,
        56,
        177,
        41,
        170
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "latitude",
          "type": "f64"
        },
        {
          "name": "longitude",
          "type": "f64"
        },
        {
          "name": "contactInfo",
          "type": "string"
        }
      ]
    },
    {
      "name": "createLogisticsInstruction",
      "discriminator": [
        125,
        170,
        192,
        55,
        233,
        209,
        108,
        185
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "logistics",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "transportationMode",
          "type": "string"
        },
        {
          "name": "contactInfo",
          "type": "string"
        },
        {
          "name": "productId",
          "type": "u64"
        },
        {
          "name": "warehouseId",
          "type": "u64"
        },
        {
          "name": "latitude",
          "type": "f64"
        },
        {
          "name": "longitude",
          "type": "f64"
        }
      ]
    },
    {
      "name": "createOrderInstructionAsSeller",
      "discriminator": [
        236,
        104,
        63,
        20,
        37,
        247,
        3,
        244
      ],
      "accounts": [
        {
          "name": "sellerAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "warehouseId",
          "type": "u64"
        },
        {
          "name": "productId",
          "type": "u64"
        },
        {
          "name": "productStock",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProduct",
      "discriminator": [
        183,
        155,
        202,
        119,
        43,
        114,
        174,
        225
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "productName",
          "type": "string"
        },
        {
          "name": "productDescription",
          "type": "string"
        },
        {
          "name": "productImage",
          "type": "string"
        },
        {
          "name": "batchNumber",
          "type": "string"
        },
        {
          "name": "productPrice",
          "type": "u64"
        },
        {
          "name": "rawMaterialUsed",
          "type": "u64"
        },
        {
          "name": "productStock",
          "type": "u64"
        },
        {
          "name": "mrp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createSellerInstruction",
      "discriminator": [
        8,
        100,
        236,
        61,
        183,
        21,
        136,
        153
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "latitude",
          "type": "f64"
        },
        {
          "name": "longitude",
          "type": "f64"
        },
        {
          "name": "contactInfo",
          "type": "string"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "email",
          "type": "string"
        },
        {
          "name": "role",
          "type": "string"
        }
      ]
    },
    {
      "name": "createWarehouseInstrution",
      "discriminator": [
        230,
        149,
        234,
        16,
        204,
        251,
        144,
        5
      ],
      "accounts": [
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "contactDeatails",
          "type": "string"
        },
        {
          "name": "factoryId",
          "type": "u64"
        },
        {
          "name": "warehouseSize",
          "type": "u64"
        },
        {
          "name": "latitude",
          "type": "f64"
        },
        {
          "name": "longitude",
          "type": "f64"
        }
      ]
    },
    {
      "name": "initializeProgramState",
      "discriminator": [
        114,
        90,
        170,
        208,
        223,
        41,
        40,
        160
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "inspectProductInstruction",
      "discriminator": [
        230,
        47,
        87,
        239,
        92,
        241,
        147,
        211
      ],
      "accounts": [
        {
          "name": "inspectionDetails",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "latitude",
          "type": "f64"
        },
        {
          "name": "longitude",
          "type": "f64"
        },
        {
          "name": "productId",
          "type": "u64"
        },
        {
          "name": "inspectionOutcome",
          "type": "string"
        },
        {
          "name": "notes",
          "type": "string"
        },
        {
          "name": "feeChargePerProduct",
          "type": "u64"
        }
      ]
    },
    {
      "name": "payProductInspectorInstruction",
      "discriminator": [
        51,
        20,
        182,
        175,
        3,
        240,
        226,
        27
      ],
      "accounts": [
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "inspector",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "inspectorId",
          "type": "u64"
        },
        {
          "name": "productId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "receiveProductInstructionAsSeller",
      "discriminator": [
        82,
        159,
        88,
        60,
        10,
        178,
        168,
        5
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerProductStock",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "logistics",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "sendLogisticsToSellerInstruction",
      "discriminator": [
        153,
        70,
        47,
        53,
        120,
        178,
        89,
        169
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "logistics",
          "writable": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "product",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "order",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "logisticsId",
          "type": "u64"
        },
        {
          "name": "productId",
          "type": "u64"
        },
        {
          "name": "warehouseId",
          "type": "u64"
        },
        {
          "name": "shippingCost",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePlatformFee",
      "discriminator": [
        162,
        97,
        186,
        47,
        93,
        113,
        176,
        243
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBalanceAsFactory",
      "discriminator": [
        204,
        25,
        153,
        203,
        96,
        123,
        250,
        215
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "factory",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "programsState",
          "writable": true
        },
        {
          "name": "platformAddress",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBalanceAsLogisticsInstruction",
      "discriminator": [
        26,
        65,
        54,
        77,
        44,
        158,
        11,
        85
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "logistics",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBalanceAsSellerInstruction",
      "discriminator": [
        148,
        244,
        21,
        111,
        114,
        14,
        198,
        191
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "programsState",
          "writable": true
        },
        {
          "name": "platformAddress",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBalanceAsWarehouseInstruction",
      "discriminator": [
        201,
        147,
        219,
        202,
        129,
        243,
        71,
        28
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "warehouse",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "programsState",
          "writable": true
        },
        {
          "name": "platformAddress",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawInspectorBalance",
      "discriminator": [
        232,
        239,
        254,
        213,
        20,
        113,
        153,
        44
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "inspector",
          "writable": true
        },
        {
          "name": "programsState",
          "writable": true
        },
        {
          "name": "platformAddress",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "customerProduct",
      "discriminator": [
        75,
        186,
        4,
        118,
        148,
        174,
        80,
        255
      ]
    },
    {
      "name": "factory",
      "discriminator": [
        159,
        68,
        192,
        61,
        48,
        249,
        216,
        202
      ]
    },
    {
      "name": "logistics",
      "discriminator": [
        28,
        67,
        179,
        71,
        113,
        245,
        233,
        245
      ]
    },
    {
      "name": "order",
      "discriminator": [
        134,
        173,
        223,
        185,
        77,
        86,
        28,
        51
      ]
    },
    {
      "name": "product",
      "discriminator": [
        102,
        76,
        55,
        251,
        38,
        73,
        224,
        229
      ]
    },
    {
      "name": "productInspector",
      "discriminator": [
        244,
        35,
        172,
        222,
        109,
        170,
        46,
        148
      ]
    },
    {
      "name": "programState",
      "discriminator": [
        77,
        209,
        137,
        229,
        149,
        67,
        167,
        230
      ]
    },
    {
      "name": "seller",
      "discriminator": [
        76,
        163,
        162,
        59,
        115,
        49,
        116,
        39
      ]
    },
    {
      "name": "sellerProductStock",
      "discriminator": [
        251,
        160,
        200,
        70,
        192,
        110,
        43,
        110
      ]
    },
    {
      "name": "transaction",
      "discriminator": [
        11,
        24,
        174,
        129,
        203,
        117,
        242,
        23
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    },
    {
      "name": "warehouse",
      "discriminator": [
        162,
        150,
        206,
        71,
        83,
        99,
        222,
        202
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedAccess",
      "msg": "unauthorized access"
    },
    {
      "code": 6001,
      "name": "invalidPlatformFee",
      "msg": "Can not set platform fee more than 5%"
    },
    {
      "code": 6002,
      "name": "programAlreadyInitialized",
      "msg": "program already initialized"
    },
    {
      "code": 6003,
      "name": "userAlreadyInitialized",
      "msg": "user already initialized"
    },
    {
      "code": 6004,
      "name": "invalidProductId",
      "msg": "invalid product id"
    },
    {
      "code": 6005,
      "name": "insufficientStock",
      "msg": "insufficient stock"
    },
    {
      "code": 6006,
      "name": "insufficientBalance",
      "msg": "insufficient balance"
    },
    {
      "code": 6007,
      "name": "insifficentWithdraw",
      "msg": "should withdraw atleast 1 SOL"
    },
    {
      "code": 6008,
      "name": "invalidWarehouse",
      "msg": "warehouse not found"
    },
    {
      "code": 6009,
      "name": "invalidLogistics",
      "msg": "logistics not found"
    },
    {
      "code": 6010,
      "name": "invalidInspectionOutcome",
      "msg": "inspection outcome too long"
    },
    {
      "code": 6011,
      "name": "invalidNotes",
      "msg": "notes too long"
    },
    {
      "code": 6012,
      "name": "invalidName",
      "msg": "name too long"
    },
    {
      "code": 6013,
      "name": "invalidDescription",
      "msg": "description too long"
    },
    {
      "code": 6014,
      "name": "invalidContactInfo",
      "msg": "contact info too long"
    },
    {
      "code": 6015,
      "name": "invalidRole",
      "msg": "invalid role"
    },
    {
      "code": 6016,
      "name": "invalidFactory",
      "msg": "invalid factory"
    },
    {
      "code": 6017,
      "name": "qualityChecked",
      "msg": "quality already checked"
    },
    {
      "code": 6018,
      "name": "productNotQualityChecked",
      "msg": "product not quality checked"
    },
    {
      "code": 6019,
      "name": "invalidInspectorId",
      "msg": "invalid inspector id"
    },
    {
      "code": 6020,
      "name": "invalidInspector",
      "msg": "invalid inspector"
    },
    {
      "code": 6021,
      "name": "invalidUser",
      "msg": "invalid user"
    },
    {
      "code": 6022,
      "name": "overflow",
      "msg": "overflow"
    }
  ],
  "types": [
    {
      "name": "customerProduct",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productPda",
            "type": "pubkey"
          },
          {
            "name": "sellerPda",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "stockQuantity",
            "type": "u64"
          },
          {
            "name": "purchasedOn",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "factory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "factoryId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "contactInfo",
            "type": "string"
          },
          {
            "name": "productCount",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "logistics",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "logisticId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "transportationMode",
            "type": "string"
          },
          {
            "name": "contactInfo",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "shipmentCost",
            "type": "u64"
          },
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productPda",
            "type": "u64"
          },
          {
            "name": "productStock",
            "type": "u64"
          },
          {
            "name": "deliveryConfirmed",
            "type": "bool"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "warehouseId",
            "type": "u64"
          },
          {
            "name": "shipmentStartedAt",
            "type": "u64"
          },
          {
            "name": "shipmentEndedAt",
            "type": "u64"
          },
          {
            "name": "delivered",
            "type": "bool"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": "u64"
          },
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productPda",
            "type": "pubkey"
          },
          {
            "name": "productStock",
            "type": "u64"
          },
          {
            "name": "warehouseId",
            "type": "u64"
          },
          {
            "name": "warehousePda",
            "type": "pubkey"
          },
          {
            "name": "totalPrice",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "sellerId",
            "type": "u64"
          },
          {
            "name": "sellerPda",
            "type": "pubkey"
          },
          {
            "name": "logisticId",
            "type": "u64"
          },
          {
            "name": "logisticPda",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "product",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "productDescription",
            "type": "string"
          },
          {
            "name": "batchNumber",
            "type": "string"
          },
          {
            "name": "productImage",
            "type": "string"
          },
          {
            "name": "factoryId",
            "type": "u64"
          },
          {
            "name": "factoryPda",
            "type": "pubkey"
          },
          {
            "name": "productPrice",
            "type": "u64"
          },
          {
            "name": "productStock",
            "type": "u64"
          },
          {
            "name": "rawMaterialUsed",
            "type": "u64"
          },
          {
            "name": "qualityChecked",
            "type": "bool"
          },
          {
            "name": "inspectionId",
            "type": "u64"
          },
          {
            "name": "inspectorPda",
            "type": "pubkey"
          },
          {
            "name": "inspectionFeePaid",
            "type": "bool"
          },
          {
            "name": "mrp",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "productInspector",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "inspectorId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "inspectionOutcome",
            "type": "string"
          },
          {
            "name": "notes",
            "type": "string"
          },
          {
            "name": "inspectionDate",
            "type": "u64"
          },
          {
            "name": "feeChargePerProduct",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "initialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "seller",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sellerId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "productsCount",
            "type": "u64"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "contactInfo",
            "type": "string"
          },
          {
            "name": "registeredAt",
            "type": "u64"
          },
          {
            "name": "orderCount",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "sellerProductStock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sellerId",
            "type": "u64"
          },
          {
            "name": "sellerPda",
            "type": "pubkey"
          },
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productPda",
            "type": "pubkey"
          },
          {
            "name": "stockQuantity",
            "type": "u64"
          },
          {
            "name": "stockPrice",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transactionId",
            "type": "u64"
          },
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "role",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "factoryCount",
            "type": "u64"
          },
          {
            "name": "transactionCount",
            "type": "u64"
          },
          {
            "name": "warehouseCount",
            "type": "u64"
          },
          {
            "name": "logisticsCount",
            "type": "u64"
          },
          {
            "name": "sellerCount",
            "type": "u64"
          },
          {
            "name": "inspectorCount",
            "type": "u64"
          },
          {
            "name": "productCount",
            "type": "u64"
          },
          {
            "name": "isCustomer",
            "type": "bool"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "warehouse",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warehouseId",
            "type": "u64"
          },
          {
            "name": "factoryId",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "productId",
            "type": "u64"
          },
          {
            "name": "productPda",
            "type": "pubkey"
          },
          {
            "name": "productCount",
            "type": "u64"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "contactDetails",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "warehouseSize",
            "type": "u64"
          },
          {
            "name": "logisticCount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
